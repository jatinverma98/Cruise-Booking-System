const Cruise = require('../models/Cruise');

/**
 * Serialises a Mongoose cruise document into the public API shape.
 * The `available` flag is computed SERVER-SIDE from capacityLeft so the
 * frontend never needs to decide availability — the backend is the source of truth.
 *
 * @param {import('../models/Cruise')} doc
 * @returns {object}
 */
const serializeCruise = (doc) => ({
  _id: doc._id,
  cruiseLine: doc.cruiseLine,
  ship: doc.ship,
  destination: doc.destination,
  nights: doc.nights,
  adultFare: doc.adultFare,
  capacityLeft: doc.capacityLeft,
  /** true  → bookable; false → sold out / unavailable */
  available: doc.capacityLeft > 0,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

/**
 * GET /api/cruises
 * Returns all cruises. Supports optional query filters:
 *   - destination (case-insensitive partial match)
 *   - minNights
 *   - maxNights
 *   - maxFare
 */
const getAllCruises = async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.destination) {
      filter.destination = { $regex: req.query.destination, $options: 'i' };
    }
    if (req.query.minNights) {
      filter.nights = { ...filter.nights, $gte: Number(req.query.minNights) };
    }
    if (req.query.maxNights) {
      filter.nights = { ...filter.nights, $lte: Number(req.query.maxNights) };
    }
    if (req.query.maxFare) {
      filter.adultFare = { $lte: Number(req.query.maxFare) };
    }

    const cruises = await Cruise.find(filter).sort({ adultFare: 1 });
    res.json({ success: true, data: cruises.map(serializeCruise) });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/cruises/:id
 * Returns a single cruise by MongoDB _id.
 */
const getCruiseById = async (req, res, next) => {
  try {
    const cruise = await Cruise.findById(req.params.id);
    if (!cruise) {
      const err = new Error('Cruise not found.');
      err.statusCode = 404;
      return next(err);
    }
    res.json({ success: true, data: serializeCruise(cruise) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllCruises, getCruiseById };
