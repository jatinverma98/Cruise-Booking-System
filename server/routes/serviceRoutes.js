const express = require('express');
const router = express.Router();
const { getServices, updateService } = require('../controllers/serviceController');

router.get('/', getServices);
router.put('/:key', updateService);

module.exports = router;
