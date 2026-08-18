/**
 * pricingService.js
 *
 * Central Pricing Service
 * Single source of truth for all pricing calculations across the application.
 * All pricing must be calculated through this service.
 * Pricing rules and optional service rates are loaded dynamically from MongoDB.
 */

const PricingRule = require('../models/PricingRule');

// ── Default Fallback Rules (Used when DB rule is not yet seeded / in unit tests) ──

const DEFAULT_TAX_RATE = 0.12; // 12%

const DEFAULT_CHILD_FARE_RULES = {
  '0-4': 0,      // Free
  '5-11': 0.5,   // 50%
  '12-17': 0.75, // 75%
  '18+': 1.0,    // 100%
};

const DEFAULT_GROUP_DISCOUNT_RULES = {
  '1-2': 0,    // 0%
  '3-4': 0.05, // 5%
  '5-6': 0.10, // 10%
};

const DEFAULT_SERVICE_PRICES = {
  insurance: 6700,       // ₹6,700 per passenger
  wifi: 1260,            // ₹1,260 per passenger per night
  shoreExcursion: 10000, // ₹10,000 per passenger
};

// ── In-memory Rule Cache for Performance ──────────────────────────────────────
let cachedRules = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

/**
 * Fetch active pricing rules from MongoDB.
 * Falls back to default constants if MongoDB is unavailable or unseeded.
 *
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<{ taxRate: number, childFareRules: object, groupDiscountRules: object, servicePrices: object }>}
 */
const getPricingRules = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && cachedRules && (now - lastFetchTime) < CACHE_TTL_MS) {
    return cachedRules;
  }

  try {
    const doc = await PricingRule.findOne({ isActive: true }).lean();
    if (doc) {
      const childFareMap = doc.childFareRules instanceof Map 
        ? Object.fromEntries(doc.childFareRules)
        : (doc.childFareRules || DEFAULT_CHILD_FARE_RULES);

      const groupDiscountMap = doc.groupDiscountRules instanceof Map
        ? Object.fromEntries(doc.groupDiscountRules)
        : (doc.groupDiscountRules || DEFAULT_GROUP_DISCOUNT_RULES);

      cachedRules = {
        taxRate: doc.taxRate !== undefined ? doc.taxRate : DEFAULT_TAX_RATE,
        childFareRules: childFareMap,
        groupDiscountRules: groupDiscountMap,
        servicePrices: {
          insurance: doc.servicePrices?.insurance ?? DEFAULT_SERVICE_PRICES.insurance,
          wifi: doc.servicePrices?.wifi ?? DEFAULT_SERVICE_PRICES.wifi,
          shoreExcursion: doc.servicePrices?.shoreExcursion ?? DEFAULT_SERVICE_PRICES.shoreExcursion,
        },
      };
      lastFetchTime = now;
      return cachedRules;
    }
  } catch {
    // If DB is disconnected or during pure unit tests, gracefully fallback
  }

  cachedRules = {
    taxRate: DEFAULT_TAX_RATE,
    childFareRules: { ...DEFAULT_CHILD_FARE_RULES },
    groupDiscountRules: { ...DEFAULT_GROUP_DISCOUNT_RULES },
    servicePrices: { ...DEFAULT_SERVICE_PRICES },
  };
  lastFetchTime = now;
  return cachedRules;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Round a number to 2 decimal places to avoid floating-point drift.
 * @param {number} n
 * @returns {number}
 */
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Create a structured application error.
 */
