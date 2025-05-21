// backend/models/ParkingSlot.js - MongoDB model for parking slots

const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: {
    type: Number,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  price: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'USAR'
  },
  floor: {
    type: Number,
    default: 1
  },
  reservedFor: {
    type: String,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);