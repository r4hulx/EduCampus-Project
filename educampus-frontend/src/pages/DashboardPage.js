import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import socket from '../socket';
import './DashboardPage.css';
import CreateRoomModal from '../components/CreateRoomModal';
import ChatWindow from '../components/ChatWindow';
import ThemeToggle from '../components/ThemeToggle'; // 1. IMPORTED THIS

const DashboardPage = () => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('educampusUser'));
    if (userInfo) {
      setCurrentUser(userInfo);
    }

    fetchRooms();
    socket.connect();

    socket.on('updateUserList', (userList) => {
      setOnlineUsers(userList);
    });

    socket.on('youWereRemoved', ({ roomName }) => {
      alert(`You have been removed from the room: ${roomName}`);
      fetchRooms();
      setCurrentRoom(null);
    });

    return () => {
      socket.disconnect();
      socket.off('updateUserList');
      socket.off('youWereRemoved');
    };
  }, []);

  const handleRoomCreated = (newRoom) => {
    setRooms([newRoom, ...rooms]);
    setIsModalOpen(false);
  };

  const handleRoomClick = (room) => {
    if (currentRoom) {
      socket.emit('leaveRoom', currentRoom._id);
    }
    setCurrentRoom(room);

    socket.emit('joinRoom', {
      roomId: room._id,
      user: currentUser,
    });
  };

  const handleDeleteRoom = async (e, roomId) => {
    e.stopPropagation();
    if (
      window.confirm('Are you sure you want to delete this room? This is permanent.')
    ) {
      try {
        await api.delete(`/rooms/${roomId}`);
        setRooms(rooms.filter((r) => r._id !== roomId));
        if (currentRoom?._id === roomId) {
          setCurrentRoom(null);
        }
      } catch (error) {
        console.error('Failed to delete room', error);
        alert(error.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const handleRemoveUser = (userIdToRemove) => {
    if (
      window.confirm('Are you sure you want to remove this user from the room?')
    ) {
      socket.emit('removeUser', {
        roomId: currentRoom._id,
        userIdToRemove: userIdToRemove,
      });
    }
  };

  const isOwner =
    currentRoom &&
    currentUser &&
    currentRoom.createdBy === currentUser._id &&
    currentUser.role === 'teacher';

  return (
    <>
      <div className="dashboard-container">
        <div className="sidebar">
          <Link to="/profile" style={{ textDecoration: 'none' }}>
            <h2
              style={{
                color: 'var(--color-text)',
                margin: 0,
                padding: '0.25rem 0',
              }}
            >
              Welcome, {currentUser?.username}!
            </h2>
          </Link>

          {/* 2. ADDED THIS COMPONENT */}
          <ThemeToggle />

          <hr style={{ margin: '1rem 0' }} />

          <Link to="/find-rooms" className="find-rooms-link">
            Find & Join Rooms
          </Link>
          <hr style={{ margin: '1rem 0' }} />

          <h3>Your Rooms</h3>
          <ul className="room-list">
            {rooms.map((room) => {
              const isRoomOwner =
                currentUser?.role === 'teacher' &&
                room.createdBy === currentUser?._id;
              return (
                <li
                  key={room._id}
                  className={`room-list-item ${
                    currentRoom?._id === room._id ? 'active' : ''
                  }`}
                  onClick={() => handleRoomClick(room)}
                >
                  <span className="room-name">{room.name}</span>
                  {isRoomOwner && (
                    <button
                      className="delete-room-btn"
                      onClick={(e) => handleDeleteRoom(e, room._id)}
                      title="Delete room"
                    >
                      &times;
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            className="create-room-btn"
            onClick={() => setIsModalOpen(true)}
          >
            + Create New Room
          </button>
        </div>

        <div className="chat-area">
          <ChatWindow
            room={currentRoom}
            currentUser={currentUser}
            isOwner={isOwner}
          />
        </div>

        <div className="user-list-panel">
          <h3>Who's Online</h3>
          <ul className="online-user-list">
            {onlineUsers.map((user) => (
              <li key={user._id} className="online-user-item">
                <img src={user.avatar} alt="avatar" className="online-avatar" />
                <span>{user.username}</span>
                {isOwner && user._id !== currentUser._id && (
                  <button
                    className="remove-user-btn"
                    title={`Remove ${user.username}`}
                    onClick={() => handleRemoveUser(user._id)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />
    </>
  );
};

export default DashboardPage;