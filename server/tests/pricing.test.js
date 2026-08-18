/**
 * pricing.test.js
 *
 * Unit tests for the central pricingService (Functional Requirement 3).
 *
 * Run: cd server && npm test
 */

const {
  calculatePassengerFare,
  calculateServicesBreakdown,
  calculateServicesTotal,
  getGroupDiscountRate,
  buildQuote,
  validatePassengers,
  SERVICE_PRICES,
} = require('../services/pricingService');

// ── Mock cruise used in tests ─────────────────────────────────────────────────
const mockCruise = {
  _id: '507f1f77bcf86cd799439011',
  adultFare: 99999,
  nights: 7,
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Passenger Fare Calculation (by age)
// ─────────────────────────────────────────────────────────────────────────────

describe('FR2 & FR3: Individual Passenger Fare Calculations', () => {
  test('Age 0 → FREE (0% adult fare)', () => {
    const p = calculatePassengerFare(0, 10000);
    expect(p.fareType).toBe('free');
    expect(p.fareAmount).toBe(0);
  });

  test('Age 4 → FREE (0% adult fare)', () => {
    const p = calculatePassengerFare(4, 10000);
    expect(p.fareType).toBe('free');
    expect(p.fareAmount).toBe(0);
  });

  test('Age 5 → Child 50% of adult fare', () => {
    const p = calculatePassengerFare(5, 10000);
    expect(p.fareType).toBe('child');
    expect(p.fareAmount).toBe(5000);
  });

  test('Age 11 → Child 50% of adult fare', () => {
    const p = calculatePassengerFare(11, 10000);
    expect(p.fareType).toBe('child');
    expect(p.fareAmount).toBe(5000);
  });

  test('Age 12 → Child 75% of adult fare', () => {
    const p = calculatePassengerFare(12, 10000);
    expect(p.fareType).toBe('child');
    expect(p.fareAmount).toBe(7500);
  });

  test('Age 17 → Child 75% of adult fare', () => {
    const p = calculatePassengerFare(17, 10000);
    expect(p.fareType).toBe('child');
    expect(p.fareAmount).toBe(7500);
  });

  test('Age 18 → Adult 100% of adult fare', () => {
    const p = calculatePassengerFare(18, 10000);
    expect(p.fareType).toBe('adult');
    expect(p.fareAmount).toBe(10000);
  });

  test('Age 65 → Adult 100% of adult fare', () => {
    const p = calculatePassengerFare(65, 10000);
    expect(p.fareType).toBe('adult');
    expect(p.fareAmount).toBe(10000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Passenger Validation
// ─────────────────────────────────────────────────────────────────────────────

describe('FR2: Passenger Rules Validation', () => {
  test('1 adult — valid', () => {
    expect(() => validatePassengers([30])).not.toThrow();
  });

  test('1 adult + 2 children — valid', () => {
    expect(() => validatePassengers([35, 8, 3])).not.toThrow();
  });

  test('Up to 6 passengers with at least 1 adult — valid', () => {
    expect(() => validatePassengers([40, 38, 16, 10, 4, 1])).not.toThrow();
  });

  test('Reject: zero adults (only children)', () => {
    expect(() => validatePassengers([17, 10, 3])).toThrow('At least one adult (age 18 or older) is required.');
  });

  test('Reject: zero passengers (empty array)', () => {
    expect(() => validatePassengers([])).toThrow('At least one passenger is required.');
  });

  test('Reject: more than 6 passengers (7 passengers)', () => {
    expect(() => validatePassengers([30, 28, 15, 12, 8, 4, 1])).toThrow(
      'A maximum of 6 passengers are allowed per booking.'
    );
  });

  test('Reject: negative age', () => {
    expect(() => validatePassengers([30, -5])).toThrow('Passenger 2: age cannot be negative.');
  });

  test('Reject: missing/null child age', () => {
    expect(() => validatePassengers([30, null])).toThrow('Passenger 2: age is required.');
  });

  test('Reject: empty string child age', () => {
    expect(() => validatePassengers([30, ''])).toThrow('Passenger 2: age is required.');
  });

  test('Reject: invalid age format (float/non-integer)', () => {
    expect(() => validatePassengers([30, 7.5])).toThrow('Passenger 2: age must be a whole number.');
  });

  test('Reject: non-number string age', () => {
    expect(() => validatePassengers([30, 'abc'])).toThrow('Passenger 2: age must be a valid number.');
  });

  test('Reject: age over 120', () => {
    expect(() => validatePassengers([130])).toThrow('Passenger 1: age must be 120 or younger.');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Group Discount Rules (Cruise fare only)
// ─────────────────────────────────────────────────────────────────────────────

describe('FR3: Group Discount Rules', () => {
  test('1 passenger → 0% discount', () => {
    expect(getGroupDiscountRate(1)).toBe(0);
  });

  test('2 passengers → 0% discount', () => {
    expect(getGroupDiscountRate(2)).toBe(0);
  });

  test('3 passengers → 5% discount', () => {
    expect(getGroupDiscountRate(3)).toBe(0.05);
  });

  test('4 passengers → 5% discount', () => {
    expect(getGroupDiscountRate(4)).toBe(0.05);
  });

  test('5 passengers → 10% discount', () => {
    expect(getGroupDiscountRate(5)).toBe(0.10);
  });

  test('6 passengers → 10% discount', () => {
    expect(getGroupDiscountRate(6)).toBe(0.10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Optional Services Pricing & Itemized Breakdown
// ─────────────────────────────────────────────────────────────────────────────

describe('FR3: Optional Services Itemized Breakdown', () => {
  test('Insurance: ₹6,700 per passenger', () => {
    const breakdown = calculateServicesBreakdown(2, 7, { insurance: true, wifi: false, shoreExcursion: false });
    expect(breakdown.insurance).toBe(SERVICE_PRICES.insurance * 2); // 13400
    expect(breakdown.wifi).toBe(0);
    expect(breakdown.shoreExcursion).toBe(0);
    expect(breakdown.total).toBe(13400);
  });

  test('Wi-Fi: ₹1,260 per passenger per night', () => {
    const breakdown = calculateServicesBreakdown(2, 7, { insurance: false, wifi: true, shoreExcursion: false });
    expect(breakdown.wifi).toBe(SERVICE_PRICES.wifi * 2 * 7); // 17640
    expect(breakdown.insurance).toBe(0);
    expect(breakdown.shoreExcursion).toBe(0);
    expect(breakdown.total).toBe(17640);
  });

  test('Shore Excursion: ₹10,000 per passenger', () => {
    const breakdown = calculateServicesBreakdown(2, 7, { insurance: false, wifi: false, shoreExcursion: true });
    expect(breakdown.shoreExcursion).toBe(SERVICE_PRICES.shoreExcursion * 2); // 20000
    expect(breakdown.insurance).toBe(0);
    expect(breakdown.wifi).toBe(0);
    expect(breakdown.total).toBe(20000);
  });

  test('All services combined itemized breakdown', () => {
    const breakdown = calculateServicesBreakdown(2, 7, { insurance: true, wifi: true, shoreExcursion: true });
    expect(breakdown).toEqual({
      insurance: 13400,
      wifi: 17640,
      shoreExcursion: 20000,
      total: 51040,
    });
  });

  test('No services selected → ₹0', () => {
    const breakdown = calculateServicesBreakdown(2, 7, { insurance: false, wifi: false, shoreExcursion: false });
    expect(breakdown.total).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Centralized Pricing Calculation & Detailed Breakdown (FR3 Example Verification)
// ─────────────────────────────────────────────────────────────────────────────

describe('FR3: Complete Pricing Breakdown Structure & Calculation', () => {
  test('Exact calculation matches the complete breakdown structure', () => {
    // Cruise with adultFare = 1000, 7 nights
    // 3 adults -> cruiseFare = 3000
    // Group discount (5% on 3000) = 150 -> discounted cruise fare = 2850
    // Services: insurance for 3 (@ 80) = 240, wifi for 3 (@ 15/night * 7) = 315, shoreExcursion = 0
    // Services total = 555
    // Subtotal before promo = 2850 + 555 = 3405
    // Promo: 285 fixed discount -> subtotal = 3120
    // Tax: 12% on 3120 = 374.4
    // Total = 3120 + 374.4 = 3494.4
    const customTestRules = {
      taxRate: 0.12,
      childFareRules: { '0-4': 0, '5-11': 0.5, '12-17': 0.75, '18+': 1.0 },
      groupDiscountRules: { '1-2': 0, '3-4': 0.05, '5-6': 0.10 },
      servicePrices: { insurance: 80, wifi: 15, shoreExcursion: 120 },
    };

    const quote = buildQuote(
      { _id: 'test', adultFare: 1000, nights: 7 },
      [30, 28, 25], // 3 adults
      { insurance: true, wifi: true, shoreExcursion: false },
      { code: 'PROMO285', type: 'fixed', value: 285 },
      customTestRules
    );

    expect(quote.pricing).toEqual({
      cruiseFare: 3000,
      groupDiscount: 150,
      promotionalDiscount: 285,
      services: {
        insurance: 240,
        wifi: 315,
        shoreExcursion: 0,
      },
      servicesTotal: 555,
      subtotal: 3120,
      tax: 374.4,
      total: 3494.4,
    });
  });

  test('Group discount is strictly NOT applied to optional services', () => {
    // 5 passengers -> 10% group discount
    // Cruise fare: 5 * 1000 = 5000 -> Group discount = 500
    // Insurance for 5: 5 * 100 = 500 (No discount applied to 500)
    const customRules = {
      taxRate: 0.12,
      childFareRules: { '0-4': 0, '5-11': 0.5, '12-17': 0.75, '18+': 1.0 },
      groupDiscountRules: { '1-2': 0, '3-4': 0.05, '5-6': 0.10 },
      servicePrices: { insurance: 100, wifi: 20, shoreExcursion: 50 },
    };

    const quote = buildQuote(
      { _id: 'test', adultFare: 1000, nights: 5 },
      [30, 30, 30, 30, 30],
      { insurance: true, wifi: false, shoreExcursion: false },
      null,
      customRules
    );

    expect(quote.pricing.cruiseFare).toBe(5000);
    expect(quote.pricing.groupDiscount).toBe(500); // 10% of 5000 only
    expect(quote.pricing.services.insurance).toBe(500); // exactly 5 * 100, not discounted
    expect(quote.pricing.subtotal).toBe((5000 - 500) + 500); // 4500 + 500 = 5000
    expect(quote.pricing.tax).toBe(600); // 12% of 5000
    expect(quote.pricing.total).toBe(5600);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Pricing Snapshot
// ─────────────────────────────────────────────────────────────────────────────

describe('FR3: Pricing Snapshot Immutability', () => {
  test('Snapshot contains adultFare at time of booking', () => {
    const quote = buildQuote(mockCruise, [30], {}, null);
    expect(quote.pricingSnapshot.adultFare).toBe(99999);
  });

  test('Snapshot contains taxRate 12%', () => {
    const quote = buildQuote(mockCruise, [30], {}, null);
    expect(quote.pricingSnapshot.taxRate).toBe(12);
  });

  test('Snapshot contains service prices in INR', () => {
    const quote = buildQuote(mockCruise, [30], {}, null);
    expect(quote.pricingSnapshot.servicePrices).toMatchObject({
      insurance: 6700,
      wifi: 1260,
      shoreExcursion: 10000,
    });
  });
});
