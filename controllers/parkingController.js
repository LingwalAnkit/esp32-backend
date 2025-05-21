const ParkingRecord = require('../models/parkingModel');
const { getTimeAgo } = require('../utils/timeUtils');

// In-memory storage for current parking state
let parkingData = {
  total: 10,
  occupied: 0,
  available: 10,
  lastUpdated: new Date().toISOString()
};

// Get current parking data
exports.getCurrentParkingData = () => {
  return {
    ...parkingData,
    status: parkingData.available > 0 ? 'Available' : 'Full',
    occupancyRate: ((parkingData.occupied / parkingData.total) * 100).toFixed(1) + '%',
    updatedAgo: getTimeAgo(new Date(parkingData.lastUpdated))
  };
};

// Get parking data for frontend
exports.getParkingData = async (req, res) => {
  try {
    res.status(200).json(this.getCurrentParkingData());
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update parking data from ESP32
exports.updateParkingData = async (req, res) => {
  try {
    const { total, occupied } = req.body;
    console.log('Received parking data:', req.body);
    
    // Validate data
    if (total === undefined || occupied === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: total and occupied' 
      });
    }
    
    if (!Number.isInteger(total) || !Number.isInteger(occupied)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Total and occupied must be integers' 
      });
    }
    
    if (total < 0 || occupied < 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Total and occupied must be non-negative' 
      });
    }
    
    if (occupied > total) {
      return res.status(400).json({ 
        success: false, 
        error: 'Occupied spots cannot exceed total spots' 
      });
    }
    
    // Update parking data
    const available = total - occupied;
    parkingData = {
      total,
      occupied,
      available,
      lastUpdated: new Date().toISOString()
    };
    console.log('Parking data before saving:', parkingData);
    
    console.log('Parking data updated:', parkingData);
    
    // Save to database if connected
    try {
      const record = new ParkingRecord({
        timestamp: new Date(),
        total,
        occupied,
        available
      });
      await record.save();
    } catch (dbError) {
      console.error('Database error:', dbError.message);
      // Continue even if DB save fails
    }
    
    // Notify connected clients via WebSockets
    const io = req.app.get('io');
    if (io) {
      io.emit('parkingUpdate', this.getCurrentParkingData());
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Parking data updated successfully',
      data: this.getCurrentParkingData()
    });
  } catch (error) {
    console.error('Error updating parking data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get historical parking data
exports.getParkingHistory = async (req, res) => {
  try {
    // Get query parameters
    const { limit = 24, period = 'hour' } = req.query;
    
    // Calculate time range
    const now = new Date();
    let startTime;
    
    switch(period) {
      case 'day':
        startTime = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startTime = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startTime = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'hour':
      default:
        startTime = new Date(now.setHours(now.getHours() - 1));
    }
    
    // Query database
    const history = await ParkingRecord.find({
      timestamp: { $gte: startTime }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
