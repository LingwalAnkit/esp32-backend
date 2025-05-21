// backend/scripts/seed.js - Script to populate the database with initial data

const mongoose = require('mongoose');
const ParkingSlot = require('./parkingModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/parkingDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const seedDatabase = async () => {
  try {
    // Clear the existing database
    await ParkingSlot.deleteMany({});
    console.log('Cleared existing parking slots');
    
    // Create initial data - 3 slots per location, all available
    const initialSlots = [];
    const locations = ['USAR', 'USDI', 'USAP', 'JHILMIL-COLONY'];
    
    for (let location of locations) {
      for (let i = 1; i <= 3; i++) {
        initialSlots.push({
          slotNumber: i,
          status: 'available', // All slots available initially
          price: '$5/hr',
          location: location,
          floor: 1
        });
      }
    }
    
    const slots = await ParkingSlot.insertMany(initialSlots);
    console.log(`Created ${slots.length} parking slots (${slots.length/locations.length} per location)`);
    
    // Disconnect from database
    mongoose.disconnect();
    console.log('Database seeding completed!');
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();