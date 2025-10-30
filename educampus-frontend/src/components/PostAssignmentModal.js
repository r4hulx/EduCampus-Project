import React, { useState } from 'react';
import api from '../api';
import './CreateRoomModal.css'; // Reuse modal overlay styles
import '../pages/RegisterPage.css'; // Reuse form group styles

const PostAssignmentModal = ({ isOpen, onClose, room, onAssignmentPosted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const assignmentData = {
        title,
        description,
        dueDate: dueDate || null, // Send null if date is empty
        roomId: room._id,
      };

      // Call our new backend API endpoint
      const response = await api.post('/assignments', assignmentData);

      // Tell the AssignmentTab to update its list
      onAssignmentPosted(response.data);

      // Reset form and close
      onClose();
      setTitle('');
      setDescription('');
      setDueDate('');

    } catch (error) {
      if (error.response) {
        alert(error.response.data.message);
      } else {
        alert('Failed to post assignment. Is the server running?');
      }
      console.error('Failed to post assignment:', error);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Post New Assignment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="assignmentTitle">Title</label>
            <input
              type="text"
              id="assignmentTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="assignmentDesc">Description (Optional)</label>
            <textarea
              id="assignmentDesc"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="assignmentDueDate">Due Date (Optional)</label>
            <input
              type="date"
              id="assignmentDueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
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
              Post Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostAssignmentModal;