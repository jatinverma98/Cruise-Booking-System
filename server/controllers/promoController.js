const { validatePromoCode } = require('../services/promoService');
const { buildQuoteAsync } = require('../services/pricingService');
const Cruise = require('../models/Cruise');

/**
 * POST /api/promos/validate
 *
 * Validates a promotional code against all business rules.
 *
 * Request body:
 * {
 *   code: string,
 *   customerId?: string | null,
 *   cruiseId?: string,
 *   ages?: number[],
 *   services?: object
 * }
 */
const validatePromo = async (req, res, next) => {
  try {
    const { code, customerId, cruiseId, ages, services = {} } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        valid: false,
        reason: 'PROMO_NOT_FOUND',
        message: 'Promo code is required.',
        data: {
          valid: false,
          reason: 'PROMO_NOT_FOUND',
          message: 'Promo code is required.',
        },
      });
    }

    let subtotal = 0;

    // Calculate subtotal if cruise info is provided (for minimum spend check)
    if (cruiseId && Array.isArray(ages) && ages.length > 0) {
      const cruise = await Cruise.findById(cruiseId);
      if (cruise) {
        const quote = await buildQuoteAsync(cruise, ages, services, null);
        subtotal =
          quote.pricing.cruiseFare -
          quote.pricing.groupDiscount +
          quote.pricing.servicesTotal;
      }
    }

    const result = await validatePromoCode(code, customerId, subtotal);

    if (result.valid) {
      return res.json({
        success: true,
        valid: true,
        data: {
          valid: true,
          promo: {
            code: result.promo.code,
            type: result.promo.type,
            value: result.promo.value,
          },
        },
        promo: {
          code: result.promo.code,
          type: result.promo.type,
          value: result.promo.value,
        },
      });
    }

    return res.json({
      success: true,
      valid: false,
      reason: result.reason,
      message: result.message,
      data: {
        valid: false,
        reason: result.reason,
        message: result.message,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { validatePromo };
