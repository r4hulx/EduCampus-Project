require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/messageModel');
const User = require('./models/userModel');
const SubjectRoom = require('./models/subjectRoomModel');
const { connectCloudinary } = require('./config/cloudinary');

// --- Your route imports ---
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const messageRoutes = require('./routes/messageRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();
connectCloudinary();

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Create the HTTP server and wrap the Express app ---
const server = http.createServer(app);

// --- Initialize Socket.IO and configure CORS ---
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// 
// --- SOCKET.IO BLOCK ---
// 
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // (joinRoom listener from previous step)
  socket.on('joinRoom', async ({ roomId, user }) => {
    if (!user || !user.username) {
      return console.log(`Invalid user data for joinRoom from socket ${socket.id}`);
    }
    
    socket.data.userId = user._id;
    socket.data.username = user.username;
    socket.data.roomId = roomId;
    socket.data.avatar = user.avatar;

    socket.join(roomId);
    console.log(`Socket ${socket.id} (${user.username}) joined room ${roomId}`);

    const socketsInRoom = await io.in(roomId).fetchSockets();
    const userList = socketsInRoom.map((s) => ({
      _id: s.data.userId,
      username: s.data.username,
      avatar: s.data.avatar,
    }));
    io.to(roomId).emit('updateUserList', userList);
  });

  // (sendMessage listener from previous step)
  socket.on('sendMessage', async ({ content, roomId, senderId }) => {
    if (!content || !roomId || !senderId) return;
    try {
      const newMessage = await Message.create({ content, room: roomId, sender: senderId });
      await newMessage.populate('sender', 'username avatar');
      io.to(roomId).emit('receiveMessage', newMessage);
    } catch (error) {
      console.error('Error saving or broadcasting message:', error);
    }
  });

  // (removeUser listener from previous step)
  socket.on('removeUser', async ({ roomId, userIdToRemove }) => {
    try {
      const room = await SubjectRoom.findById(roomId);
      if (!room) return;
      if (room.createdBy.toString() === socket.data.userId) {
        await SubjectRoom.findByIdAndUpdate(roomId, {
          $pull: { members: userIdToRemove },
        });
        const socketsInRoom = await io.in(roomId).fetchSockets();
        const socketToRemove = socketsInRoom.find(
          (s) => s.data.userId === userIdToRemove
        );
        if (socketToRemove) {
          socketToRemove.emit('youWereRemoved', { roomName: room.name });
          socketToRemove.leave(roomId);
        }
        const newSocketsInRoom = await io.in(roomId).fetchSockets();
        const newUserList = newSocketsInRoom.map((s) => ({
          _id: s.data.userId,
          username: s.data.username,
          avatar: s.data.avatar,
        }));
        io.to(roomId).emit('updateUserList', newUserList);
      }
    } catch (error) {
      console.error('Error removing user:', error);
    }
  });

  // --- 1. ADD THIS NEW "DELETE MESSAGE" LISTENER ---
  socket.on('deleteMessage', async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (!message) return; // Message already deleted
      
      const room = await SubjectRoom.findById(message.room);
      const user = await User.findById(socket.data.userId);

      if (!room || !user) return; // Safety check

      // Check for permission:
      // 1. Is the user the one who sent the message?
      const isSender = message.sender.toString() === socket.data.userId;

      // 2. Is the user the "Teacher" who owns the room?
      const isOwner =
        room.createdBy.toString() === socket.data.userId &&
        user.role === 'teacher';

      if (isSender || isOwner) {
        // Permission granted: Delete the message
        await message.deleteOne();

        // Broadcast to everyone in the room that this message is gone
        io.to(room._id.toString()).emit('messageDeleted', messageId);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  });
  // ---------------------------------------------

  // (disconnect listener from previous step)
  socket.on('disconnect', async () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const { username, roomId } = socket.data;
    if (username && roomId) {
      console.log(`User ${username} left room ${roomId}`);
      const socketsInRoom = await io.in(roomId).fetchSockets();
      const userList = socketsInRoom.map((s) => ({
        _id: s.data.userId,
        username: s.data.username,
        avatar: s.data.avatar,
      }));
      io.to(roomId).emit('updateUserList', userList);
    }
  });
});
// 
// --- END OF SOCKET.IO BLOCK ---
// 

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Welcome to the EduCampus API! It is running!');
});

app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/upload', uploadRoutes);

// --- Start the server using 'server.listen' ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});