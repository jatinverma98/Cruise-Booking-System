require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { validatePromoCode } = require('../services/promoService');

async function testLivePromos() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const tests = [
    { code: 'SUMMER10', subtotal: 100000, desc: 'SUMMER10 (10% percentage promo with min spend met)' },
    { code: 'FIRST150', subtotal: 100000, desc: 'FIRST150 (₹150 fixed promo with min spend met)' },
    { code: 'WINTER5', subtotal: 50000, desc: 'WINTER5 (Expired promo -> should return PROMO_EXPIRED)' },
    { code: 'INVALID99', subtotal: 50000, desc: 'INVALID99 (Non-existent promo -> should return PROMO_NOT_FOUND)' },
    { code: 'SUMMER10', subtotal: 500, desc: 'SUMMER10 with subtotal < minSpend -> PROMO_MINIMUM_SPEND_NOT_MET' },
  ];

  for (const t of tests) {
    const res = await validatePromoCode(t.code, null, t.subtotal);
    console.log(`\nTesting: ${t.desc}`);
    console.log('Result:', JSON.stringify(res, null, 2));
  }

  await mongoose.disconnect();
}

testLivePromos().catch(console.error);
