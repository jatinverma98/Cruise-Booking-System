const PromoCode = require('../models/PromoCode');
const PromoRedemption = require('../models/PromoRedemption');

/**
 * promoService.js
 *
 * Central service responsible for validating promotional codes and enforcing business rules.
 * Uses PromoRedemption collection as the single source of truth for usage limits.
 */

/**
 * Validate a promotional code against all business rules.
 *
 * Supported rejection reasons:
 *  - PROMO_NOT_FOUND
 *  - PROMO_NOT_STARTED
 *  - PROMO_EXPIRED
 *  - PROMO_TOTAL_LIMIT_REACHED
 *  - PROMO_CUSTOMER_LIMIT_REACHED
 *  - PROMO_MINIMUM_SPEND_NOT_MET
 *
 * @param {string} code          - Promo code entered by customer
 * @param {string|null} customerId - MongoDB ObjectId of customer (or null if guest/quote)
 * @param {number} subtotal      - Booking subtotal before promo (for minimum spend check)
 * @param {object} [session]     - Optional Mongoose session for transaction support
 *
 * @returns {Promise<{ valid: true, promo: object } | { valid: false, reason: string, message: string }>}
 */
const validatePromoCode = async (code, customerId, subtotal = 0, session = null) => {
  if (!code || !code.trim()) {
    return {
      valid: false,
      reason: 'PROMO_NOT_FOUND',
      message: 'No promotional code provided.',
    };
  }

  const upperCode = code.trim().toUpperCase();

  // 1. Code exists
  const promo = await PromoCode.findOne({ code: upperCode }).session(session);
  if (!promo) {
    return {
      valid: false,
      reason: 'PROMO_NOT_FOUND',
      message: `Promotional code "${upperCode}" was not found.`,
    };
  }

  const now = new Date();

  // 2. Current booking date is within validFrom
  if (now < promo.validFrom) {
    return {
      valid: false,
      reason: 'PROMO_NOT_STARTED',
      message: `Promotional code "${upperCode}" is not yet active.`,
    };
  }

  // 3. Current booking date is within validTo
  const validToEndOfDay = new Date(promo.validTo);
  validToEndOfDay.setHours(23, 59, 59, 999);

  if (now > validToEndOfDay) {
    return {
      valid: false,
      reason: 'PROMO_EXPIRED',
      message: 'This promotional code has expired.',
    };
  }

  // 4. Total usage limit has not been reached
  if (promo.maxTotalUses !== null && promo.maxTotalUses !== undefined) {
    const totalUses = await PromoRedemption.countDocuments({ promoCodeId: promo._id }).session(
      session
    );
    if (totalUses >= promo.maxTotalUses) {
      return {
        valid: false,
        reason: 'PROMO_TOTAL_LIMIT_REACHED',
        message: `Promotional code "${upperCode}" has reached its maximum total usage limit.`,
      };
    }
  }

  // 5. Customer usage limit has not been reached
  if (customerId && promo.maxUsesPerCustomer !== null && promo.maxUsesPerCustomer !== undefined) {
    const customerUses = await PromoRedemption.countDocuments({
      promoCodeId: promo._id,
      customerId,
    }).session(session);

    if (customerUses >= promo.maxUsesPerCustomer) {
      return {
        valid: false,
        reason: 'PROMO_CUSTOMER_LIMIT_REACHED',
        message: `You have already redeemed promotional code "${upperCode}" the maximum allowed number of times.`,
      };
    }
  }

  // 6. Minimum spend is satisfied
  if (promo.minimumSpend && subtotal < promo.minimumSpend) {
    return {
      valid: false,
      reason: 'PROMO_MINIMUM_SPEND_NOT_MET',
      message: `A minimum spend of ₹${promo.minimumSpend.toLocaleString('en-IN')} is required to use this promotional code.`,
    };
  }

  return { valid: true, promo };
};

module.exports = { validatePromoCode };
