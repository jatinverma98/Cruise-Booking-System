const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    taxRate: {
      type: Number,
      required: true,
      default: 0.12, // 12%
    },
    childFareRules: {
      type: Map,
      of: Number,
      default: {
        '0-4': 0,      // Free
        '5-11': 0.5,   // 50%
        '12-17': 0.75, // 75%
        '18+': 1.0,    // 100%
      },
    },
    groupDiscountRules: {
      type: Map,
      of: Number,
      default: {
        '1-2': 0,    // 0%
        '3-4': 0.05, // 5%
        '5-6': 0.10, // 10%
      },
    },
    servicePrices: {
      insurance: {
        type: Number,
        required: true,
        default: 6700, // ₹6,700 per passenger
      },
      wifi: {
        type: Number,
        required: true,
        default: 1260, // ₹1,260 per passenger per night
      },
      shoreExcursion: {
        type: Number,
        required: true,
        default: 10000, // ₹10,000 per passenger
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingRule', pricingRuleSchema);
