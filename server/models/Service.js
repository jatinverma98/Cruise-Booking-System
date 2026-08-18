const mongoose = require('mongoose');

/**
 * Service Model
 * Stores configurable optional services and rates in MongoDB.
 * Changing service prices or descriptions here takes effect immediately
 * without requiring any code changes or redeployments.
 */
const serviceSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Service key is required.'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required.'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Service price is required.'],
      min: [0, 'Service price cannot be negative.'],
    },
    pricingUnit: {
      type: String,
      enum: ['per_passenger', 'per_passenger_per_night'],
      default: 'per_passenger',
    },
    icon: {
      type: String,
      default: '✨',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
