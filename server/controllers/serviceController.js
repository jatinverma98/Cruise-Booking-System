const Service = require('../models/Service');

/**
 * GET /api/services
 * Returns all active optional services and current pricing units from MongoDB.
 */
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/services/:key
 * Updates service price or details directly in MongoDB without code changes.
 */
const updateService = async (req, res, next) => {
  try {
    const { price, name, description, icon, isActive } = req.body;
    const service = await Service.findOneAndUpdate(
      { key: req.params.key },
      { $set: { ...(price !== undefined && { price }), name, description, icon, isActive } },
      { new: true, runValidators: true }
    );
    if (!service) {
      const err = new Error(`Service with key "${req.params.key}" not found.`);
      err.statusCode = 404;
      throw err;
    }
    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

module.exports = { getServices, updateService };
