import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import './RegisterPage.css'; // Reuse form styles
import './ProfilePage.css';   // Use new profile styles

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('educampusUser'));
    if (!userInfo) {
      navigate('/login'); // If no user, go to login
    } else {
      setUser(userInfo);
      setUsername(userInfo.username);
      setAvatar(userInfo.avatar);
    }
  }, [navigate]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload to Cloudinary (using our existing route)
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newAvatarUrl = uploadRes.data.url;
      
      // 2. Update the profile with the new URL
      const updateRes = await api.put('/users/profile', { avatar: newAvatarUrl });

      // 3. Update localStorage and state
      localStorage.setItem('educampusUser', JSON.stringify(updateRes.data));
      setAvatar(updateRes.data.avatar);
      setUser(updateRes.data);
      alert('Avatar updated!');
    } catch (error) {
      console.error('Failed to update avatar:', error);
      alert('Failed to update avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      // Update username
      const updateRes = await api.put('/users/profile', { username });
      localStorage.setItem('educampusUser', JSON.stringify(updateRes.data));
      setUser(updateRes.data);
      alert('Profile updated!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile.');
    }
  };
  
  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <Link to="/dashboard" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
        &larr; Back to Dashboard
      </Link>
      <h1>Your Profile</h1>
      
      <div className="avatar-upload">
        <img src={avatar} alt="Avatar" className="avatar-preview" />
        <label htmlFor="avatar-file" className="avatar-upload-btn">
          {isUploading ? 'Uploading...' : 'Change Avatar'}
        </label>
        <input 
          type="file" 
          id="avatar-file" 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange} 
          disabled={isUploading}
        />
      </div>

      <form onSubmit={handleProfileUpdate}>
        <div className="form-group">
          <label>Role</label>
          <input type="text" value={user.role} disabled />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user.email} disabled />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <button type="submit" className="form-button" disabled={isUploading}>
          {isUploading ? 'Updating...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;