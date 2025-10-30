import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import socket from '../socket';
import './ChatWindow.css';
import AssignmentTab from './AssignmentTab';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatWindow = ({ room, currentUser, isOwner }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (room) {
      const fetchMessages = async () => {
        try {
          const response = await api.get(`/messages/${room._id}`);
          setMessages(response.data);
        } catch (error) {
          console.error('Failed to fetch messages', error);
        }
      };
      fetchMessages();
    }
  }, [room]);

  // --- UPDATED THIS useEffect BLOCK ---
  useEffect(() => {
    if (!room) return;

    // Listener for new messages
    const handleReceiveMessage = (message) => {
      if (message.room === room._id) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };
    
    // 1. ADD NEW LISTENER for deleted messages
    const handleMessageDeleted = (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageDeleted', handleMessageDeleted); // Add the listener

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageDeleted', handleMessageDeleted); // Clean up
    };
  }, [room]);
  // ------------------------------------

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && currentUser) {
      socket.emit('sendMessage', {
        content: newMessage,
        roomId: room._id,
        senderId: currentUser._id,
      });
      setNewMessage('');
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const fileUrl = response.data.url;
      socket.emit('sendMessage', {
        content: fileUrl,
        roomId: room._id,
        senderId: currentUser._id,
      });
    } catch (error) {
      console.error('File upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      fileInputRef.current.value = null;
    }
  };
  
  // 2. --- ADD NEW "DELETE MESSAGE" HANDLER ---
  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      socket.emit('deleteMessage', { messageId });
    }
  };

  // --- (renderMessageContent is unchanged) ---
  const renderMessageContent = (content) => {
    if (content.startsWith('```') && content.endsWith('```')) {
      let codeBlock = content.substring(3, content.length - 3).trim();
      let language = 'plaintext';
      const languageMatch = codeBlock.match(/^(\w+)([\n\s])/);
      if (languageMatch) {
        language = languageMatch[1];
        codeBlock = codeBlock.substring(languageMatch[0].length).trimStart();
      }
      return (
        <SyntaxHighlighter
          language={language}
          style={prism}
          customStyle={{
            borderRadius: '8px',
            padding: '1rem',
            margin: '0',
            maxWidth: '500px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {codeBlock}
        </SyntaxHighlighter>
      );
    }
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(content);
    if (isImage) {
      return (
        <img
          src={content}
          alt="Uploaded"
          style={{ maxWidth: '300px', borderRadius: '8px' }}
        />
      );
    }
    const isUrl = /^https?:\/\//.test(content);
    if (isUrl) {
      return (
        <a href={content} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      );
    }
    return <div className="message-content">{content}</div>;
  };

  if (!room || !currentUser) {
    return (
      <h1 style={{ color: '#555', fontWeight: 500 }}>
        Select a room to start chatting
      </h1>
    );
  }

  return (
    <div className="chat-window">
      {/* --- (Header and Tabs are unchanged) --- */}
      <div className="chat-header">
        <h3>
          {room.name}
          {isOwner && <span className="teacher-badge"> (Teacher)</span>}
        </h3>
      </div>
      <div className="chat-tabs">
        <button
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
      </div>

      {activeTab === 'chat' ? (
        <>
          <div className="message-list">
            {messages.map((msg) => {
              // 3. --- ADD 'isSender' CHECK ---
              const isSender = msg.sender._id === currentUser?._id;
              
              return (
                <div
                  key={msg._id}
                  className={`message ${isSender ? 'mine' : 'theirs'}`}
                >
                  <div className="message-header">
                    <img
                      src={msg.sender.avatar}
                      alt="avatar"
                      className="message-avatar"
                    />
                    <span className="message-sender">{msg.sender.username}</span>
                  </div>
                  {renderMessageContent(msg.content)}
                  
                  {/* 4. --- ADD DELETE BUTTON --- */}
                  {(isSender || isOwner) && (
                    <button 
                      className="delete-message-btn"
                      title="Delete message"
                      onClick={() => handleDeleteMessage(msg._id)}
                    >
                      &times;
                    </button>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          
          {/* --- (Message form is unchanged) --- */}
          <form className="message-input-form" onSubmit={handleSendMessage}>
            <input
              type="file"
              id="file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="attachment-btn"
              onClick={handleAttachmentClick}
              disabled={isUploading}
            >
              📎
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isUploading ? 'Uploading file...' : 'Type a message...'}
              disabled={isUploading}
            />
            <button type="submit" disabled={isUploading}>Send</button>
          </form>
        </>
      ) : (
        <div className="assignment-content">
          <AssignmentTab room={room} isOwner={isOwner} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;