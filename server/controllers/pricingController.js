const Cruise = require('../models/Cruise');
const { buildQuoteAsync, getPricingRules, validatePassengers } = require('../services/pricingService');
const { validatePromoCode } = require('../services/promoService');

/**
 * POST /api/pricing/quote
 *
 * Calculates a full price quote without creating a booking.
 * All pricing is dynamically calculated via the central pricingService using MongoDB rules.
 *
 * Request body:
 * {
 *   cruiseId: string,
 *   ages: number[],
 *   services: { insurance: boolean, wifi: boolean, shoreExcursion: boolean },
 *   promoCode: string | null,
 *   customerId: string | null   (optional – for per-customer promo limit check)
 * }
 */
const getQuote = async (req, res, next) => {
  try {
    const { cruiseId, ages, services = {}, promoCode, customerId } = req.body;

    if (!cruiseId) {
      const err = new Error('cruiseId is required.');
      err.statusCode = 400;
      return next(err);
    }

    // 1. Load the cruise
    const cruise = await Cruise.findById(cruiseId);
    if (!cruise) {
      const err = new Error('Cruise not found.');
      err.statusCode = 404;
      return next(err);
    }

    // 2. Validate passengers early (before DB calls) to give quick feedback
    validatePassengers(ages);

    // 3. Check capacity
    if (cruise.capacityLeft < ages.length) {
      const err = new Error(
        cruise.capacityLeft === 0
          ? 'This cruise is sold out.'
          : `Only ${cruise.capacityLeft} spot(s) remaining on this cruise.`
      );
      err.statusCode = 409;
      err.code = 'INSUFFICIENT_CAPACITY';
      return next(err);
    }

    // 4. Resolve promo (optional)
    let resolvedPromo = null;
    let promoValidation = null;

    if (promoCode && promoCode.trim()) {
      // Get a preliminary subtotal (without promo) to check minimum spend
      const prelimQuote = await buildQuoteAsync(cruise, ages, services, null);
      const subtotalBeforePromo =
        prelimQuote.pricing.cruiseFare -
        prelimQuote.pricing.groupDiscount +
        prelimQuote.pricing.servicesTotal;

      promoValidation = await validatePromoCode(promoCode, customerId, subtotalBeforePromo);

      if (promoValidation.valid) {
        resolvedPromo = promoValidation.promo;
      }
    }

    // 5. Build the full quote using central pricing service & MongoDB rules
    const quote = await buildQuoteAsync(cruise, ages, services, resolvedPromo);

    res.json({
      success: true,
      data: {
        cruise: {
          _id: cruise._id,
          cruiseLine: cruise.cruiseLine,
          ship: cruise.ship,
          destination: cruise.destination,
          nights: cruise.nights,
        },
        ...quote,
        promoValidation: promoValidation
          ? {
              applied: promoValidation.valid,
              reason: promoValidation.valid ? null : promoValidation.reason,
              message: promoValidation.valid ? null : promoValidation.message,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/pricing/rules
 * Returns active pricing rules and optional service rates from MongoDB.
 */
const getRules = async (req, res, next) => {
  try {
    const rules = await getPricingRules();
    res.json({ success: true, data: rules });
  } catch (error) {
    next(error);
  }
};

module.exports = { getQuote, getRules };
