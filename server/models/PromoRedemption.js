const mongoose = require('mongoose');

/**
 * PromoRedemption tracks individual usage events for each promo code.
 * Counting documents in this collection is the source of truth for:
 *   - total uses of a promo code
 *   - uses of a promo code by a specific customer
 *
 * This is more reliable than a simple counter field which could become
 * inconsistent under concurrent requests.
 */
const promoRedemptionSchema = new mongoose.Schema(
  {
    promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PromoCode',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromoRedemption', promoRedemptionSchema);
