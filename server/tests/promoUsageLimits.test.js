/**
 * promoUsageLimits.test.js
 *
 * Automated tests for Functional Requirement 6:
 * Promotional codes must never exceed usage limits (Total & Per-Customer limits).
 *
 * Run: cd server && npm test
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Cruise = require('../models/Cruise');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const PromoCode = require('../models/PromoCode');
const PromoRedemption = require('../models/PromoRedemption');

describe('Functional Requirement 6: Promotional Code Usage Limits & PromoRedemption Tracking', () => {
  let cruise;
  let limitedPromo;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  beforeEach(async () => {
    // Create test cruise with high capacity
    cruise = await Cruise.create({
      cruiseLine: 'Promo Test Line',
      ship: 'Promo Limits Ship',
      destination: 'Caribbean',
      nights: 7,
      adultFare: 20000,
      capacityLeft: 50,
    });

    // Create promo code with maxTotalUses: 3 and maxUsesPerCustomer: 2
    limitedPromo = await PromoCode.create({
      code: `LIMIT_${Date.now()}`,
      type: 'percentage',
      value: 20,
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2026-12-31'),
      maxTotalUses: 3,        // Max 3 uses globally
      maxUsesPerCustomer: 2,  // Max 2 uses per customer
      minimumSpend: 0,
    });
  });

  afterEach(async () => {
    if (cruise) {
      await Cruise.deleteOne({ _id: cruise._id });
    }
    if (limitedPromo) {
      await PromoCode.deleteOne({ _id: limitedPromo._id });
      await PromoRedemption.deleteMany({ promoCodeId: limitedPromo._id });
      await Booking.deleteMany({ cruiseId: cruise?._id });
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('Tracks every redemption in PromoRedemption collection with promoCodeId, bookingId, customerId', async () => {
    const res = await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'Alice Test', email: 'alice.tracking@test.com' },
      ages: [30],
      services: {},
      promoCode: limitedPromo.code,
    });

    expect(res.status).toBe(201);
    const booking = res.body.data;

    // Check PromoRedemption collection directly
    const redemption = await PromoRedemption.findOne({ bookingId: booking._id });
    expect(redemption).not.toBeNull();
    expect(redemption.promoCodeId.toString()).toBe(limitedPromo._id.toString());
    expect(redemption.customerId.toString()).toBe(booking.customerId._id.toString());
    expect(redemption.createdAt).toBeDefined();
  });

  test('Enforces per-customer limit: Customer cannot exceed maxUsesPerCustomer', async () => {
    const customerEmail = 'loyal.customer@test.com';

    // 1st booking (Use 1/2) -> Success
    const res1 = await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'Loyal User', email: customerEmail },
      ages: [30],
      promoCode: limitedPromo.code,
    });
    expect(res1.status).toBe(201);

    // 2nd booking (Use 2/2) -> Success
    const res2 = await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'Loyal User', email: customerEmail },
      ages: [30],
      promoCode: limitedPromo.code,
    });
    expect(res2.status).toBe(201);

    // 3rd booking (Use 3/2 -> Exceeds customer limit) -> Rejected 422
    const res3 = await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'Loyal User', email: customerEmail },
      ages: [30],
      promoCode: limitedPromo.code,
    });

    expect(res3.status).toBe(422);
    expect(res3.body.code).toBe('PROMO_CUSTOMER_LIMIT_REACHED');

    // Confirm only 2 redemptions recorded for this customer
    const count = await PromoRedemption.countDocuments({ promoCodeId: limitedPromo._id });
    expect(count).toBe(2);
  });

  test('Enforces global total limit: No further customer may use code once maxTotalUses reached', async () => {
    // Customer 1 uses code once (Total: 1)
    await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'User 1', email: 'user1@test.com' },
      ages: [30],
      promoCode: limitedPromo.code,
    });

    // Customer 2 uses code once (Total: 2)
    await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'User 2', email: 'user2@test.com' },
      ages: [30],
      promoCode: limitedPromo.code,
    });

    // Customer 3 uses code once (Total: 3 - maxTotalUses reached)
    await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'User 3', email: 'user3@test.com' },
      ages: [30],
      promoCode: limitedPromo.code,
    });

    // Customer 4 attempts to use code (Total: 4 > 3 -> Rejected)
    const res4 = await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'User 4', email: 'user4@test.com' },
      ages: [30],
      promoCode: limitedPromo.code,
    });

    expect(res4.status).toBe(422);
    expect(res4.body.code).toBe('PROMO_TOTAL_LIMIT_REACHED');

    // Global redemptions count stays exactly 3
    const totalRedemptions = await PromoRedemption.countDocuments({ promoCodeId: limitedPromo._id });
    expect(totalRedemptions).toBe(3);
  });
});
