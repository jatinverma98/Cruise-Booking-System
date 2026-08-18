/**
 * dynamicBusinessRules.test.js
 *
 * Automated tests for Functional Requirement 10:
 * "Business rules must be changeable without code changes or redeployment.
 * Do NOT hardcode adult fares, child age bands, child percentages, group discount tiers,
 * service prices, tax rate, promo codes, promo limits, promo dates, or minimum spend."
 *
 * Run: cd server && npm test
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Cruise = require('../models/Cruise');
const PricingRule = require('../models/PricingRule');
const Service = require('../models/Service');
const PromoCode = require('../models/PromoCode');
const { getPricingRules } = require('../services/pricingService');

describe('Functional Requirement 10: Dynamic Business Rules without Code Changes', () => {
  let cruise;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  beforeEach(async () => {
    cruise = await Cruise.create({
      cruiseLine: 'Dynamic Line',
      ship: 'Configurable Ship',
      destination: 'Caribbean',
      nights: 5,
      adultFare: 80000,
      capacityLeft: 10,
    });
  });

  afterEach(async () => {
    if (cruise) {
      await Cruise.deleteOne({ _id: cruise._id });
    }
    // Restore default rules in DB
    await PricingRule.updateOne(
      { key: 'default' },
      {
        taxRate: 0.12,
        childFareRules: { '0-4': 0, '5-11': 0.5, '12-17': 0.75, '18+': 1.0 },
        groupDiscountRules: { '1-2': 0, '3-4': 0.05, '5-6': 0.10 },
        servicePrices: { insurance: 6700, wifi: 1260, shoreExcursion: 10000 },
      }
    );
    await getPricingRules(true); // Force refresh cache
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('1. Cruise Adult Fare: Changing adultFare in MongoDB immediately changes quotes', async () => {
    // Initial quote with 80,000 adult fare
    const res1 = await request(app).post('/api/pricing/quote').send({
      cruiseId: cruise._id.toString(),
      ages: [30],
    });
    expect(res1.body.data.pricing.cruiseFare).toBe(80000);

    // Change fare directly in MongoDB
    await Cruise.updateOne({ _id: cruise._id }, { adultFare: 110000 });

    // Quote reflects new fare immediately
    const res2 = await request(app).post('/api/pricing/quote').send({
      cruiseId: cruise._id.toString(),
      ages: [30],
    });
    expect(res2.body.data.pricing.cruiseFare).toBe(110000);
  });

  test('2. Child Fare Multipliers: Changing child percentages in PricingRule collection updates quotes', async () => {
    // Update child 5-11 multiplier from 0.50 to 0.25 (75% off) directly in DB
    await PricingRule.updateOne(
      { key: 'default' },
      {
        childFareRules: { '0-4': 0, '5-11': 0.25, '12-17': 0.75, '18+': 1.0 },
      }
    );
    await getPricingRules(true); // Force refresh cache

    // Quote for child age 8 (5-11 band) with adult fare 80,000 -> 80,000 * 0.25 = 20,000
    const res = await request(app).post('/api/pricing/quote').send({
      cruiseId: cruise._id.toString(),
      ages: [30, 8],
    });
    expect(res.status).toBe(200);
    const childPassenger = res.body.data.passengers.find((p) => p.age === 8);
    expect(childPassenger.fareAmount).toBe(20000);
  });

  test('3. Group Discount Tiers: Modifying group discount rules in MongoDB updates discount calculation', async () => {
    // Update group discount for 3-4 passengers from 5% to 20%
    await PricingRule.updateOne(
      { key: 'default' },
      {
        groupDiscountRules: { '1-2': 0, '3-4': 0.20, '5-6': 0.30 },
      }
    );
    await getPricingRules(true);

    const res = await request(app).post('/api/pricing/quote').send({
      cruiseId: cruise._id.toString(),
      ages: [30, 30, 30], // 3 adults = 240,000 raw
    });
    expect(res.status).toBe(200);
    expect(res.body.data.pricing.groupDiscount).toBe(48000); // 20% of 240,000
  });

  test('4. Tax Rate: Changing taxRate in MongoDB updates tax computation', async () => {
    // Update tax rate to 18% GST in MongoDB
    await PricingRule.updateOne({ key: 'default' }, { taxRate: 0.18 });
    await getPricingRules(true);

    const res = await request(app).post('/api/pricing/quote').send({
      cruiseId: cruise._id.toString(),
      ages: [30],
    });
    expect(res.status).toBe(200);
    // Subtotal 80,000 * 18% = 14,400 tax
    expect(res.body.data.pricing.tax).toBe(14400);
  });

  test('5. Dynamic Promo Codes: New promotional code created in MongoDB is immediately valid', async () => {
    const dynamicCode = `FLASH_${Date.now()}`;
    await PromoCode.create({
      code: dynamicCode,
      type: 'percentage',
      value: 30,
      validFrom: new Date('2020-01-01'),
      validTo: new Date('2030-12-31'),
      maxTotalUses: 50,
      maxUsesPerCustomer: 2,
      minimumSpend: 50000,
    });

    const res = await request(app).post('/api/promos/validate').send({
      code: dynamicCode,
      bookingAmount: 80000,
    });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.promo.value).toBe(30);

    // Cleanup
    await PromoCode.deleteOne({ code: dynamicCode });
  });

  test('6. Dynamic Services: GET /api/services returns services configured in MongoDB', async () => {
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    const keys = res.body.data.map((s) => s.key);
    expect(keys).toContain('insurance');
    expect(keys).toContain('wifi');
    expect(keys).toContain('shoreExcursion');
  });
});
