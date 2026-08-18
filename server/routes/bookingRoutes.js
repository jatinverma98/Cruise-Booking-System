const express = require('express');
const router = express.Router();
const { createBooking, getBookingByReference } = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/:reference', getBookingByReference);

module.exports = router;
