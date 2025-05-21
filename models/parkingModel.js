const mongoose = require('mongoose');

const parkingRecordSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  total: {
    type: Number,
    required: true
  },
  occupied: {
    type: Number,
    required: true
  },
  available: {
    type: Number,
    required: true
  }
});

// Create index for efficient time-based queries
parkingRecordSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);
