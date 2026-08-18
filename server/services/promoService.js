const PromoCode = require('../models/PromoCode');
const PromoRedemption = require('../models/PromoRedemption');

/**
 * promoService.js
 *
 * Responsible for validating promotional codes and checking usage limits.
 * Uses PromoRedemption documents as the source of truth for usage counts.
 */

/**
 * Validate a promotional code against all business rules.
 *
 * @param {string} code          - Promo code entered by customer
 * @param {string|null} customerId - MongoDB ObjectId of the customer (or null if unknown)
 * @param {number} subtotal      - Booking subtotal before promo (for minimum spend check)
 * @param {object} [session]     - Optional Mongoose session for transaction support
 *
 * @returns {{ valid: true, promo: PromoCodeDocument }}
 *       or { valid: false, reason: string, message: string }
 */
const validatePromoCode = async (code, customerId, subtotal, session = null) => {
  if (!code || !code.trim()) {
    return {
      valid: false,
      reason: 'NO_CODE',
      message: 'No promotional code provided.',
    };
  }

  const upperCode = code.trim().toUpperCase();

  // 1. Does the code exist?
  const promo = await PromoCode.findOne({ code: upperCode }).session(session);
  if (!promo) {
    return {
      valid: false,
      reason: 'INVALID_CODE',
      message: `Promotional code "${upperCode}" is not valid.`,
    };
  }

  const now = new Date();

  // 2. Has the validity window started?
  if (now < promo.validFrom) {
    return {
      valid: false,
      reason: 'NOT_YET_VALID',
      message: `Promotional code "${upperCode}" is not yet active.`,
    };
  }

  // 3. Has the code expired?
  // Set validTo to end of day for inclusive date comparison
  const validToEndOfDay = new Date(promo.validTo);
  validToEndOfDay.setHours(23, 59, 59, 999);

  if (now > validToEndOfDay) {
    return {
      valid: false,
      reason: 'EXPIRED',
      message: `Promotional code "${upperCode}" has expired.`,
    };
  }

  // 4. Has total usage limit been reached?
  if (promo.maxTotalUses !== null) {
    const totalUses = await PromoRedemption.countDocuments({ promoCodeId: promo._id }).session(
      session
    );
    if (totalUses >= promo.maxTotalUses) {
      return {
        valid: false,
        reason: 'TOTAL_USAGE_LIMIT_REACHED',
        message: `Promotional code "${upperCode}" has reached its maximum usage limit.`,
      };
    }
  }

  // 5. Has the per-customer usage limit been reached?
  if (customerId && promo.maxUsesPerCustomer !== null) {
    const customerUses = await PromoRedemption.countDocuments({
      promoCodeId: promo._id,
      customerId,
    }).session(session);

    if (customerUses >= promo.maxUsesPerCustomer) {
      return {
        valid: false,
        reason: 'CUSTOMER_USAGE_LIMIT_REACHED',
        message: `You have already used promotional code "${upperCode}" the maximum number of times.`,
      };
    }
  }

  // 6. Does the booking meet minimum spend?
  if (promo.minimumSpend && subtotal < promo.minimumSpend) {
    return {
      valid: false,
      reason: 'MINIMUM_SPEND_NOT_MET',
      message: `A minimum spend of $${promo.minimumSpend} is required to use this promotional code.`,
    };
  }

  return { valid: true, promo };
};

module.exports = { validatePromoCode };
