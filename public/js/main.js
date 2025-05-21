document.addEventListener('DOMContentLoaded', function() {
  // DOM elements
  const parkingStatus = document.getElementById('parking-status');
  const lastUpdated = document.getElementById('last-updated');
  const availableSpots = document.getElementById('available-spots');
  const occupiedSpots = document.getElementById('occupied-spots');
  const totalSpots = document.getElementById('total-spots');
  const occupancyRate = document.getElementById('occupancy-rate');
  const connectionIndicator = document.getElementById('connection-indicator');
  const connectionText = document.getElementById('connection-text');
  
  // Initialize Socket.io connection
  const socket = io();
  
  // Handle connection events
  socket.on('connect', () => {
    connectionIndicator.className = 'connected';
    connectionText.textContent = 'Connected';
  });
  
  socket.on('disconnect', () => {
    connectionIndicator.className = 'disconnected';
    connectionText.textContent = 'Disconnected';
  });
  
  // Handle real-time parking updates
  socket.on('parkingUpdate', (data) => {
    updateParkingUI(data);
  });
  
  // Fetch initial data in case WebSocket connection fails
  fetchParkingData();
  
  // Fallback to HTTP polling every 30 seconds if WebSocket fails
  setInterval(() => {
    if (socket.disconnected) {
      fetchParkingData();
    }
  }, 30000);
  
  // Function to fetch parking data via HTTP
  function fetchParkingData() {
    fetch('/api/parking-data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        updateParkingUI(data);
      })
      .catch(error => {
        console.error('Error fetching parking data:', error);
        connectionIndicator.className = 'disconnected';
        connectionText.textContent = 'Connection Error';
      });
  }
  
  // Update UI with parking data
  function updateParkingUI(data) {
    // Update stats
    availableSpots.textContent = data.available;
    occupiedSpots.textContent = data.occupied;
    totalSpots.textContent = data.total;
    occupancyRate.textContent = data.occupancyRate;
    lastUpdated.textContent = data.updatedAgo;
    
    // Update status indicator
    if (data.available > 0) {
      parkingStatus.textContent = 'Parking Available';
      parkingStatus.className = 'status-available';
    } else {
      parkingStatus.textContent = 'Parking Full';
      parkingStatus.className = 'status-full';
    }
  }
});
