import React, { useState } from 'react';
import api from '../api'; // 1. Import our API client
import './CreateRoomModal.css';
import '../pages/RegisterPage.css';

const CreateRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // 2. Make the function asynchronous
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 3. Add a try...catch block for the API call
    try {
      const roomData = { name, description };
      
      // 4. Call the backend '/api/rooms' POST endpoint
      const response = await api.post('/rooms', roomData);
      
      // 5. Call the function we passed from the Dashboard
      // This tells the Dashboard a new room exists
      onRoomCreated(response.data); 
      
      // 6. Reset the form and close
      onClose();
      setName('');
      setDescription('');

    } catch (error) {
  if (error.response) {
    // The server responded with an error (e.g., "Room name already exists")
    console.error('Failed to create room:', error.response.data.message);
    alert(error.response.data.message);
  } else {
    // A network error occurred (e.g., server is down)
    console.error('Network error:', error.message);
    alert('Could not connect to the server. Is it running?');
  }
}
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* ... no changes to the HTML form ... */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create a New Subject Room</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="roomName">Room Name</label>
            <input
              type="text"
              id="roomName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="roomDescription">Description (Optional)</label>
            <input
              type="text"
              id="roomDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="modal-buttons">
            <button
              type="button"
              className="modal-button btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="modal-button btn-primary">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;