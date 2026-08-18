const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const Cruise = require('../models/Cruise');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const PromoRedemption = require('../models/PromoRedemption');
const { buildQuote, validatePassengers } = require('../services/pricingService');
const { validatePromoCode } = require('../services/promoService');

/**
 * POST /api/bookings
 *
 * Creates a confirmed booking using a MongoDB transaction for atomicity.
 *
 * Steps inside the transaction:
 *  1. Validate input
 *  2. Re-check cruise capacity
 *  3. Atomically decrement capacityLeft
 *  4. Find-or-create customer
 *  5. Validate promo (inside session for consistent usage counts)
 *  6. Build price quote
 *  7. Save booking
 *  8. Save promo redemption (if applicable)
 *  9. Commit
 *
 * Request body:
 * {
 *   cruiseId: string,
 *   customer: { name: string, email: string },
 *   ages: number[],
 *   services: { insurance: boolean, wifi: boolean, shoreExcursion: boolean },
 *   promoCode: string | null
 * }
 */
const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { cruiseId, customer, ages, services = {}, promoCode } = req.body;

    // ── Step 1: Basic input validation ───────────────────────────────────────
    if (!cruiseId || !customer || !customer.name || !customer.email || !ages) {
      const err = new Error('cruiseId, customer (name & email), and ages are required.');
      err.statusCode = 400;
      throw err;
    }

    validatePassengers(ages);

    // ── Step 2 & 3: Re-check and atomically decrement capacity ───────────────
    // Using findOneAndUpdate with $inc ensures no two concurrent bookings can
    // both pass the capacity check and over-sell the cruise.
    const cruise = await Cruise.findOneAndUpdate(
      {
        _id: cruiseId,
        capacityLeft: { $gte: ages.length }, // Capacity gate
      },
      { $inc: { capacityLeft: -ages.length } },
      { new: true, session }
    );

    if (!cruise) {
      // Could be: cruise not found, or capacity too low
      const existing = await Cruise.findById(cruiseId).session(session);
      if (!existing) {
        const err = new Error('Cruise not found.');
        err.statusCode = 404;
        throw err;
      }
      const err = new Error(
        existing.capacityLeft === 0
          ? 'This cruise is sold out.'
          : `Only ${existing.capacityLeft} spot(s) remaining. You requested ${ages.length}.`
      );
      err.statusCode = 409;
      err.code = 'INSUFFICIENT_CAPACITY';
      throw err;
    }

    // ── Step 4: Find-or-create customer ─────────────────────────────────────
    let customerDoc = await Customer.findOne({ email: customer.email.toLowerCase() }).session(
      session
    );

    if (!customerDoc) {
      const newCustomers = await Customer.create([{ name: customer.name, email: customer.email }], {
        session,
      });
      customerDoc = newCustomers[0];
    }

    // ── Step 5: Validate promo inside the session ────────────────────────────
    let resolvedPromo = null;

    if (promoCode && promoCode.trim()) {
      // Preliminary subtotal for minimum spend check
      const prelimQuote = await buildQuoteAsync(cruise, ages, services, null);
      const subtotalBeforePromo =
        prelimQuote.pricing.cruiseFare -
        prelimQuote.pricing.groupDiscount +
        prelimQuote.pricing.servicesTotal;

      const promoResult = await validatePromoCode(
        promoCode,
        customerDoc._id,
        subtotalBeforePromo,
        session
      );

      if (!promoResult.valid) {
        const err = new Error(promoResult.message);
        err.statusCode = 422;
        err.code = promoResult.reason;
        throw err;
      }

      resolvedPromo = promoResult.promo;
    }

    // ── Step 6: Build the authoritative price quote ──────────────────────────
    const quote = await buildQuoteAsync(cruise, ages, services, resolvedPromo);

    // ── Step 7: Generate unique booking reference ────────────────────────────
    const reference = `BK-${nanoid(7).toUpperCase()}`;

    // ── Step 8: Create the booking document ─────────────────────────────────
    const [booking] = await Booking.create(
      [
        {
          reference,
          customerId: customerDoc._id,
          cruiseId: cruise._id,
          passengers: quote.passengers,
          services: quote.services,
          pricing: quote.pricing,
          pricingSnapshot: quote.pricingSnapshot,
          promoCodeUsed: resolvedPromo ? resolvedPromo.code : null,
        },
      ],
      { session }
    );

    // ── Step 9: Record promo redemption ──────────────────────────────────────
    if (resolvedPromo) {
      await PromoRedemption.create(
        [
          {
            promoCodeId: resolvedPromo._id,
            bookingId: booking._id,
            customerId: customerDoc._id,
          },
        ],
        { session }
      );
    }

    // ── Commit ────────────────────────────────────────────────────────────────
    await session.commitTransaction();

    // Populate for response
    const fullBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email')
      .populate('cruiseId', 'cruiseLine ship destination nights adultFare');

    res.status(201).json({ success: true, data: fullBooking });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * GET /api/bookings/:reference
 *
 * Retrieves a booking by its unique reference code (e.g. BK-ABC1234).
 */
const getBookingByReference = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      reference: req.params.reference.toUpperCase(),
    })
      .populate('customerId', 'name email')
      .populate('cruiseId', 'cruiseLine ship destination nights adultFare');

    if (!booking) {
      const err = new Error(`No booking found with reference "${req.params.reference}".`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getBookingByReference };
