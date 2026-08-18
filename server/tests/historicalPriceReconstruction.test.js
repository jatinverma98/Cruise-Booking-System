/**
 * historicalPriceReconstruction.test.js
 *
 * Automated tests for Functional Requirement 8:
 * "Historical price must always be reconstructable.
 * The system must NOT depend on current pricing rules to display an old booking."
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
const { reconstructHistoricalPrice } = require('../services/pricingService');

describe('Functional Requirement 8: Historical Price Reconstruction & Snapshot Immutability', () => {
  let cruise;
  let historicalBooking;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  beforeEach(async () => {
    // 1. Create a cruise with original adult fare = 100,000
    cruise = await Cruise.create({
      cruiseLine: 'Heritage Cruises',
      ship: 'Immutable Voyager',
      destination: 'Mediterranean',
      nights: 7,
      adultFare: 100000,
      capacityLeft: 10,
    });

    // 2. Create a confirmed booking with 2 passengers + insurance + wifi
    const createRes = await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'Captain Ahab', email: 'ahab@voyage.com' },
      ages: [45, 10], // 1 adult (100k) + 1 child (50k)
      services: { insurance: true, wifi: true, shoreExcursion: false },
      promoCode: null,
    });

    expect(createRes.status).toBe(201);
    historicalBooking = createRes.body.data;
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

  test('Booking stores complete pricing snapshot and actual calculated amounts', async () => {
    const booking = await Booking.findOne({ reference: historicalBooking.reference });

    // Verify actual calculated amounts stored
    expect(booking.pricing.cruiseFare).toBe(150000);
    expect(booking.pricing.groupDiscount).toBe(0);
    expect(booking.pricing.servicesTotal).toBeGreaterThan(0);
    expect(booking.pricing.subtotal).toBeGreaterThan(0);
    expect(booking.pricing.tax).toBeGreaterThan(0);
    expect(booking.pricing.total).toBeGreaterThan(0);

    // Verify complete snapshot stored
    const snapshot = booking.pricingSnapshot;
    expect(snapshot.adultFare).toBe(100000);
    expect(snapshot.taxRate).toBe(0.12);
    expect(snapshot.servicePrices.insurance).toBe(6700);
    expect(snapshot.servicePrices.wifi).toBe(1260);
    expect(snapshot.servicePrices.shoreExcursion).toBe(10000);
  });

  test('Future price changes (cruise fare tripled, tax changed, service prices doubled) do NOT affect old booking', async () => {
    const originalTotal = historicalBooking.pricing.total;
    const originalCruiseFare = historicalBooking.pricing.cruiseFare;
    const originalTax = historicalBooking.pricing.tax;

    // Simulate "Tomorrow": Cruise fare is tripled to 300,000
    await Cruise.updateOne({ _id: cruise._id }, { adultFare: 300000 });

    // Simulate "Tomorrow": Pricing rules in MongoDB updated (tax rate to 28%, insurance to 20,000)
    await PricingRule.updateOne(
      { key: 'default' },
      {
        taxRate: 0.28,
        servicePrices: { insurance: 20000, wifi: 5000, shoreExcursion: 35000 },
      }
    );

    // Retrieve the historical booking via GET /api/bookings/:reference
    const res = await request(app).get(`/api/bookings/${historicalBooking.reference}`);

    expect(res.status).toBe(200);
    const retrieved = res.body.data;

    // The historical booking must display the EXACT same original amounts
    expect(retrieved.pricing.cruiseFare).toBe(originalCruiseFare);
    expect(retrieved.pricing.tax).toBe(originalTax);
    expect(retrieved.pricing.total).toBe(originalTotal);
    expect(retrieved.pricingSnapshot.adultFare).toBe(100000);

    // Reconstruct price from snapshot and verify it reproduces the exact original calculation
    const reconstructed = reconstructHistoricalPrice(retrieved);
    expect(reconstructed.pricing.cruiseFare).toBe(originalCruiseFare);
    expect(reconstructed.pricing.total).toBe(originalTotal);
    expect(reconstructed.pricing.tax).toBe(originalTax);
  });
});
