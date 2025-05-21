// backend/routes/parkingRoutes.js - API routes for parking operations

const express = require('express');
const router = express.Router();
const ParkingSlot = require('./parkingModel');

// Get all parking slots
router.get('/', async (req, res) => {
  try {
    const slots = await ParkingSlot.find({});
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get parking slots by location
router.get('/location/:location', async (req, res) => {
  try {
    const slots = await ParkingSlot.find({ location: req.params.location });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific parking slot
router.get('/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new parking slot
router.post('/', async (req, res) => {
  const slot = new ParkingSlot({
    slotNumber: req.body.slotNumber,
    status: req.body.status,
    price: req.body.price,
    location: req.body.location,
    floor: req.body.floor
  });

  try {
    const newSlot = await slot.save();
    res.status(201).json(newSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Book a parking slot
router.patch('/book/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    
    if (slot.status !== 'available') {
      return res.status(400).json({ message: 'Parking slot is not available' });
    }
    
    slot.status = 'occupied';
    slot.reservedFor = req.body.reservedFor || 'Anonymous';
    slot.lastUpdated = Date.now();
    
    const updatedSlot = await slot.save();
    res.json(updatedSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Release a parking slot
router.patch('/release/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    
    slot.status = 'available';
    slot.reservedFor = null;
    slot.lastUpdated = Date.now();
    
    const updatedSlot = await slot.save();
    res.json(updatedSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a parking slot
router.patch('/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    
    if (req.body.status) slot.status = req.body.status;
    if (req.body.price) slot.price = req.body.price;
    if (req.body.location) slot.location = req.body.location;
    if (req.body.floor) slot.floor = req.body.floor;
    slot.lastUpdated = Date.now();
    
    const updatedSlot = await slot.save();
    res.json(updatedSlot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a parking slot
router.delete('/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found' });
    }
    
    await slot.remove();
    res.json({ message: 'Parking slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Initialize parking slots (for seeding data)
router.post('/initialize', async (req, res) => {
  try {
    // First, delete all existing slots
    await ParkingSlot.deleteMany({});
    
    // Create initial data
    const initialSlots = [];
    const locations = ['USAR', 'Downtown', 'Airport', 'Mall'];
    
    for (let location of locations) {
      for (let i = 1; i <= 10; i++) {
        initialSlots.push({
          slotNumber: i,
          status: Math.random() > 0.3 ? 'available' : 'occupied', // 70% available
          price: '$5/hr',
          location: location,
          floor: Math.ceil(i/5)
        });
      }
    }
    
    const slots = await ParkingSlot.insertMany(initialSlots);
    res.status(201).json({ message: `${slots.length} parking slots initialized` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;