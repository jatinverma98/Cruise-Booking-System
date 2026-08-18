const crypto = require('crypto');
const mongoose = require('mongoose');

const Cruise = require('../models/Cruise');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const PromoRedemption = require('../models/PromoRedemption');
const { buildQuoteAsync, validatePassengers } = require('../services/pricingService');
const { validatePromoCode } = require('../services/promoService');

let isReplicaSet = null;

/**
 * Detect whether the active MongoDB deployment supports multi-document transactions.
 */
const supportsTransactions = async () => {
  if (isReplicaSet !== null) return isReplicaSet;
  try {
    const s = await mongoose.startSession();
    try {
      s.startTransaction();
      await Cruise.findOne({}).session(s);
      await s.abortTransaction();
      isReplicaSet = true;
    } catch {
      isReplicaSet = false;
    } finally {
      s.endSession();
    }
  } catch {
    isReplicaSet = false;
  }
  return isReplicaSet;
};

/**
 * Generates a unique, formatted booking reference.
 * Format: ODY-YYYYMMDD-XXXXXX (e.g. ODY-20260818-A7F42C)
 */
const generateBookingReference = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 hex chars
  return `ODY-${dateStr}-${randomSuffix}`;
};

/**
 * POST /api/bookings
 *
 * Creates a permanent, confirmed Booking document with a unique booking reference.
 *
 * Preferred approach:
 * START TRANSACTION (where supported by MongoDB deployment)
 * 1. Validate passengers
 * 2. Fetch cruise
 * 3. Atomically decrement capacity only if enough capacity exists ({ capacityLeft: { $gte: count } })
 * 4. Validate promo usage
 * 5. Calculate final price (Server is the sole authority; never trusts client-submitted totals)
 * 6. Detect stale quotes if pricing changed (QUOTE_EXPIRED)
 * 7. Create booking
 * 8. Create promo redemption
 * 9. COMMIT (or ROLLBACK on any failure)
 */
