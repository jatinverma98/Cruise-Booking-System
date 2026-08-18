/**
 * concurrentBooking.test.js
 *
 * Automated test verifying Functional Requirement 5:
 * "Never sell above cruise capacity" under simultaneous concurrent booking requests.
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
const PromoRedemption = require('../models/PromoRedemption');

describe('Functional Requirement 5: Concurrency & Transactional Capacity Protection', () => {
  let testCruise;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  beforeEach(async () => {
    // Create a test cruise with capacity = 2
    testCruise = await Cruise.create({
      cruiseLine: 'Concurrency Test Line',
      ship: 'Race Condition Shield',
      destination: 'Caribbean',
      nights: 7,
      adultFare: 50000,
      capacityLeft: 2, // Exactly 2 seats left
    });
  });

  afterEach(async () => {
    if (testCruise) {
      await Cruise.deleteOne({ _id: testCruise._id });
      await Booking.deleteMany({ cruiseId: testCruise._id });
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('Simultaneous booking of final seats: Customer A (2 seats) vs Customer B (1 seat) -> Only one succeeds', async () => {
    const payloadA = {
      cruiseId: testCruise._id.toString(),
      customer: { name: 'Customer A', email: 'cust.a@test.com' },
      ages: [30, 28], // 2 passengers
      services: {},
      promoCode: null,
    };

    const payloadB = {
      cruiseId: testCruise._id.toString(),
      customer: { name: 'Customer B', email: 'cust.b@test.com' },
      ages: [35], // 1 passenger
      services: {},
      promoCode: null,
    };

    // Fire both requests simultaneously
    const [resA, resB] = await Promise.all([
      request(app).post('/api/bookings').send(payloadA),
      request(app).post('/api/bookings').send(payloadB),
    ]);

    const successCount = [resA, resB].filter((r) => r.status === 201).length;
    const rejectedCount = [resA, resB].filter((r) => r.status === 409).length;

    // Exactly one booking succeeds and one is rejected
    expect(successCount).toBe(1);
    expect(rejectedCount).toBe(1);

    // Verify cruise capacity in database is not negative and correctly updated
    const updatedCruise = await Cruise.findById(testCruise._id);
    expect(updatedCruise.capacityLeft).toBeGreaterThanOrEqual(0);

    if (resA.status === 201) {
      expect(updatedCruise.capacityLeft).toBe(0); // 2 - 2 = 0
      expect(resB.body.message).toMatch(/sold out|remaining/i);
    } else {
      expect(updatedCruise.capacityLeft).toBe(1); // 2 - 1 = 1
      expect(resA.body.message).toMatch(/remaining/i);
    }
  });

  test('Attempting to book sold out cruise (capacityLeft = 0) is rejected immediately with 409', async () => {
    await Cruise.updateOne({ _id: testCruise._id }, { capacityLeft: 0 });

    const res = await request(app).post('/api/bookings').send({
      cruiseId: testCruise._id.toString(),
      customer: { name: 'Customer Late', email: 'late@test.com' },
      ages: [30],
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/sold out/i);
  });

  test('Rollback on failure: Invalid passenger data does not decrease cruise capacity', async () => {
    const initialCapacity = testCruise.capacityLeft;

    const res = await request(app).post('/api/bookings').send({
      cruiseId: testCruise._id.toString(),
      customer: { name: 'Faulty Request', email: 'faulty@test.com' },
      ages: [15, 12], // Zero adults -> validation failure
    });

    expect(res.status).toBe(400);

    const checkCruise = await Cruise.findById(testCruise._id);
    expect(checkCruise.capacityLeft).toBe(initialCapacity); // Capacity remained unchanged
  });
});
