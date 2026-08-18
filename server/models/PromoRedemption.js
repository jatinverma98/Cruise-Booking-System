const mongoose = require('mongoose');

/**
 * PromoRedemption tracks every individual redemption of each promo code.
 * Counting documents in this collection is the authoritative source of truth for:
 *   - Total global uses of a promotional code (maxTotalUses)
 *   - Total uses of a promotional code by a specific customer (maxUsesPerCustomer)
 */
const promoRedemptionSchema = new mongoose.Schema(
  {
    promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for instant per-customer usage count queries
promoRedemptionSchema.index({ promoCodeId: 1, customerId: 1 });

module.exports = mongoose.model('PromoRedemption', promoRedemptionSchema);
