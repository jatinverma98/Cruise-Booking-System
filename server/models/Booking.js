const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    age: { type: Number, required: true, min: 0, max: 120 },
    fareType: { type: String, enum: ['adult', 'child', 'free'], required: true },
    fareAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const servicesSchema = new mongoose.Schema(
  {
    insurance: { type: Boolean, default: false },
    wifi: { type: Boolean, default: false },
    shoreExcursion: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Stores the actual calculated amounts at booking time.
 */
const pricingSchema = new mongoose.Schema(
  {
    cruiseFare: { type: Number, required: true },
    groupDiscount: { type: Number, required: true },
    promotionalDiscount: { type: Number, required: true },
    services: {
      insurance: { type: Number, default: 0 },
      wifi: { type: Number, default: 0 },
      shoreExcursion: { type: Number, default: 0 },
    },
    servicesTotal: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const promoSnapshotSchema = new mongoose.Schema(
  {
    code: { type: String },
    type: { type: String },
    value: { type: Number },
  },
  { _id: false }
);

/**
 * pricingSnapshot stores the exact rates and rules used at booking time.
 * This guarantees that historical bookings can always be reconstructed perfectly
 * even if adult fares, service costs, tax rates, or promo rules change in the future.
 */
const pricingSnapshotSchema = new mongoose.Schema(
  {
    adultFare: { type: Number, required: true },
    childFareRules: {
      type: Map,
      of: Number,
      required: true,
    },
    groupDiscountRules: {
      type: Map,
      of: Number,
      required: true,
    },
    servicePrices: {
      insurance: { type: Number, required: true },
      wifi: { type: Number, required: true },
      shoreExcursion: { type: Number, required: true },
    },
    taxRate: { type: Number, required: true },
    promo: {
      type: promoSnapshotSchema,
      default: null,
    },
    promoSnapshot: {
      type: promoSnapshotSchema,
      default: null,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    cruiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cruise',
      required: true,
    },
    passengers: {
      type: [passengerSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 6,
        message: 'A booking must have between 1 and 6 passengers.',
      },
    },
    services: { type: servicesSchema, default: {} },
    pricing: { type: pricingSchema, required: true },
    pricingSnapshot: { type: pricingSnapshotSchema, required: true },
    promoCodeUsed: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
