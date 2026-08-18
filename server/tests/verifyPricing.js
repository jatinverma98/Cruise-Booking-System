require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Cruise = require('../models/Cruise');
const { buildQuoteAsync } = require('../services/pricingService');

async function testPricing() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const cruise = await Cruise.findOne({ capacityLeft: { $gt: 0 } });
  console.log(`Testing with Cruise: ${cruise.ship} (Fare: ₹${cruise.adultFare}, Duration: ${cruise.nights} nights)`);

  // 4 passengers: 2 Adults (100%), 1 Child (50%), 1 Infant (Free)
  const ages = [32, 28, 9, 3];
  const services = { insurance: true, wifi: true, shoreExcursion: true };

  const quote = await buildQuoteAsync(cruise, ages, services, null);

  console.log('\n📊 AUTHORITATIVE PRICING BREAKDOWN (FR3 Format):');
  console.log(JSON.stringify(quote.pricing, null, 2));

  console.log('\n📋 PER-PASSENGER BREAKDOWN:');
  quote.passengers.forEach((p, i) => {
    console.log(`   Passenger ${i + 1} (Age ${p.age}): ${p.fareType} -> ₹${p.fareAmount}`);
  });

  await mongoose.disconnect();
}

testPricing().catch(console.error);
