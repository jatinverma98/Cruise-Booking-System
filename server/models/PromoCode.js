const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Promo code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Promo type must be percentage or fixed.'],
    },
    value: {
      type: Number,
      required: [true, 'Promo value is required.'],
      min: [0, 'Promo value cannot be negative.'],
    },
    validFrom: {
      type: Date,
      required: [true, 'Valid from date is required.'],
    },
    validTo: {
      type: Date,
      required: [true, 'Valid to date is required.'],
    },
    maxTotalUses: {
      type: Number,
      default: null, // null = unlimited
    },
    maxUsesPerCustomer: {
      type: Number,
      default: null, // null = unlimited
    },
    minimumSpend: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromoCode', promoCodeSchema);
