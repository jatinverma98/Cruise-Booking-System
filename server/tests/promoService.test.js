/**
 * promoService.test.js
 *
 * Tests for promo validation logic.
 * Uses Jest mocking to avoid real DB connections.
 */

jest.mock('../models/PromoCode');
jest.mock('../models/PromoRedemption');

const PromoCode = require('../models/PromoCode');
const PromoRedemption = require('../models/PromoRedemption');
const { validatePromoCode } = require('../services/promoService');

// Helpers
const makePromo = (overrides = {}) => ({
  _id: 'promo123',
  code: 'SUMMER10',
  type: 'percentage',
  value: 10,
  validFrom: new Date('2026-06-01'),
  validTo: new Date('2026-08-31'),
  maxTotalUses: 100,
  maxUsesPerCustomer: 1,
  minimumSpend: 1000,
  ...overrides,
});

// Mock Mongoose session chaining
const mockSession = { session: jest.fn().mockReturnThis() };

const mockFindOne = (promo) => {
  PromoCode.findOne = jest.fn().mockReturnValue({
    session: jest.fn().mockResolvedValue(promo),
  });
};

const mockCountDocuments = (totalUses, customerUses) => {
  let callCount = 0;
  PromoRedemption.countDocuments = jest.fn().mockReturnValue({
    session: jest.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve(callCount === 1 ? totalUses : customerUses);
    }),
  });
};

describe('Promo Validation', () => {
  // ── Valid promo ─────────────────────────────────────────────────────────────

  test('Valid promo returns { valid: true, promo }', async () => {
    mockFindOne(makePromo());
    mockCountDocuments(0, 0);

    const result = await validatePromoCode('SUMMER10', 'cust1', 1200);
    expect(result.valid).toBe(true);
    expect(result.promo.code).toBe('SUMMER10');
  });

  // ── Invalid code ────────────────────────────────────────────────────────────

  test('Code does not exist → INVALID_CODE', async () => {
    mockFindOne(null);

    const result = await validatePromoCode('BADCODE', 'cust1', 1200);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('INVALID_CODE');
  });

  // ── Not yet valid ───────────────────────────────────────────────────────────

  test('Code not yet active → NOT_YET_VALID', async () => {
    mockFindOne(
      makePromo({
        validFrom: new Date('2027-01-01'),
        validTo: new Date('2027-12-31'),
      })
    );

    const result = await validatePromoCode('FUTURE', 'cust1', 1200);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('NOT_YET_VALID');
  });

  // ── Expired ─────────────────────────────────────────────────────────────────

  test('Expired code → EXPIRED (WINTER5 scenario)', async () => {
    mockFindOne(
      makePromo({
        code: 'WINTER5',
        validFrom: new Date('2025-01-01'),
        validTo: new Date('2025-03-31'),
      })
    );

    const result = await validatePromoCode('WINTER5', 'cust1', 500);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('EXPIRED');
  });

  // ── Total usage limit ───────────────────────────────────────────────────────

  test('Total usage limit reached → TOTAL_USAGE_LIMIT_REACHED', async () => {
    mockFindOne(makePromo({ maxTotalUses: 3 }));
    mockCountDocuments(3, 0); // 3 uses already — at limit

    const result = await validatePromoCode('CREW25', 'cust1', 1200);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('TOTAL_USAGE_LIMIT_REACHED');
  });

  // ── Per-customer usage limit ────────────────────────────────────────────────

  test('Per-customer usage limit reached → CUSTOMER_USAGE_LIMIT_REACHED', async () => {
    mockFindOne(makePromo({ maxTotalUses: 100, maxUsesPerCustomer: 1 }));
    mockCountDocuments(5, 1); // Total: 5 (fine), customer: 1 (at limit)

    const result = await validatePromoCode('SUMMER10', 'cust1', 1200);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('CUSTOMER_USAGE_LIMIT_REACHED');
  });

  // ── Minimum spend ───────────────────────────────────────────────────────────

  test('Minimum spend not met → MINIMUM_SPEND_NOT_MET', async () => {
    mockFindOne(makePromo({ minimumSpend: 1000 }));
    mockCountDocuments(0, 0);

    const result = await validatePromoCode('SUMMER10', 'cust1', 500); // subtotal = 500 < 1000
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('MINIMUM_SPEND_NOT_MET');
  });

  // ── No code provided ────────────────────────────────────────────────────────

  test('Empty code → NO_CODE', async () => {
    const result = await validatePromoCode('', 'cust1', 1200);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('NO_CODE');
  });
});
