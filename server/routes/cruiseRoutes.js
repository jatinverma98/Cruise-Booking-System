const express = require('express');
const router = express.Router();
const { getAllCruises, getCruiseById } = require('../controllers/cruiseController');

router.get('/', getAllCruises);
router.get('/:id', getCruiseById);

module.exports = router;