const createBooking = async (req, res, next) => {
  let session = null;
  const useTx = await supportsTransactions();

  if (useTx) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  let capacityDecremented = false;
  let cruiseDoc = null;

  try {
    const { cruiseId, customer, ages, services = {}, promoCode, quoteHash, pricingHash, expectedTotal } = req.body;

    // ── Step 1: Validate passengers ──────────────────────────────────────────
    if (!cruiseId || !customer || !customer.name || !customer.email || !ages) {
      const err = new Error('cruiseId, customer (name & email), and ages are required.');
      err.statusCode = 400;
      throw err;
    }

    validatePassengers(ages);

    // ── Step 2 & 3: Atomically decrement capacity only if enough capacity exists
    const query = {
      _id: cruiseId,
      capacityLeft: { $gte: ages.length },
    };
    const update = { $inc: { capacityLeft: -ages.length } };
    const options = { new: true };
    if (useTx) options.session = session;

    cruiseDoc = await Cruise.findOneAndUpdate(query, update, options);

    if (!cruiseDoc) {
      const existingQuery = Cruise.findById(cruiseId);
      if (useTx) existingQuery.session(session);
      const existing = await existingQuery;

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

    capacityDecremented = true;

    // ── Step 4: Find-or-create customer ─────────────────────────────────────
    const custFindQuery = Customer.findOne({ email: customer.email.toLowerCase() });
    if (useTx) custFindQuery.session(session);
    let customerDoc = await custFindQuery;

    if (!customerDoc) {
      if (useTx) {
        const newCustomers = await Customer.create(
          [{ name: customer.name.trim(), email: customer.email.trim() }],
          { session }
        );
        customerDoc = newCustomers[0];
      } else {
        customerDoc = await Customer.create({
          name: customer.name.trim(),
          email: customer.email.trim(),
        });
      }
    }

    // ── Step 5: Validate promo usage ────────────────────────────────────────
    let resolvedPromo = null;

    if (promoCode && promoCode.trim()) {
      const prelimQuote = await buildQuoteAsync(cruiseDoc, ages, services, null);
      const subtotalBeforePromo =
        prelimQuote.pricing.cruiseFare -
        prelimQuote.pricing.groupDiscount +
        prelimQuote.pricing.servicesTotal;

      const promoResult = await validatePromoCode(
        promoCode,
        customerDoc._id,
        subtotalBeforePromo,
        useTx ? session : null
      );

      if (!promoResult.valid) {
        const err = new Error(promoResult.message);
        err.statusCode = 422;
        err.code = promoResult.reason;
        err.reason = promoResult.reason;
        throw err;
      }

      resolvedPromo = promoResult.promo;
    }

    // ── Step 6: Calculate final price on server (Backend is the sole authority)
    const quote = await buildQuoteAsync(cruiseDoc, ages, services, resolvedPromo);

    // ── Check for stale quote if quoteHash/pricingHash/expectedTotal was supplied ─
    const clientHash = quoteHash || pricingHash;
    if (clientHash && clientHash !== quote.pricingHash) {
      const err = new Error('Pricing has changed. Please request a new quote.');
      err.statusCode = 409;
      err.code = 'QUOTE_EXPIRED';
      err.reason = 'QUOTE_EXPIRED';
      throw err;
    }

    if (expectedTotal !== undefined && expectedTotal !== null) {
      if (Math.abs(Number(expectedTotal) - quote.pricing.total) > 0.01) {
        const err = new Error('Pricing has changed. Please request a new quote.');
        err.statusCode = 409;
        err.code = 'QUOTE_EXPIRED';
        err.reason = 'QUOTE_EXPIRED';
        throw err;
      }
    }

    // ── Step 7: Generate unique booking reference (e.g. ODY-20260818-A7F42C) ─
    let reference = generateBookingReference();

    // Ensure collision resistance
    let collision = await Booking.findOne({ reference });
    while (collision) {
      reference = generateBookingReference();
      collision = await Booking.findOne({ reference });
    }

    // ── Step 8: Create booking document with server-calculated amounts ───────
    const bookingData = {
      reference,
      customerId: customerDoc._id,
      cruiseId: cruiseDoc._id,
      passengers: quote.passengers,
      services: quote.services,
      pricing: quote.pricing, // Authoritative calculated amount saved
      pricingSnapshot: quote.pricingSnapshot,
      promoCodeUsed: resolvedPromo ? resolvedPromo.code : null,
    };

    let booking;
    if (useTx) {
      const [b] = await Booking.create([bookingData], { session });
      booking = b;
    } else {
      booking = await Booking.create(bookingData);
    }

    // ── Step 9: Create promo redemption (if applicable) ─────────────────────
    if (resolvedPromo) {
      const redemptionData = {
        promoCodeId: resolvedPromo._id,
        bookingId: booking._id,
        customerId: customerDoc._id,
      };
      if (useTx) {
        await PromoRedemption.create([redemptionData], { session });
      } else {
        await PromoRedemption.create(redemptionData);
      }
    }

    // ── Step 10: COMMIT ─────────────────────────────────────────────────────
    if (useTx) {
      await session.commitTransaction();
    }

    // Populate response
    const fullBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email')
      .populate('cruiseId', 'cruiseLine ship destination nights adultFare');

    res.status(201).json({
      success: true,
      reference: fullBooking.reference,
      data: fullBooking,
    });
  } catch (error) {
    if (useTx && session) {
      try {
        await session.abortTransaction();
      } catch {
        // Ignored
      }
    } else if (capacityDecremented && cruiseDoc) {
      // Compensating rollback for standalone environments
      try {
        await Cruise.updateOne(
          { _id: cruiseDoc._id },
          { $inc: { capacityLeft: req.body.ages.length } }
        );
      } catch {
        // Ignored
      }
    }
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

/**
 * GET /api/bookings/:reference
 *
 * Retrieves a booking by its unique reference code (e.g. ODY-20260818-A7F42C).
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

module.exports = { createBooking, getBookingByReference, generateBookingReference };
