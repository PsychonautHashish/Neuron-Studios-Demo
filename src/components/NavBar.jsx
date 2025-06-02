import React, { useState } from 'react';
import Profile from './Profile'; // Adjust the import path as necessary

const NavBar = ({ user, onLogout, onUploadClick, title, onProfileClick }) => (
  <nav className="navbar">
    <div className="navbar-title">
      {title || "Neuron Studios Demo App"}
    </div>
    <div className="navbar-actions">
      <button className="submit-button" onClick={onUploadClick}>
        Upload Your Track
      </button>
      <span style={{ color: '#00ffe7', fontSize: 16 }}>
        {user && <>Logged in as <b>{user}</b></>}
      </span>
      <button className="submit-button" onClick={onProfileClick}>Profile</button>
      <button className="submit-button" onClick={onLogout}>Logout</button>
    </div>
  </nav>
);

const App = () => {
  const [showProfile, setShowProfile] = useState(false);
  const user = "JohnDoe"; // Replace with actual user data

  return (
    <div>
      <NavBar
        user={user}
        onLogout={() => console.log('Logout')}
        onUploadClick={() => console.log('Upload Track')}
        onProfileClick={() => setShowProfile(true)}
      />
      {showProfile && <Profile user={user} onClose={() => setShowProfile(false)} />}
    </div>
  );
};

export default NavBar;