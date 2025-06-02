import React, { useState, useEffect } from 'react';

function Profile({ user, onClose }) {
  const [bookings, setBookings] = useState([]);
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    // Fetch user's bookings
    fetch('http://localhost:4000/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data.filter(b => b.user === user)));
    // Fetch user's uploads (assumes you store upload info in a file or DB)
    fetch('http://localhost:4000/api/uploads?user=' + encodeURIComponent(user))
      .then(res => res.ok ? res.json() : [])
      .then(data => setUploads(Array.isArray(data) ? data : []))
      .catch(() => setUploads([]));
  }, [user]);

  return (
    <div className="profile-modal" tabIndex={0}>
      <div className="profile-content">
        <h2>User Profile</h2>
        <p><b>Username:</b> {user}</p>

        <h3 style={{ marginTop: 24 }}>Your Bookings</h3>
        <ul style={{ maxHeight: 120, overflowY: 'auto', textAlign: 'left', padding: 0 }}>
          {bookings.length === 0 && <li style={{ color: '#00ffe7' }}>No bookings yet.</li>}
          {bookings.map(b => (
            <li key={b.id} style={{ marginBottom: 8, borderBottom: '1px solid #00ffe740', paddingBottom: 4 }}>
              <b>{b.date}</b> {b.startTime && b.endTime && (
                <span style={{ color: '#00ffe7', marginLeft: 8 }}>
                  {b.startTime} - {b.endTime}
                </span>
              )}
              <span style={{ marginLeft: 8 }}>{b.details}</span>
            </li>
          ))}
        </ul>

        <h3 style={{ marginTop: 24 }}>Your Uploads</h3>
        <ul style={{ maxHeight: 120, overflowY: 'auto', textAlign: 'left', padding: 0 }}>
          {uploads.length === 0 && <li style={{ color: '#00ffe7' }}>No uploads yet.</li>}
          {uploads.map((u, i) => (
            <li key={i} style={{ marginBottom: 8, borderBottom: '1px solid #00ffe740', paddingBottom: 4 }}>
              <b>{u.original || u.filename}</b>
              {u.uploadDate && (
                <span style={{ color: '#00ffe7', marginLeft: 8, fontSize: 13 }}>
                  ({new Date(u.uploadDate).toLocaleString()})
                </span>
              )}
              {u.filename && (
                <audio controls style={{ marginLeft: 8, verticalAlign: 'middle', maxWidth: 120 }}>
                  <source src={`/data/uploads/${u.filename}`} />
                </audio>
              )}
            </li>
          ))}
        </ul>

        <button className="submit-button" style={{ marginTop: 18 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default Profile;