# Business Requirements Document

**Project:** Cruise Booking System  
**Client:** Odysseus Solutions  
**Type:** Campus Technical Assessment  
**Date:** August 2026

---

## 1. Understanding of the Assessment

This assessment requires building a production-quality MERN stack application that allows a customer to:

1. Browse available cruises
2. Select a cruise and configure passengers (with age-based pricing)
3. Optionally add services and a promotional code
4. Receive a complete price quote
5. Confirm a booking and receive a unique reference
6. Retrieve that booking at any future time

The critical non-functional requirement is **price integrity**: the total charged at booking time must be permanently recorded and never recalculated using changed rules.

---

## 2. Business Rules Implemented

### 2.1 Cruise Fare Rules

| Age Range | Fare Multiplier |
|-----------|----------------|
| 0–4       | 0% (free)      |
| 5–11      | 50%            |
| 12–17     | 75%            |
| 18+       | 100%           |

### 2.2 Booking Constraints

- Minimum 1 passenger
- Maximum 6 passengers
- At least 1 passenger must be aged 18 or older
- Age must be a whole number between 0 and 120

### 2.3 Group Discount

Applied to cruise fare only. Does **not** apply to optional services.

| Passengers | Discount |
|-----------|---------|
| 1–2       | 0%      |
| 3–4       | 5%      |
| 5–6       | 10%     |

### 2.4 Optional Services

| Service          | Price                        |
|-----------------|------------------------------|
| Travel Insurance | $80 per passenger            |
| Wi-Fi            | $15 per passenger per night  |
| Shore Excursion  | $120 per passenger           |

### 2.5 Tax

- Rate: 12%
- Applied on: `taxable subtotal = (discounted cruise fare + services) - promo discount`
- Rounded to 2 decimal places

### 2.6 Promotional Codes

| Code     | Type       | Value | Conditions               |
|----------|------------|-------|--------------------------|
| SUMMER10 | percentage | 10%   | Jun–Aug 2026, min $1000  |
| FIRST150 | fixed      | $150  | Jan–Dec 2026, min $2000  |
| CREW25   | percentage | 25%   | Jan–Dec 2026, max 3 uses |
| WINTER5  | percentage | 5%    | Jan–Mar 2025 (expired)   |

A promo is rejected for any of these reasons (with reason code):

| Reason Code                | Condition                              |
|---------------------------|----------------------------------------|
| `INVALID_CODE`            | Code does not exist                    |
| `NOT_YET_VALID`           | Before `validFrom` date                |
| `EXPIRED`                 | After `validTo` date (end of day)      |
| `TOTAL_USAGE_LIMIT_REACHED` | maxTotalUses reached               |
| `CUSTOMER_USAGE_LIMIT_REACHED` | Customer used it maxUsesPerCustomer times |
| `MINIMUM_SPEND_NOT_MET`   | Booking subtotal below minimumSpend    |

Only one promo code per booking.

### 2.7 Capacity Management

- A cruise cannot be booked if `capacityLeft < number of passengers`
- Capacity is decremented atomically using MongoDB transactions
- A cruise with `capacityLeft = 0` is displayed as "Sold Out"

---

## 3. Assumptions Made

1. **Tax point**: Tax is applied after promo discount, on the full taxable amount. This mirrors common tax treatment for discounted goods.

2. **Customer identity**: Customers are identified by email. If a returning customer books again, their existing Customer record is reused (find-or-create pattern).

3. **Group discount boundary**: "6 passengers" is the maximum, so the 10% bracket covers exactly 5 and 6. The group discount applies to the total cruise fare (sum of all passenger fares), not per-passenger.

4. **Promo minimum spend**: Minimum spend is checked against the subtotal *before* promo is applied (i.e., the gross bookable amount), ensuring the promo makes economic sense.

5. **WINTER5 is expired by design**: Seeded as a fixture for testing the expired promo path.

6. **MongoDB Atlas required**: MongoDB standalone does not support multi-document transactions. The assessment requires Atlas.

7. **Price consistency at retrieval**: When retrieving a booking, the stored `pricing` object (not re-calculated values) is returned. The `pricingSnapshot` provides all reference data to verify historical pricing.

8. **Age validation**: Age must be a non-negative integer. Decimal ages are rejected.

---

## 4. Ambiguities & Resolutions

| Ambiguity | Decision |
|-----------|----------|
| "Do not permanently store capacity left as a manually calculated value" | We store `capacityLeft` in the Cruise document and decrement it atomically in a transaction — this is safe under concurrency |
| Exact tax point | After all discounts, before payment. Documented in TechnicalApproach.md |
| Whether promo applies to services | Promo is applied to the full subtotal (discounted cruise + services) |
| Minimum spend check timing | Checked against pre-promo subtotal |

---

## 5. Out of Scope

- Payment processing
- Email confirmation delivery
- User authentication / login for Admin, Agent and Customer roles
- Admin panel for managing cruises
- Cruise image uploads
- Cancellation or modification of bookings
