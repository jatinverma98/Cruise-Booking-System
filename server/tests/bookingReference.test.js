/**
 * bookingReference.test.js
 *
 * Automated tests for Functional Requirement 7:
 * Confirmed booking creation, unique reference format (ODY-YYYYMMDD-XXXXXX),
 * and retrieval via GET /api/bookings/:reference.
 *
 * Run: cd server && npm test
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Cruise = require('../models/Cruise');
const Booking = require('../models/Booking');

describe('Functional Requirement 7: Confirmed Booking & Reference Retrieval', () => {
  let cruise;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  beforeEach(async () => {
    cruise = await Cruise.create({
      cruiseLine: 'Odysseus Oceanic',
      ship: 'Aegean Odyssey',
      destination: 'Mediterranean',
      nights: 10,
      adultFare: 154000,
      capacityLeft: 20,
    });
  });

  afterEach(async () => {
    if (cruise) {
      await Booking.deleteMany({ cruiseId: cruise._id });
      await Cruise.deleteOne({ _id: cruise._id });
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('Creates confirmed booking with reference matching ODY-YYYYMMDD-XXXXXX format', async () => {
    const bookingPayload = {
      cruiseId: cruise._id.toString(),
      customer: { name: 'Odysseus Traveler', email: 'odysseus@travel.com' },
      ages: [32, 8], // 1 adult + 1 child
      services: { insurance: true, wifi: true, shoreExcursion: false },
      promoCode: null,
    };

    const res = await request(app).post('/api/bookings').send(bookingPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.reference).toBeDefined();

    // Verify format ODY-YYYYMMDD-XXXXXX
    const refRegex = /^ODY-\d{8}-[A-F0-9]{6}$/;
    expect(res.body.reference).toMatch(refRegex);
    expect(res.body.data.reference).toBe(res.body.reference);

    // Verify booking in database has unique index & exact structure
    const dbBooking = await Booking.findOne({ reference: res.body.reference });
    expect(dbBooking).not.toBeNull();
    expect(dbBooking.passengers.length).toBe(2);
    expect(dbBooking.pricing.total).toBeGreaterThan(0);
    expect(dbBooking.pricingSnapshot).toBeDefined();
  });

  test('GET /api/bookings/:reference retrieves complete booking details', async () => {
    // 1. Create a booking first
    const createRes = await request(app).post('/api/bookings').send({
      cruiseId: cruise._id.toString(),
      customer: { name: 'Elena Rostova', email: 'elena@voyage.com' },
      ages: [35, 10, 3], // 3 passengers
      services: { insurance: true, wifi: false, shoreExcursion: true },
      promoCode: null,
    });

    const ref = createRes.body.reference;
    expect(ref).toBeDefined();

    // 2. Retrieve via GET /api/bookings/:reference
    const getRes = await request(app).get(`/api/bookings/${ref}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);

    const data = getRes.body.data;
    // 1. Booking reference
    expect(data.reference).toBe(ref);

    // 2. Cruise details populated
    expect(data.cruiseId.cruiseLine).toBe('Odysseus Oceanic');
    expect(data.cruiseId.ship).toBe('Aegean Odyssey');
    expect(data.cruiseId.destination).toBe('Mediterranean');
    expect(data.cruiseId.nights).toBe(10);

    // 3. Passenger details
    expect(data.passengers.length).toBe(3);
    expect(data.passengers[0].fareType).toBe('adult');
    expect(data.passengers[1].fareType).toBe('child');
    expect(data.passengers[2].fareType).toBe('free');

    // 4. Services
    expect(data.services.insurance).toBe(true);
    expect(data.services.wifi).toBe(false);
    expect(data.services.shoreExcursion).toBe(true);

    // 5. Price breakdown & final total
    expect(data.pricing.cruiseFare).toBeDefined();
    expect(data.pricing.groupDiscount).toBeDefined();
    expect(data.pricing.subtotal).toBeDefined();
    expect(data.pricing.tax).toBeDefined();
    expect(data.pricing.total).toBeDefined();

    // 6. Booking date (createdAt)
    expect(data.createdAt).toBeDefined();
  });

  test('GET /api/bookings/:reference returns 404 for non-existent reference', async () => {
    const res = await request(app).get('/api/bookings/ODY-99999999-NOTFOUND');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('No booking found');
  });
});
