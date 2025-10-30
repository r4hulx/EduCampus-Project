import { io } from 'socket.io-client';

// Define the URL of your backend server
const SOCKET_URL = 'http://localhost:5001';

// Create the socket connection
// We add 'autoConnect: false' so we can manually connect when we want to
const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;