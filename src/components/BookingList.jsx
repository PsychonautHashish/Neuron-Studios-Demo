import React, { useState } from 'react';
import '../styles/glassmorphism.css';

function exportToCSV(bookings) {
  const header = ['Date', 'Time', 'Details', 'User'];
  const rows = bookings.map(b =>
    [b.date, b.time || '', b.details || '', b.user || ''].map(field =>
      `"${(field || '').replace(/"/g, '""')}"`
    ).join(',')
  );
  const csv = [header.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bookings.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const BookingList = ({ bookings, user, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [editDetails, setEditDetails] = useState('');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="booking-list">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
        <button className="submit-button" style={{ minWidth: 90 }} onClick={() => exportToCSV(bookings)}>
          Export CSV
        </button>
        <button className="submit-button" style={{ minWidth: 90 }} onClick={handlePrint}>
          Print
        </button>
      </div>
      <h2>Booked Dates</h2>
      {bookings.length === 0 ? (
        <p>No bookings available.</p>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id}>
              <span style={{ color: '#ff00cc', marginRight: 8 }}>●</span>
              <b>{booking.date}</b>
              {booking.startTime && booking.endTime && (
                <span style={{ color: '#00ffe7', marginLeft: 8 }}>
                  {booking.startTime} - {booking.endTime}
                </span>
              )}
              &mdash;
              {editingId === booking.id ? (
                <>
                  <input
                    value={editDetails}
                    onChange={e => setEditDetails(e.target.value)}
                    style={{ marginLeft: 8, marginRight: 8 }}
                  />
                  <button className="submit-button" style={{ padding: '2px 8px', fontSize: 13 }}
                    onClick={() => {
                      onUpdate(booking.id, editDetails);
                      setEditingId(null);
                    }}>Save</button>
                  <button className="submit-button" style={{ padding: '2px 8px', fontSize: 13, background: '#333' }}
                    onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  {' '}{booking.details}
                  {booking.user && (
                    <span style={{ color: '#00ffe7', marginLeft: 8, fontSize: 13 }}>
                      (by {booking.user})
                    </span>
                  )}
                  {user === booking.user && (
                    <>
                      <button className="submit-button" style={{ marginLeft: 8, padding: '2px 8px', fontSize: 13 }}
                        onClick={() => {
                          setEditingId(booking.id);
                          setEditDetails(booking.details);
                        }}>Edit</button>
                      <button className="submit-button" style={{ marginLeft: 4, padding: '2px 8px', fontSize: 13, background: '#333' }}
                        onClick={() => onDelete(booking.id)}>Delete</button>
                    </>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingList;