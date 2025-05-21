const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

// ESP32 endpoint to update parking data
router.post('/update-parking', parkingController.updateParkingData);

// Frontend endpoint to get current parking data
router.get('/parking-data', parkingController.getParkingData);

// Get historical parking data
router.get('/parking-history', parkingController.getParkingHistory);

module.exports = router;
