/**
 * seedData.js
 *
 * Seeds the database with:
 *  - 5 cruises as specified in the assessment
 *  - 4 promotional codes
 *  - Central Pricing Rules & Optional Service rates
 *
 * Usage:
 *   cd server
 *   node seed/seedData.js
 *
 * WARNING: This will clear existing cruises, promo codes, and pricing rules before seeding.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Cruise = require('../models/Cruise');
const PromoCode = require('../models/PromoCode');
const PricingRule = require('../models/PricingRule');

const cruises = [
  {
    cruiseLine: 'Royal Caribbean',
    ship: 'Wonder of the Seas',
    destination: 'Caribbean',
    nights: 7,
    adultFare: 99999,
    capacityLeft: 12,
  },
  {
    cruiseLine: 'Celebrity Cruises',
    ship: 'Celebrity Beyond',
    destination: 'Mediterranean',
    nights: 10,
    adultFare: 154000,
    capacityLeft: 4,
  },
  {
    cruiseLine: 'Norwegian Cruise Line',
    ship: 'Norwegian Prima',
    destination: 'Alaska',
    nights: 5,
    adultFare: 79000,
    capacityLeft: 20,
  },
  {
    cruiseLine: 'Princess Cruises',
    ship: 'Sky Princess',
    destination: 'Northern Europe',
    nights: 12,
    adultFare: 175000,
    capacityLeft: 2,
  },
  {
    cruiseLine: 'MSC Cruises',
    ship: 'MSC Seascape',
    destination: 'Bahamas',
    nights: 4,
    adultFare: 58500,
    capacityLeft: 0, // Intentionally sold out — tests zero-capacity path
  },
];

const promoCodes = [
  {
    code: 'SUMMER10',
    type: 'percentage',
    value: 10,
    validFrom: new Date('2026-06-01'),
    validTo: new Date('2026-08-31'),
    maxTotalUses: 100,
    maxUsesPerCustomer: 1,
    minimumSpend: 1000,
  },
  {
    code: 'FIRST150',
    type: 'fixed',
    value: 150,
    validFrom: new Date('2026-01-01'),
    validTo: new Date('2026-12-31'),
    maxTotalUses: 500,
    maxUsesPerCustomer: 1,
    minimumSpend: 2000,
  },
  {
    code: 'CREW25',
    type: 'percentage',
    value: 25,
    validFrom: new Date('2026-01-01'),
    validTo: new Date('2026-12-31'),
    maxTotalUses: 3,
    maxUsesPerCustomer: 3,
    minimumSpend: 0,
  },
  {
    // Intentionally expired — used to test the EXPIRED promo code path
    code: 'WINTER5',
    type: 'percentage',
    value: 5,
    validFrom: new Date('2025-01-01'),
    validTo: new Date('2025-03-31'),
    maxTotalUses: 1000,
    maxUsesPerCustomer: 5,
    minimumSpend: 0,
  },
];

const defaultPricingRule = {
  key: 'default',
  isActive: true,
  taxRate: 0.12,
  childFareRules: {
    '0-4': 0,      // Free
    '5-11': 0.5,   // 50%
    '12-17': 0.75, // 75%
    '18+': 1.0,    // 100%
  },
  groupDiscountRules: {
    '1-2': 0,    // 0%
    '3-4': 0.05, // 5%
    '5-6': 0.10, // 10%
  },
  servicePrices: {
    insurance: 6700,       // ₹6,700 per passenger
    wifi: 1260,            // ₹1,260 per passenger per night
    shoreExcursion: 10000, // ₹10,000 per passenger
  },
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Cruise.deleteMany({});
    await PromoCode.deleteMany({});
    await PricingRule.deleteMany({});
    console.log('🗑️  Cleared existing cruises, promo codes, and pricing rules');

    // Insert cruises
    const insertedCruises = await Cruise.insertMany(cruises);
    console.log(`🚢 Seeded ${insertedCruises.length} cruises:`);
    insertedCruises.forEach((c) =>
      console.log(`   - ${c.cruiseLine} | ${c.ship} | ${c.destination} | ₹${c.adultFare.toLocaleString('en-IN')}/adult`)
    );

    // Insert promo codes
    const insertedPromos = await PromoCode.insertMany(promoCodes);
    console.log(`🏷️  Seeded ${insertedPromos.length} promo codes:`);
    insertedPromos.forEach((p) =>
      console.log(`   - ${p.code} (${p.type}: ${p.value}${p.type === 'percentage' ? '%' : '$'})`)
    );

    // Insert pricing rule
    const insertedRule = await PricingRule.create(defaultPricingRule);
    console.log(`⚙️  Seeded MongoDB PricingRule (Tax: ${insertedRule.taxRate * 100}%, Insurance: ₹${insertedRule.servicePrices.insurance}, Wi-Fi: ₹${insertedRule.servicePrices.wifi}/night, Shore: ₹${insertedRule.servicePrices.shoreExcursion})`);

    console.log('\n✅ Seed complete!');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seed();
