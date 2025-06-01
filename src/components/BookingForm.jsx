import React, { useState } from 'react';
import '../styles/glassmorphism.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MiniCalendar({ onSelect, bookedDates }) {
  const [month, setMonth] = useState(new Date());

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const isBooked = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return bookedDates.some((b) => b.date === dateStr);
  };

  const today = new Date();
  const handlePrevMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1));
  const handleNextMonth = () => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1));

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <button className="mini-calendar-btn" type="button" onClick={handlePrevMonth}>&lt;</button>
        <span className="mini-calendar-title">
          {month.toLocaleString('default', { month: 'short' })} {month.getFullYear()}
        </span>
        <button className="mini-calendar-btn" type="button" onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="mini-calendar-grid">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="mini-calendar-wd">{wd}</div>
        ))}
        {getMonthDates(month).map((date, idx) =>
          date ? (
            <div
              key={date.toString()}
              className={
                "mini-calendar-day" +
                (isBooked(date) ? " booked" : "") +
                (date < new Date(today.getFullYear(), today.getMonth(), today.getDate()) ? " disabled" : "")
              }
              onClick={() => {
                if (!isBooked(date) && date >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                  onSelect(date);
                }
              }}
              title={isBooked(date) ? "Booked" : "Available"}
            >
              {date.getDate()}
            </div>
          ) : (
            <div key={idx}></div>
          )
        )}
      </div>
    </div>
  );
}

function BookingForm({ addBooking, isDateBooked, bookedDates = [] }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [info, setInfo] = useState('');
  const [message, setMessage] = useState('');
  const [showMiniCal, setShowMiniCal] = useState(false);

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
    addBooking(date, startTime, endTime, info);
    setMessage('Booking successful!');
    setDate('');
    setStartTime('');
    setEndTime('');
    setInfo('');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleMiniCalSelect = (jsDate) => {
    setDate(jsDate.toISOString().split('T')[0]);
    setShowMiniCal(false);
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <h2>Book an Appointment</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="input-field"
          min={new Date().toISOString().split('T')[0]}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="submit-button"
          style={{ padding: '8px 16px', fontSize: 18 }}
          onClick={() => setShowMiniCal((v) => !v)}
          tabIndex={-1}
        >
          📅
        </button>
        {showMiniCal && (
          <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 20 }}>
            <MiniCalendar
              onSelect={handleMiniCalSelect}
              bookedDates={bookedDates}
            />
          </div>
        )}
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
      <button type="submit" className="submit-button">Book</button>
      {message && <div style={{ color: '#00ffe7', marginTop: 10 }}>{message}</div>}
    </form>
  );
}

export default BookingForm;