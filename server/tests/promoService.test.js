/**
 * promoService.test.js
 *
 * Unit tests for Functional Requirement 4: Promotional Code Validation
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

describe('Functional Requirement 4: Promotional Code Validation', () => {
  // ── 1. Valid percentage & fixed promo ────────────────────────────────────────

  test('Valid percentage promo returns { valid: true, promo }', async () => {
    mockFindOne(makePromo());
    mockCountDocuments(0, 0);

    const result = await validatePromoCode('SUMMER10', 'cust1', 12000);
    expect(result.valid).toBe(true);
    expect(result.promo.code).toBe('SUMMER10');
    expect(result.promo.type).toBe('percentage');
    expect(result.promo.value).toBe(10);
  });

  test('Valid fixed promo returns { valid: true, promo }', async () => {
    mockFindOne(makePromo({ code: 'FIRST150', type: 'fixed', value: 150 }));
    mockCountDocuments(0, 0);

    const result = await validatePromoCode('FIRST150', 'cust1', 12000);
    expect(result.valid).toBe(true);
    expect(result.promo.code).toBe('FIRST150');
    expect(result.promo.type).toBe('fixed');
    expect(result.promo.value).toBe(150);
  });

  // ── 2. PROMO_NOT_FOUND ──────────────────────────────────────────────────────

  test('Code does not exist → PROMO_NOT_FOUND', async () => {
    mockFindOne(null);

    const result = await validatePromoCode('BADCODE', 'cust1', 12000);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('PROMO_NOT_FOUND');
    expect(result.message).toContain('was not found');
  });

  test('Empty code string → PROMO_NOT_FOUND', async () => {
    const result = await validatePromoCode('', 'cust1', 12000);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('PROMO_NOT_FOUND');
  });

  // ── 3. PROMO_NOT_STARTED ────────────────────────────────────────────────────

  test('Current date before validFrom → PROMO_NOT_STARTED', async () => {
    mockFindOne(
      makePromo({
        validFrom: new Date('2028-01-01'),
        validTo: new Date('2028-12-31'),
      })
    );

    const result = await validatePromoCode('FUTURE', 'cust1', 12000);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('PROMO_NOT_STARTED');
    expect(result.message).toContain('is not yet active');
  });

  // ── 4. PROMO_EXPIRED ────────────────────────────────────────────────────────

  test('Current date after validTo → PROMO_EXPIRED (e.g. WINTER5)', async () => {
    mockFindOne(
      makePromo({
        code: 'WINTER5',
        validFrom: new Date('2024-01-01'),
        validTo: new Date('2024-03-31'),
      })
    );

    const result = await validatePromoCode('WINTER5', 'cust1', 12000);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('PROMO_EXPIRED');
    expect(result.message).toBe('This promotional code has expired.');
  });

  // ── 5. PROMO_TOTAL_LIMIT_REACHED ────────────────────────────────────────────

  test('Total usage limit reached → PROMO_TOTAL_LIMIT_REACHED', async () => {
    mockFindOne(makePromo({ maxTotalUses: 3 }));
    mockCountDocuments(3, 0); // 3 uses already — at limit

    const result = await validatePromoCode('CREW25', 'cust1', 12000);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('PROMO_TOTAL_LIMIT_REACHED');
    expect(result.message).toContain('maximum total usage limit');
  });

  // ── 6. PROMO_CUSTOMER_LIMIT_REACHED ─────────────────────────────────────────

  test('Per-customer usage limit reached → PROMO_CUSTOMER_LIMIT_REACHED', async () => {
    mockFindOne(makePromo({ maxTotalUses: 100, maxUsesPerCustomer: 1 }));
    mockCountDocuments(5, 1); // Total: 5, customer: 1 (at customer limit)

    const result = await validatePromoCode('SUMMER10', 'cust1', 12000);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('PROMO_CUSTOMER_LIMIT_REACHED');
    expect(result.message).toContain('maximum allowed number of times');
  });

  // ── 7. PROMO_MINIMUM_SPEND_NOT_MET ──────────────────────────────────────────

  test('Minimum spend not met → PROMO_MINIMUM_SPEND_NOT_MET', async () => {
    mockFindOne(makePromo({ minimumSpend: 50000 }));
    mockCountDocuments(0, 0);

    const result = await validatePromoCode('SUMMER10', 'cust1', 30000); // subtotal = 30000 < 50000
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('PROMO_MINIMUM_SPEND_NOT_MET');
    expect(result.message).toContain('minimum spend');
  });
});
