import { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import Login from './components/Login';
import NavBar from './components/NavBar';
import Upload from './components/Upload';
import './styles/glassmorphism.css';

const API = 'http://localhost:4000/api';

function App() {
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  // Fetch bookings from backend
  useEffect(() => {
    fetch(`${API}/bookings`)
      .then(res => res.json())
      .then(setBookings);
  }, []);

  const refreshBookings = () => {
    fetch(`${API}/bookings`)
      .then(res => res.json())
      .then(setBookings);
  };

  const addBooking = (date, startTime, endTime, details) => {
    fetch(`${API}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, startTime, endTime, details, user }),
    })
      .then(res => {
        if (!res.ok) return res.json().then(e => { throw e; });
        return res.json();
      })
      .then(() => refreshBookings());
  };

  const updateBooking = (id, details) => {
    fetch(`${API}/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ details, user }),
    })
      .then(res => res.json())
      .then(() => refreshBookings());
  };

  const deleteBooking = (id) => {
    fetch(`${API}/bookings/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    })
      .then(res => res.json())
      .then(() => refreshBookings());
  };

  // Check for overlap
  const isDateBooked = (date, startTime, endTime) => {
    return bookings.some((b) =>
      b.date === date &&
      !(
        endTime <= b.startTime || startTime >= b.endTime
      )
    );
  };

  const handleLogout = () => setUser(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <>
      <NavBar
        user={user}
        onLogout={handleLogout}
        onUploadClick={() => setShowUpload(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <Upload open={showUpload} onClose={() => setShowUpload(false)} user={user} />
      <div className="app-container">
        <BookingForm addBooking={addBooking} isDateBooked={isDateBooked} bookedDates={bookings} />
        <Calendar bookedDates={bookings} isDateBooked={isDateBooked} />
        <BookingList bookings={bookings} user={user} onUpdate={updateBooking} onDelete={deleteBooking} />
      </div>
    </>
  );
}

export default App;