const express = require('express');
const cors = require('cors');
require('dotenv').config();

const cruiseRoutes = require('./routes/cruiseRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const promoRoutes = require('./routes/promoRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/cruises', cruiseRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Cruise Booking API is running.' });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
