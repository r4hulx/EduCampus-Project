import { io } from 'socket.io-client';

// Define the URL of your backend server
const SOCKET_URL = 'https://educampus-project.onrender.com';

// Create the socket connection
// We add 'autoConnect: false' so we can manually connect when we want to
const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export default socket;