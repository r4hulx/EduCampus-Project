import React, { useState, useEffect } from 'react';
import api from '../api';
import './AssignmentTab.css';
// 1. Import the modal
import PostAssignmentModal from './PostAssignmentModal'; 

const AssignmentTab = ({ room, isOwner }) => {
  const [assignments, setAssignments] = useState([]);
  // 2. Uncomment this state
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (room) {
      const fetchAssignments = async () => {
        try {
          const response = await api.get(`/assignments/${room._id}`);
          setAssignments(response.data);
        } catch (error) {
          console.error("Failed to fetch assignments", error);
        }
      };
      fetchAssignments();
    }
  }, [room]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="assignment-tab">
      {isOwner && (
        <button 
          className="assignment-post-btn"
          // 3. Uncomment this click handler
          onClick={() => setIsModalOpen(true)}
        >
          + Post New Assignment
        </button>
      )}

      {assignments.length === 0 ? (
        <p>No assignments posted yet.</p>
      ) : (
        <div className="assignment-list">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="assignment-item">
              <h4>{assignment.title}</h4>
              {/* Use <p> for description to respect formatting */}
              <p style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{assignment.description}</p>
              <p><strong>Due:</strong> {formatDate(assignment.dueDate)}</p>
              <div className="assignment-meta">
                Posted by {assignment.postedBy.username} on {formatDate(assignment.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Uncomment the modal component */}
      <PostAssignmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={room}
        onAssignmentPosted={(newAssignment) => {
          // Add the new assignment to the top of the list
          setAssignments([newAssignment, ...assignments]);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default AssignmentTab;