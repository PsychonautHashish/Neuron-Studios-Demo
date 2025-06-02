import React, { useState } from 'react';
import '../styles/glassmorphism.css';

function BookingForm({ addBooking, isDateBooked, bookedDates = [] }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [info, setInfo] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      setMessage('Please select date, entry, and departure time!');
      return;
    }
    if (endTime <= startTime) {
      setMessage('Departure time must be after entry time!');
      return;
    }
    if (isDateBooked(date, startTime, endTime)) {
      setMessage('This time slot is already booked!');
      return;
    }
    if (!window.confirm("Confirm this booking?")) return;
    addBooking(date, startTime, endTime, info);
    setMessage('Booking successful!');
    setDate('');
    setStartTime('');
    setEndTime('');
    setInfo('');
    setTimeout(() => setMessage(''), 2000);
  };

  const bookedSlots = bookedDates
    .filter(b => b.date === date)
    .map(b => `${b.startTime} - ${b.endTime}`);

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h2>Book an Appointment</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="input-field"
          min={new Date().toISOString().split('T')[0]}
          style={{ flex: 1 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          required
          className="input-field"
          style={{ marginBottom: 10 }}
          placeholder="Entry Time"
        />
        <input
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          required
          className="input-field"
          style={{ marginBottom: 10 }}
          placeholder="Departure Time"
        />
      </div>
      <textarea
        placeholder="Additional Information"
        value={info}
        onChange={(e) => setInfo(e.target.value)}
        className="input-field"
      />
      <button className="submit-button" type="submit" style={{ width: 160, margin: '18px auto 0 auto', display: 'block' }}>
        Book
      </button>
      {message && <div style={{ color: '#00ffe7', marginTop: 10 }}>{message}</div>}
      {bookedSlots.length > 0 && (
        <div style={{ color: '#ff00cc', marginBottom: 8 }}>
          Booked times: {bookedSlots.join(', ')}
        </div>
      )}
    </form>
  );
}

export default BookingForm;