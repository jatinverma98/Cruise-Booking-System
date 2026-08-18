# Cruise Booking System

A full-stack MERN application for booking cruise vacations, built as the Odysseus Solutions campus technical assessment.

---

## Features

- 🚢 Browse 5 premium cruises with filtering by destination and fare
- 👨‍👩‍👧‍👦 Add up to 6 passengers with age-based fare calculation
- 🛡️ Optional services: Travel Insurance, Wi-Fi, Shore Excursion
- 🏷️ Promotional code support with full validation
- 💰 Real-time price breakdown with 12% tax
- 🔒 Atomic capacity protection using MongoDB transactions
- 📜 Historical price snapshot — bookings never change after confirmation
- 🔍 Retrieve any booking by reference code

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS, React Router |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB Atlas (Mongoose ODM)        |
| Testing   | Jest, Supertest                     |

---

## Project Structure

```
cruise-booking-system/
├── client/                   # Vite + React frontend
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route-level page components
│       └── services/api.js   # Axios API service layer
│
├── server/                   # Express backend
│   ├── config/db.js          # MongoDB connection
│   ├── models/               # Mongoose schemas
│   ├── services/             # Business logic (pricing, promo)
│   ├── controllers/          # Route handlers
│   ├── routes/               # Express routers
│   ├── middleware/           # Error handler
│   ├── seed/seedData.js      # DB seeder
│   └── tests/               # Jest test suites
│
├── .env.example
├── README.md
├── BusinessRequirements.md
├── TechnicalApproach.md
└── UnitTestCases.md
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (replica set required for transactions)

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Variables

Copy `.env.example` to `server/.env` and fill in your values:

```bash
cp .env.example server/.env
```

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/cruise-booking
PORT=5000
CLIENT_URL=http://localhost:5173
```

> ⚠️ **MongoDB Atlas is required** — local standalone MongoDB does not support transactions used for capacity safety.

### 3. Seed the Database

```bash
cd server
npm run seed
```

This clears existing data and seeds:
- 5 cruises
- 4 promotional codes

### 4. Start the Backend

```bash
cd server
npm run dev
```

Server runs at: `http://localhost:5000`

### 5. Start the Frontend

```bash
cd client
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables

| Variable     | Description                           | Example                        |
|-------------|---------------------------------------|--------------------------------|
| `MONGO_URI` | MongoDB Atlas connection string       | `mongodb+srv://...`            |
| `PORT`      | Express server port                   | `5000`                         |
| `CLIENT_URL`| Frontend origin for CORS              | `http://localhost:5173`        |

---

## API Overview

| Method | Endpoint                   | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | `/api/cruises`             | List all cruises (with filters)    |
| GET    | `/api/cruises/:id`         | Get single cruise                  |
| POST   | `/api/pricing/quote`       | Calculate price quote (no booking) |
| POST   | `/api/promos/validate`     | Validate a promo code              |
| POST   | `/api/bookings`            | Create a confirmed booking         |
| GET    | `/api/bookings/:reference` | Retrieve booking by reference      |
| GET    | `/api/health`              | Server health check                |

### Cruise Filter Query Params

```
GET /api/cruises?destination=Caribbean&maxFare=1500
```

---

## Promo Codes (Seeded)

| Code      | Type       | Value | Valid Period           | Notes          |
|-----------|------------|-------|------------------------|----------------|
| SUMMER10  | percentage | 10%   | Jun–Aug 2026           | Min $1000 spend |
| FIRST150  | fixed      | $150  | Jan–Dec 2026           | Min $2000 spend |
| CREW25    | percentage | 25%   | Jan–Dec 2026           | Max 3 total uses |
| WINTER5   | percentage | 5%    | Jan–Mar 2025 (expired) | Test expired path |

---

## Pricing Rules Summary

| Passenger Age | Fare       |
|--------------|------------|
| 0–4          | Free       |
| 5–11         | 50%        |
| 12–17        | 75%        |
| 18+          | 100%       |

| Passengers | Group Discount |
|-----------|----------------|
| 1–2       | 0%             |
| 3–4       | 5%             |
| 5–6       | 10%            |

Tax: **12%** applied on (discounted cruise fare + services - promo)

---

## Testing

```bash
cd server
npm test
```

Tests cover: fare brackets, group discounts, services pricing, promo validation (all rejection cases), and price snapshots.

---

## Assumptions

1. Tax is applied post-promo on the full taxable subtotal (cruise fare + services).
2. Customer records are reused by email across multiple bookings.
3. `WINTER5` is intentionally expired — included as a test fixture.
4. MongoDB Atlas (replica set) is required for transaction support.

---

## License

MIT — Built for Odysseus Solutions Technical Assessment
