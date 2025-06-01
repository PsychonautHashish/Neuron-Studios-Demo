import React, { useState, useEffect } from 'react';
import '../styles/glassmorphism.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar = ({ bookedDates }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Fill empty slots before first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    // Fill days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const isDateBooked = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return bookedDates.some((booking) => booking.date === dateStr);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleDateClick = (date) => {
    if (!date || isDateBooked(date)) return;
    setSelectedDate(date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthDates = getMonthDates(currentMonth);

  return (
    <div className="calendar">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button className="submit-button" onClick={handlePrevMonth}>&lt;</button>
        <h2>
          {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
        </h2>
        <button className="submit-button" onClick={handleNextMonth}>&gt;</button>
      </div>
      <div className="calendar-grid" style={{ marginTop: 8 }}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} style={{ color: '#00ffe7', fontWeight: 'bold', textAlign: 'center' }}>{wd}</div>
        ))}
        {monthDates.map((date, idx) =>
          date ? (
            <div
              key={date.toString()}
              className={
                `calendar-day${isDateBooked(date) ? ' booked' : ''}${isToday(date) ? ' today' : ''}`
              }
              title={isDateBooked(date) ? "Booked" : "Available"}
              onClick={() => handleDateClick(date)}
              style={{
                border: isToday(date) ? '2px solid #ff00cc' : undefined,
                boxShadow: isToday(date) ? '0 0 12px #ff00cc' : undefined,
                position: 'relative'
              }}
            >
              {date.getDate()}
              {selectedDate && date.toDateString() === selectedDate.toDateString() && (
                <span style={{
                  position: 'absolute',
                  top: 4,
                  right: 8,
                  fontSize: 12,
                  color: '#ff00cc',
                  textShadow: '0 0 6px #ff00cc'
                }}>●</span>
              )}
            </div>
          ) : (
            <div key={idx}></div>
          )
        )}
      </div>
      {selectedDate && (
        <p style={{ color: '#00ffe7', marginTop: 16 }}>
          You have selected: <b>{selectedDate.toDateString()}</b>
        </p>
      )}
    </div>
  );
};

export default Calendar;