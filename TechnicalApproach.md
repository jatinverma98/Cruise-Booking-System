# Technical Approach Document

**Project:** Cruise Booking System  
**Stack:** MERN (MongoDB · Express · React · Node.js)  
**Date:** August 2026

---

## 1. Architecture

```
┌─────────────────────────────────────────┐
│           React Frontend (Vite)          │
│  React Router · Tailwind CSS · Axios    │
└───────────────────┬─────────────────────┘
                    │ HTTP /api/*
┌───────────────────▼─────────────────────┐
│          Express.js REST API             │
│  Routes → Controllers → Services        │
└───────────────────┬─────────────────────┘
                    │ Mongoose
┌───────────────────▼─────────────────────┐
│         MongoDB Atlas                    │
│  Replica Set (enables transactions)     │
└─────────────────────────────────────────┘
```

The frontend is completely decoupled from the backend. All business logic lives in the `server/services/` layer. Express controllers are thin orchestrators that call services and return responses.

---

## 2. MongoDB Data Model

### Cruise
```json
{
  "_id": ObjectId,
  "cruiseLine": "Royal Caribbean",
  "ship": "Wonder of the Seas",
  "destination": "Caribbean",
  "nights": 7,
  "adultFare": 1200,
  "capacityLeft": 12
}
```

`capacityLeft` is the live available capacity. It is decremented atomically in a MongoDB transaction during booking using `findOneAndUpdate + $inc`. This is the safest approach for preventing overselling without a separate lock collection.

### Customer
```json
{
  "_id": ObjectId,
  "name": "Jane Smith",
  "email": "jane@example.com"
}
```

Customers are uniquely identified by email. A find-or-create pattern is used so a returning customer doesn't create a duplicate record.

### Booking
```json
{
  "reference": "BK-ABC1234",
  "customerId": ObjectId,
  "cruiseId": ObjectId,
  "passengers": [{ "age": 30, "fareType": "adult", "fareAmount": 1200 }],
  "services": { "insurance": true, "wifi": false, "shoreExcursion": false },
  "pricing": {
    "cruiseFare": 1200,
    "groupDiscount": 0,
    "promotionalDiscount": 120,
    "servicesTotal": 80,
    "subtotal": 1160,
    "tax": 139.2,
    "total": 1299.2
  },
  "pricingSnapshot": {
    "adultFare": 1200,
    "childFareRules": { "0-4": 0, "5-11": 0.5, "12-17": 0.75 },
    "groupDiscountRules": { "1-2": 0, "3-4": 0.05, "5-6": 0.10 },
    "servicePrices": { "insurance": 80, "wifi": 15, "shoreExcursion": 120 },
    "taxRate": 12,
    "promoSnapshot": { "code": "SUMMER10", "type": "percentage", "value": 10 }
  }
}
```

### PromoCode
```json
{
  "code": "SUMMER10",
  "type": "percentage",
  "value": 10,
  "validFrom": ISODate,
  "validTo": ISODate,
  "maxTotalUses": 100,
  "maxUsesPerCustomer": 1,
  "minimumSpend": 1000
}
```

### PromoRedemption
```json
{
  "promoCodeId": ObjectId,
  "bookingId": ObjectId,
  "customerId": ObjectId,
  "createdAt": ISODate
}
```

---

## 3. API Structure

| Method | Endpoint                   | Action                            |
|--------|----------------------------|------------------------------------|
| GET    | /api/cruises               | List all cruises (filterable)      |
| GET    | /api/cruises/:id           | Get one cruise                     |
| POST   | /api/pricing/quote         | Calculate quote (no booking)       |
| POST   | /api/promos/validate       | Validate promo code                |
| POST   | /api/bookings              | Create booking (transactional)     |
| GET    | /api/bookings/:reference   | Retrieve booking                   |

Query filters on `/api/cruises`:
- `?destination=Caribbean`
- `?maxFare=1500`
- `?minNights=5&maxNights=10`

---

## 4. Pricing Calculation

All calculation happens in `server/services/pricingService.js`.

### Step-by-step

