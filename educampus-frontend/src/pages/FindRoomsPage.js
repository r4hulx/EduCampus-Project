import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api'; // Our API client
import './FindRoomsPage.css'; // Our new CSS

const FindRoomsPage = () => {
  const [allRooms, setAllRooms] = useState([]);
  const [joinedRoomIds, setJoinedRoomIds] = useState(new Set()); // Tracks rooms user is in
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch both all rooms and the user's current rooms
    const fetchData = async () => {
      try {
        // 1. Fetch all public rooms
        const allRoomsRes = await api.get('/rooms/all');
        setAllRooms(allRoomsRes.data);

        // 2. Fetch the rooms the user is ALREADY in
        const myRoomsRes = await api.get('/rooms');
        const myRoomIds = new Set(myRoomsRes.data.map(room => room._id));
        setJoinedRoomIds(myRoomIds);

      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      }
    };
    fetchData();
  }, []);

  const handleJoinRoom = async (roomId) => {
    try {
      // 3. Call the "join" endpoint
      await api.post(`/rooms/${roomId}/join`);
      
      // 4. Update the UI to show they've joined
      setJoinedRoomIds(new Set([...joinedRoomIds, roomId]));
      
      // 5. Optionally, navigate back to the dashboard
      alert('Room joined successfully!');
      navigate('/dashboard'); // Go back to the dashboard
      
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join room.');
    }
  };

  return (
    <div className="find-rooms-container">
      <h1>Find & Join Rooms</h1>
      <Link to="/dashboard" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
        &larr; Back to Dashboard
      </Link>
      <ul className="room-list-public">
        {allRooms.map((room) => (
          <li key={room._id} className="room-item-public">
            <div className="room-info">
              <h3>{room.name}</h3>
              <p>{room.description || 'No description'}</p>
            </div>
            <button
              className="join-room-btn"
              onClick={() => handleJoinRoom(room._id)}
              disabled={joinedRoomIds.has(room._id)} // 6. Disable button if already joined
            >
              {joinedRoomIds.has(room._id) ? 'Joined' : 'Join'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FindRoomsPage;