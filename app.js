// app.js

let bluetoothDevice;
let characteristic;
let socket;

const connectButton = document.getElementById("connect");
const sendDataButton = document.getElementById("sendData");
const statusDiv = document.getElementById("status");

// Web Bluetooth connection
async function connectToBluetooth() {
  try {
    // Request a Bluetooth device
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['battery_service'] }] // Use the correct service
    });

    // Connect to the device
    const server = await bluetoothDevice.gatt.connect();
    
    // Get the desired service and characteristic
    const service = await server.getPrimaryService('battery_service');
    characteristic = await service.getCharacteristic('battery_level');

    statusDiv.textContent = "Status: Connected to Bluetooth device!";
    sendDataButton.disabled = false; // Enable Send Data button
    
    // Start listening to the data from the characteristic
    characteristic.startNotifications().then(() => {
      characteristic.addEventListener('characteristicvaluechanged', handleBatteryLevelChanged);
    });
  } catch (error) {
    console.log('Bluetooth connection failed: ', error);
    statusDiv.textContent = "Status: Bluetooth connection failed!";
  }
}

// Handle the battery level data (as an example)
function handleBatteryLevelChanged(event) {
  const batteryLevel = event.target.value.getUint8(0);
  console.log(`Battery Level: ${batteryLevel}%`);
  statusDiv.textContent = `Battery Level: ${batteryLevel}%`;
}

// WebSocket connection
function initializeWebSocket() {
  socket = new WebSocket('ws://your-websocket-server-address');
  
  socket.onopen = () => {
    console.log('WebSocket connection established!');
    socket.send('Hello from the browser!');
  };
  
  socket.onmessage = (event) => {
    console.log('Received data: ', event.data);
    statusDiv.textContent = `Received message: ${event.data}`;
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error: ', error);
    statusDiv.textContent = 'Error with WebSocket connection!';
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');
  };
}

// Sending data through WebSocket
function sendDataToWebSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send('Sending data to the server!');
    console.log('Data sent to WebSocket server');
  } else {
    console.log('WebSocket is not connected');
  }
}

// Event Listeners
connectButton.addEventListener('click', () => {
  connectToBluetooth();
  initializeWebSocket(); // Initialize WebSocket after Bluetooth connection
});

sendDataButton.addEventListener('click', sendDataToWebSocket);