```
1. Per-passenger fare:
   fare = adultFare × ageBracketMultiplier

2. Total cruise fare:
   cruiseFare = sum(all passenger fares)

3. Group discount:
   groupDiscountAmount = cruiseFare × groupDiscountRate(passengerCount)
   discountedCruiseFare = cruiseFare - groupDiscountAmount

4. Optional services:
   servicesTotal =
     (insurance ? 80 × n : 0) +
     (wifi ? 15 × n × nights : 0) +
     (shore ? 120 × n : 0)

5. Subtotal before promo:
   subtotalBeforePromo = discountedCruiseFare + servicesTotal

6. Promo discount:
   percentage: promoDiscount = subtotalBeforePromo × (value/100)
   fixed:      promoDiscount = min(value, subtotalBeforePromo)

7. Taxable subtotal:
   taxable = subtotalBeforePromo - promoDiscount

8. Tax:
   tax = taxable × 0.12

9. Total:
   total = taxable + tax
```

### Why this tax point?

Tax is applied after all discounts so that the customer pays tax only on the amount they actually owe. This mirrors standard consumer tax treatment and avoids taxing discounted amounts.

---

## 5. Transaction Strategy

Booking creation uses a **MongoDB multi-document transaction** with:

```
session.startTransaction()
  → findOneAndUpdate (capacity gate + atomic decrement)
  → findOne / create (customer)
  → countDocuments (promo usage checks)
  → Booking.create
  → PromoRedemption.create (if applicable)
session.commitTransaction()
```

On any failure: `session.abortTransaction()` → full rollback.

This ensures:
- Capacity is never decremented without a booking being created
- Promo usage is never recorded without a booking being created
- No partial state can exist after a failure

---

## 6. Capacity Protection

```javascript
Cruise.findOneAndUpdate(
  { _id: cruiseId, capacityLeft: { $gte: ages.length } },
  { $inc: { capacityLeft: -ages.length } },
  { new: true, session }
)
```

If `capacityLeft` is insufficient, the `$gte` condition fails and `findOneAndUpdate` returns `null`. This is a single atomic operation — no race condition is possible between the read and the write.

---

## 7. Promo Redemption Strategy

Usage is tracked by counting `PromoRedemption` documents:

```javascript
// Total uses
await PromoRedemption.countDocuments({ promoCodeId: promo._id })

// Per-customer uses  
await PromoRedemption.countDocuments({ promoCodeId: promo._id, customerId })
```

This is done **inside the transaction session** so counts are consistent with the in-progress transaction.

Using a counter field would risk inconsistency under concurrent requests. Document counting within a session is the correct approach for MongoDB.

---

## 8. Price Snapshot Strategy

When a booking is created, `buildQuote()` returns a `pricingSnapshot` containing:

- `adultFare` — the fare at the time of booking
- `childFareRules` — age brackets
- `groupDiscountRules` — discount thresholds
- `servicePrices` — per-service unit prices
- `taxRate` — the rate applied
- `promoSnapshot` — the promo code, type, and value used

This snapshot is stored inside the Booking document. When the booking is retrieved later, the response includes this snapshot. If a fare ever changes, old bookings still show the original `pricingSnapshot.adultFare`.

---

## 9. Booking Reference Generation

```javascript
const { nanoid } = require('nanoid');
const reference = `BK-${nanoid(7).toUpperCase()}`;
// Example: BK-A3X7K2P
```

nanoid generates a URL-safe 7-character alphanumeric string. The `BK-` prefix makes references visually identifiable. Collision probability is negligible for expected booking volumes.

---

## 10. What Is Complete

- [x] All 5 Mongoose models
- [x] Full pricing service with all age brackets, group discount, services, promo, tax
- [x] Promo validation service (all 6 rejection reasons)
- [x] CRUD APIs: cruises, pricing quote, promo validate, booking create, booking retrieve
- [x] MongoDB transaction in booking creation
- [x] Atomic capacity decrement
- [x] Seed data: 5 cruises, 4 promo codes
- [x] React frontend: 3 pages, 13 components
- [x] Real-time quote fetching (debounced)
- [x] Jest unit tests: pricing, promo validation
- [x] Full documentation

## 11. What Could Be Improved With More Time

- **Booking cancellation** with capacity restoration
- **Email confirmation** via SendGrid/Nodemailer
- **Authentication** — tie bookings to logged-in users
- **Admin panel** — manage cruises, view all bookings
- **Integration tests** for full booking flow with a real MongoDB test instance
- **Rate limiting** on the booking API
- **Pagination** on the cruise listing
- **Image generation** for each cruise destination
- **Accessibility audit** (ARIA labels, keyboard navigation)
- **CI/CD pipeline** for automated testing and deployment
