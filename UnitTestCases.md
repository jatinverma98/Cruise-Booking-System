# Unit Test Cases Document

**Project:** Cruise Booking System  
**Test Runner:** Jest  
**Test Files:** `server/tests/pricing.test.js`, `server/tests/promoService.test.js`

---

## Running Tests

```bash
cd server
npm test
```

---

## 1. Fare Calculation by Age — Positive Cases

| Test ID | Input Age | Adult Fare | Expected Type | Expected Amount | Result |
|---------|-----------|-----------|---------------|-----------------|--------|
| TC-F-01 | 0         | $1200     | free          | $0              | ✅ |
| TC-F-02 | 4         | $1200     | free          | $0              | ✅ |
| TC-F-03 | 5         | $1200     | child         | $600            | ✅ |
| TC-F-04 | 11        | $1200     | child         | $600            | ✅ |
| TC-F-05 | 12        | $1200     | child         | $900            | ✅ |
| TC-F-06 | 17        | $1200     | child         | $900            | ✅ |
| TC-F-07 | 18        | $1200     | adult         | $1200           | ✅ |
| TC-F-08 | 65        | $1200     | adult         | $1200           | ✅ |

**Boundary conditions tested:**
- Age 0 (youngest free child boundary)
- Age 4 (last free age)
- Age 5 (first paid child age)
- Age 11 (last 50% age)
- Age 12 (first 75% age)
- Age 17 (last child age)
- Age 18 (first adult age)

---

## 2. Passenger Validation — Positive Cases

| Test ID | Passengers (Ages)         | Expected Result |
|---------|--------------------------|----------------|
| TC-PV-01 | [30]                    | Valid ✅         |
| TC-PV-02 | [30, 28]                | Valid ✅         |
| TC-PV-03 | [30, 28, 10]            | Valid ✅         |
| TC-PV-04 | [30, 28, 10, 7]         | Valid ✅         |
| TC-PV-05 | [30, 28, 10, 7, 4]      | Valid ✅         |
| TC-PV-06 | [30, 28, 10, 7, 4, 2]   | Valid ✅         |

---

## 3. Passenger Validation — Negative Cases

| Test ID | Input                          | Expected Error                 |
|---------|-------------------------------|-------------------------------|
| TC-PV-07 | [] (empty)                   | At least one passenger required |
| TC-PV-08 | 7 passengers                 | Maximum 6 passengers           |
| TC-PV-09 | [10, 5, 3] (no adults)       | At least one adult (18+) required |
| TC-PV-10 | [17, 15] (children only)     | At least one adult required    |

---

## 4. Group Discount — Positive Cases

| Test ID | Passenger Count | Expected Rate | Expected Amount (on $3600) |
|---------|----------------|--------------|---------------------------|
| TC-GD-01 | 1              | 0%           | $0                         |
| TC-GD-02 | 2              | 0%           | $0                         |
| TC-GD-03 | 3              | 5%           | $180                       |
| TC-GD-04 | 4              | 5%           | —                          |
| TC-GD-05 | 5              | 10%          | —                          |
| TC-GD-06 | 6              | 10%          | —                          |

---

## 5. Services Pricing

| Test ID | Service          | Passengers | Nights | Expected Total |
|---------|-----------------|-----------|--------|----------------|
| TC-SV-01 | Insurance only  | 2         | 7      | $160           |
| TC-SV-02 | Wi-Fi only      | 2         | 7      | $210           |
| TC-SV-03 | Shore only      | 2         | 7      | $240           |
| TC-SV-04 | All services    | 2         | 7      | $610           |
| TC-SV-05 | No services     | 2         | 7      | $0             |

**Calculation verification for TC-SV-04:**
- Insurance: 80 × 2 = 160
- Wi-Fi: 15 × 2 × 7 = 210
- Shore: 120 × 2 = 240
- Total: 610 ✅

---

## 6. Group Discount Not Applied to Services

| Test ID | Description | Expected |
|---------|-------------|---------|
| TC-GD-07 | 3 adults, insurance selected | Group discount applies to cruise fare (5%), NOT to insurance | ✅ |

**Calculation:**
- Cruise fare (3 × $1200): $3600
- Group discount (5%): -$180 → $3420
- Insurance (3 × $80): $240
- Subtotal: $3660
- Tax (12%): $439.2
- Total: $4099.2

