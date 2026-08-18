const express = require('express');
const router = express.Router();
const { getQuote, getRules } = require('../controllers/pricingController');

router.post('/quote', getQuote);
router.get('/rules', getRules);

module.exports = router;