const createError = (statusCode, message, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

/**
 * Determine fare type and multiplier for a passenger based on age and child fare rules.
 * @param {number} age
 * @param {object} [childFareRules]
 * @returns {{ fareType: 'adult'|'child'|'free', multiplier: number }}
 */
const getFareInfo = (age, childFareRules = DEFAULT_CHILD_FARE_RULES) => {
  if (age < 0 || age > 120) {
    throw createError(400, 'Passenger age must be between 0 and 120.');
  }

  const r0_4 = childFareRules['0-4'] ?? 0;
  const r5_11 = childFareRules['5-11'] ?? 0.5;
  const r12_17 = childFareRules['12-17'] ?? 0.75;
  const r18_plus = childFareRules['18+'] ?? 1.0;

  if (age <= 4) return { fareType: r0_4 === 0 ? 'free' : 'child', multiplier: r0_4 };
  if (age <= 11) return { fareType: 'child', multiplier: r5_11 };
  if (age <= 17) return { fareType: 'child', multiplier: r12_17 };
  return { fareType: 'adult', multiplier: r18_plus };
};

/**
 * Get group discount rate for a given passenger count based on group discount rules.
 * @param {number} count
 * @param {object} [groupDiscountRules]
 * @returns {number} discount rate (e.g. 0.05 for 5%)
 */
const getGroupDiscountRate = (count, groupDiscountRules = DEFAULT_GROUP_DISCOUNT_RULES) => {
  const r1_2 = groupDiscountRules['1-2'] ?? 0;
  const r3_4 = groupDiscountRules['3-4'] ?? 0.05;
  const r5_6 = groupDiscountRules['5-6'] ?? 0.10;

  if (count <= 2) return r1_2;
  if (count <= 4) return r3_4;
  return r5_6;
};

/**
 * Calculate the fare amount for a single passenger.
 * @param {number} age
 * @param {number} adultFare
 * @param {object} [childFareRules]
 * @returns {{ age, fareType, fareAmount }}
 */
const calculatePassengerFare = (age, adultFare, childFareRules = DEFAULT_CHILD_FARE_RULES) => {
  const { fareType, multiplier } = getFareInfo(age, childFareRules);
  return {
    age,
    fareType,
    fareAmount: round2(adultFare * multiplier),
  };
};

/**
 * Validate passenger list according to business rules.
 * - At least 1 adult (age 18+)
 * - 1 to 6 passengers total
 * - Ages must be whole numbers between 0 and 120
 * - No negative, null, missing or non-numeric ages allowed
 *
 * @param {number[]} ages
 * @throws Error with statusCode 400 if invalid
 */
const validatePassengers = (ages) => {
  if (!ages || !Array.isArray(ages) || ages.length === 0) {
    throw createError(400, 'At least one passenger is required.');
  }

  if (ages.length > 6) {
    throw createError(400, 'A maximum of 6 passengers are allowed per booking.');
  }

  ages.forEach((age, i) => {
    if (age === null || age === undefined || age === '') {
      throw createError(400, `Passenger ${i + 1}: age is required.`);
    }
    if (typeof age !== 'number' || Number.isNaN(age)) {
      throw createError(400, `Passenger ${i + 1}: age must be a valid number.`);
    }
    if (!Number.isInteger(age)) {
      throw createError(400, `Passenger ${i + 1}: age must be a whole number.`);
    }
    if (age < 0) {
      throw createError(400, `Passenger ${i + 1}: age cannot be negative.`);
    }
    if (age > 120) {
      throw createError(400, `Passenger ${i + 1}: age must be 120 or younger.`);
    }
  });

  const hasAdult = ages.some((age) => age >= 18);
  if (!hasAdult) {
    throw createError(400, 'At least one adult (age 18 or older) is required.');
  }
};

/**
 * Calculate optional services breakdown & total.
 * Rules:
 *  - Insurance: price per passenger
 *  - Wi-Fi: price × passengers × cruise nights
 *  - Shore Excursion: price × passengers
 *
 * @param {number} passengerCount
 * @param {number} nights
 * @param {{ insurance: boolean, wifi: boolean, shoreExcursion: boolean }} services
 * @param {object} [servicePrices]
 * @returns {{ insurance: number, wifi: number, shoreExcursion: number, total: number }}
 */
const calculateServicesBreakdown = (
  passengerCount,
  nights,
  services,
  servicePrices = DEFAULT_SERVICE_PRICES
) => {
  const insurancePrice = servicePrices.insurance ?? DEFAULT_SERVICE_PRICES.insurance;
  const wifiPrice = servicePrices.wifi ?? DEFAULT_SERVICE_PRICES.wifi;
  const shorePrice = servicePrices.shoreExcursion ?? DEFAULT_SERVICE_PRICES.shoreExcursion;

  const insurance = services.insurance ? round2(insurancePrice * passengerCount) : 0;
  const wifi = services.wifi ? round2(wifiPrice * passengerCount * (nights || 1)) : 0;
  const shoreExcursion = services.shoreExcursion ? round2(shorePrice * passengerCount) : 0;
  const total = round2(insurance + wifi + shoreExcursion);

  return {
    insurance,
    wifi,
    shoreExcursion,
    total,
  };
};

/**
 * Calculate the total optional services cost (convenience wrapper).
 */
const calculateServicesTotal = (passengerCount, nights, services, servicePrices = DEFAULT_SERVICE_PRICES) => {
  return calculateServicesBreakdown(passengerCount, nights, services, servicePrices).total;
};

/**
 * Build a complete, authoritative price quote.
 * Single source of truth for all pricing calculations across quote and booking APIs.
 *
 * Calculation Order:
 * 1. Individual passenger fares (Adult 100%, 12-17 75%, 5-11 50%, 0-4 Free)
 * 2. Raw cruise fare subtotal
 * 3. Group discount applied ONLY to cruise fare (1-2: 0%, 3-4: 5%, 5-6: 10%)
 * 4. Optional services breakdown (Insurance, Wi-Fi, Shore Excursion)
 * 5. Subtotal before promo (Discounted cruise fare + Optional services)
 * 6. Promotional discount applied
 * 7. Taxable subtotal (Subtotal before promo - Promotional discount)
 * 8. Tax (12% on taxable subtotal)
 * 9. Final Grand Total
 *
 * @param {object} cruise        - Cruise document from DB
 * @param {number[]} ages        - Array of passenger ages
 * @param {object} services      - { insurance, wifi, shoreExcursion }
 * @param {object|null} promo    - Validated promo code document (or null)
 * @param {object|null} [rules]  - Dynamic rules configuration (optional)
 * @returns {object} Full quote object with detailed breakdown
 */
const buildQuote = (cruise, ages, services = {}, promo = null, rules = null) => {
  validatePassengers(ages);

  const activeRules = rules || {
    taxRate: DEFAULT_TAX_RATE,
    childFareRules: DEFAULT_CHILD_FARE_RULES,
    groupDiscountRules: DEFAULT_GROUP_DISCOUNT_RULES,
    servicePrices: DEFAULT_SERVICE_PRICES,
  };

  const passengerCount = ages.length;
  const resolvedServices = {
    insurance: !!services.insurance,
    wifi: !!services.wifi,
    shoreExcursion: !!services.shoreExcursion,
  };

  // 1. Calculate per-passenger fares
  const passengers = ages.map((age) =>
    calculatePassengerFare(age, cruise.adultFare, activeRules.childFareRules)
  );

  // 2. Total raw cruise fare (sum of all passenger fares)
  const rawCruiseFare = round2(passengers.reduce((sum, p) => sum + p.fareAmount, 0));

  // 3. Group discount (applied to cruise fare only)
  const groupDiscountRate = getGroupDiscountRate(passengerCount, activeRules.groupDiscountRules);
  const groupDiscountAmount = round2(rawCruiseFare * groupDiscountRate);
  const discountedCruiseFare = round2(rawCruiseFare - groupDiscountAmount);

  // 4. Optional services breakdown (Insurance, Wi-Fi, Shore Excursions)
  const servicesBreakdown = calculateServicesBreakdown(
    passengerCount,
    cruise.nights,
    resolvedServices,
    activeRules.servicePrices
  );
  const servicesTotal = servicesBreakdown.total;

  // 5. Subtotal before promo (discounted cruise fare + services)
  const subtotalBeforePromo = round2(discountedCruiseFare + servicesTotal);

  // 6. Promotional discount
  let promotionalDiscount = 0;
  let promoSnapshot = null;

  if (promo) {
    if (promo.type === 'percentage') {
      promotionalDiscount = round2(subtotalBeforePromo * (promo.value / 100));
    } else if (promo.type === 'fixed') {
      promotionalDiscount = Math.min(promo.value, subtotalBeforePromo);
    }
    promoSnapshot = {
      code: promo.code,
      type: promo.type,
      value: promo.value,
    };
  }

  // 7. Taxable subtotal (after promo)
  const taxableSubtotal = round2(subtotalBeforePromo - promotionalDiscount);

  // 8. Tax (e.g. 12% on taxable subtotal)
  const taxRate = activeRules.taxRate ?? DEFAULT_TAX_RATE;
  const tax = round2(taxableSubtotal * taxRate);

  // 9. Grand total
  const total = round2(taxableSubtotal + tax);

  return {
    passengers,
    services: resolvedServices,
    pricing: {
      cruiseFare: rawCruiseFare,
      groupDiscount: groupDiscountAmount,
      promotionalDiscount,
      services: {
        insurance: servicesBreakdown.insurance,
        wifi: servicesBreakdown.wifi,
        shoreExcursion: servicesBreakdown.shoreExcursion,
      },
      servicesTotal,
      subtotal: taxableSubtotal,
      tax,
      total,
    },
    pricingSnapshot: {
      adultFare: cruise.adultFare,
      childFareRules: activeRules.childFareRules,
      groupDiscountRules: activeRules.groupDiscountRules,
      servicePrices: activeRules.servicePrices,
      taxRate: taxRate * 100,
      promoSnapshot,
    },
  };
};

/**
 * Async version of buildQuote that automatically loads dynamic rules from MongoDB.
 */
const buildQuoteAsync = async (cruise, ages, services = {}, promo = null) => {
  const rules = await getPricingRules();
  return buildQuote(cruise, ages, services, promo, rules);
};

module.exports = {
  buildQuote,
  buildQuoteAsync,
  getPricingRules,
  validatePassengers,
  calculatePassengerFare,
  calculateServicesBreakdown,
  calculateServicesTotal,
  getGroupDiscountRate,
  TAX_RATE: DEFAULT_TAX_RATE,
  SERVICE_PRICES: DEFAULT_SERVICE_PRICES,
  CHILD_FARE_RULES: DEFAULT_CHILD_FARE_RULES,
  GROUP_DISCOUNT_RULES: DEFAULT_GROUP_DISCOUNT_RULES,
};