---

## 7. Promotional Code — Positive Cases

| Test ID | Code     | Subtotal | Expected Discount |
|---------|---------|---------|------------------|
| TC-PC-01 | SUMMER10 (10%) | $1200 | $120            |
| TC-PC-02 | FIRST150 ($150 fixed) | $1200 | $150         |
| TC-PC-03 | No promo | $1200 | $0               |

---

## 8. Promotional Code — Negative Cases

| Test ID | Scenario                  | Expected Reason Code            |
|---------|--------------------------|--------------------------------|
| TC-PC-04 | Code does not exist      | `INVALID_CODE`                  |
| TC-PC-05 | Code not yet active      | `NOT_YET_VALID`                 |
| TC-PC-06 | WINTER5 (expired Mar 2025) | `EXPIRED`                     |
| TC-PC-07 | Max total uses reached   | `TOTAL_USAGE_LIMIT_REACHED`     |
| TC-PC-08 | Customer used max times  | `CUSTOMER_USAGE_LIMIT_REACHED`  |
| TC-PC-09 | Subtotal below min spend | `MINIMUM_SPEND_NOT_MET`         |
| TC-PC-10 | Empty string code        | `NO_CODE`                       |

---

## 9. Tax Calculation

| Test ID | Taxable Amount | Expected Tax (12%) |
|---------|---------------|-------------------|
| TC-TX-01 | $1280 (1 adult + insurance) | $153.60 |
| TC-TX-02 | $1080 (1 adult with 10% promo) | $129.60 |

---

## 10. Pricing Snapshot Integrity

| Test ID | Assertion |
|---------|----------|
| TC-PS-01 | Snapshot contains adultFare at time of quote |
| TC-PS-02 | Snapshot contains taxRate = 12 |
| TC-PS-03 | Snapshot contains service prices (insurance, wifi, shore) |
| TC-PS-04 | Snapshot contains promoSnapshot when promo applied |
| TC-PS-05 | Snapshot promoSnapshot is null when no promo applied |

---

## 11. Capacity Scenarios

| Test ID | Scenario | Expected |
|---------|----------|---------|
| TC-CAP-01 | Zero-capacity cruise (MSC Seascape) | Rejected with "sold out" message |
| TC-CAP-02 | Booking more passengers than capacity | Rejected with capacity error |
| TC-CAP-03 | Booking exactly available capacity | Accepted |
| TC-CAP-04 | Concurrent bookings (atomic decrement) | Only one succeeds if only 1 spot left |

---

## 12. Booking Reference

| Test ID | Scenario | Expected |
|---------|----------|---------|
| TC-REF-01 | Successful booking | Reference starts with "BK-" |
| TC-REF-02 | Reference is 10 chars (BK- + 7) | Format correct |
| TC-REF-03 | Two bookings | Different references |

---

## 13. Full Booking Flow (Manual / Integration)

| Test ID | Scenario | Steps |
|---------|----------|-------|
| TC-INT-01 | Complete booking | Select cruise → add passengers → add services → apply promo → get quote → enter customer → confirm → receive reference → retrieve booking |
| TC-INT-02 | Retrieve booking | Enter reference in `/booking` search → booking displays correctly |
| TC-INT-03 | Historical price | Change adultFare in DB → retrieve old booking → verify original fare in pricingSnapshot |

---

## Summary

| Category          | Total Tests | Positive | Negative | Boundary |
|------------------|------------|---------|---------|---------|
| Fare Calculation  | 8          | 8       | 0       | 4       |
| Passenger Validation | 10      | 6       | 4       | 2       |
| Group Discount    | 7          | 6       | 0       | 4       |
| Services Pricing  | 5          | 5       | 0       | 0       |
| Promo Code        | 10         | 3       | 7       | 1       |
| Tax               | 2          | 2       | 0       | 0       |
| Price Snapshot    | 5          | 5       | 0       | 0       |
| Capacity          | 4          | 2       | 2       | 1       |
| Booking Reference | 3          | 3       | 0       | 1       |
| Integration       | 3          | 3       | 0       | 0       |
| **Total**         | **57**     | **43**  | **13**  | **13**  |
