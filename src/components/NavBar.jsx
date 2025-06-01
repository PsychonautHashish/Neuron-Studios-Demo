import React from 'react';

const NavBar = ({ user, onLogout, onUploadClick, darkMode, setDarkMode }) => (
  <nav style={{
    width: '100%',
    background: 'rgba(20, 20, 40, 0.95)',
    borderBottom: '2px solid #00ffe7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 32px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxSizing: 'border-box'
  }}>
    <div style={{ fontFamily: 'Orbitron, Arial', fontWeight: 700, fontSize: 22, color: '#00ffe7', letterSpacing: 2 }}>
      Neuron Studios
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button
        className="submit-button"
        style={{ minWidth: 40 }}
        onClick={() => setDarkMode((d) => !d)}
        title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {darkMode ? "🌙" : "☀️"}
      </button>
      <button className="submit-button" style={{ minWidth: 90 }} onClick={onUploadClick}>
        Upload Track
      </button>
      <span style={{ color: '#00ffe7', fontSize: 16 }}>
        {user && <>Logged in as <b>{user}</b></>}
      </span>
      <button className="submit-button" style={{ minWidth: 90 }} onClick={onLogout}>Logout</button>
    </div>
  </nav>
);

export default NavBar;