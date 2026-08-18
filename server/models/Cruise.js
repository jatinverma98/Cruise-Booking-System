const mongoose = require('mongoose');

const cruiseSchema = new mongoose.Schema(
  {
    cruiseLine: {
      type: String,
      required: [true, 'Cruise line is required.'],
      trim: true,
    },
    ship: {
      type: String,
      required: [true, 'Ship name is required.'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required.'],
      trim: true,
    },
    nights: {
      type: Number,
      required: [true, 'Number of nights is required.'],
      min: [1, 'Duration must be at least 1 night.'],
    },
    adultFare: {
      type: Number,
      required: [true, 'Adult fare is required.'],
      min: [0, 'Adult fare cannot be negative.'],
    },
    /**
     * capacityLeft tracks available spots.
     * It is decremented atomically during booking using findOneAndUpdate with $inc.
     * This prevents overselling under concurrent requests.
     */
    capacityLeft: {
      type: Number,
      required: [true, 'Capacity is required.'],
      min: [0, 'Capacity cannot be negative.'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cruise', cruiseSchema);
