/**
 * priceConsistency.test.js
 *
 * Automated tests for Functional Requirement 9:
 * "Price shown before confirmation must equal charged price.
 * The server must be the authority.
 * Never trust client-submitted totals.
 * Detect stale quotes with QUOTE_EXPIRED."
 *
 * Run: cd server && npm test
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Cruise = require('../models/Cruise');
const Booking = require('../models/Booking');
const PricingRule = require('../models/PricingRule');

describe('Functional Requirement 9: Price Consistency & Stale Quote Detection', () => {
  let cruise;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  beforeEach(async () => {
    cruise = await Cruise.create({
      cruiseLine: 'Consistency Cruises',
      ship: 'Authority Ocean',
      destination: 'Caribbean',
      nights: 7,
      adultFare: 99999,
      capacityLeft: 20,
    });
  });

  afterEach(async () => {
    if (cruise) {
      await Booking.deleteMany({ cruiseId: cruise._id });
      await Cruise.deleteOne({ _id: cruise._id });
    }
    // Restore default pricing rules in DB
    await PricingRule.updateOne(
      { key: 'default' },
      {
        taxRate: 0.12,
        servicePrices: { insurance: 6700, wifi: 1260, shoreExcursion: 10000 },
      }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('POST /api/pricing/quote and POST /api/bookings calculate identical price totals', async () => {
    const quotePayload = {
      cruiseId: cruise._id.toString(),
      ages: [30, 28, 8],
      services: { insurance: true, wifi: true, shoreExcursion: false },
      promoCode: null,
    };

    // 1. Get quote
    const quoteRes = await request(app).post('/api/pricing/quote').send(quotePayload);
    expect(quoteRes.status).toBe(200);
    const quoteData = quoteRes.body.data;
    const quotedTotal = quoteData.pricing.total;
    const quoteHash = quoteData.pricingHash || quoteData.quoteHash;
    expect(quoteHash).toBeDefined();

    // 2. Create booking using the quote
    const bookingRes = await request(app).post('/api/bookings').send({
      ...quotePayload,
      customer: { name: 'Consistent User', email: 'user@consistent.com' },
      quoteHash,
      expectedTotal: quotedTotal,
    });

    expect(bookingRes.status).toBe(201);
    const bookingData = bookingRes.body.data;

    // Confirmed total must exactly equal displayed quote total
    expect(bookingData.pricing.total).toBe(quotedTotal);
    expect(bookingData.pricing.cruiseFare).toBe(quoteData.pricing.cruiseFare);
    expect(bookingData.pricing.tax).toBe(quoteData.pricing.tax);
  });

  test('Backend ignores any client-submitted total (e.g. total: 999) and calculates its own authoritative amount', async () => {
    const bookingRes = await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'Hacker Attempt', email: 'hack@test.com' },
      ages: [30],
      services: {},
      total: 999, // Tampered client total
      pricing: { total: 1 }, // Tampered pricing payload
    });

    expect(bookingRes.status).toBe(201);
    const bookingData = bookingRes.body.data;

    // Server must NOT have stored 999 or 1
    expect(bookingData.pricing.total).toBeGreaterThan(50000);
    expect(bookingData.pricing.cruiseFare).toBe(99999);
  });

  test('Stale Quote Detection: If cruise base fare changes before confirmation, booking is rejected with QUOTE_EXPIRED', async () => {
    // 1. Get initial quote
    const quoteRes = await request(app).post('/api/pricing/quote').send({
      cruiseId: cruise._id.toString(),
      ages: [30],
      services: {},
    });
    const quoteData = quoteRes.body.data;
    const originalHash = quoteData.pricingHash || quoteData.quoteHash;

    // 2. Simulate price change before booking confirmation
    await Cruise.updateOne({ _id: cruise._id }, { adultFare: 120000 });

    // 3. Client attempts to confirm with old quoteHash
    const bookingRes = await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'Stale User', email: 'stale@test.com' },
      ages: [30],
      quoteHash: originalHash,
      expectedTotal: quoteData.pricing.total,
    });

    expect(bookingRes.status).toBe(409);
    expect(bookingRes.body.reason).toBe('QUOTE_EXPIRED');
    expect(bookingRes.body.message).toContain('Pricing has changed');
  });
});
