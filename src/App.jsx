import { useState, useEffect } from 'react';
import NavBar from './components/NavBar';
import Upload from './components/Upload';
import Profile from './components/Profile';
import Login from './components/Login';
import BookingForm from './components/BookingForm';
import Calendar from './components/Calendar';
import BookingList from './components/BookingList';
import './styles/glassmorphism.css';

const API = 'http://localhost:4000/api';

function App() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]); // <-- FIX: bookings state was missing
  const [showUpload, setShowUpload] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (user) {
      fetch(`${API}/bookings`)
        .then(res => res.json())
        .then(setBookings);
    }
  }, [user]);

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
      .then(() => {
        refreshBookings();
        setNotification('Booking added successfully!');
        setTimeout(() => setNotification(''), 3000);
      })
      .catch(() => {
        setNotification('Failed to add booking.');
        setTimeout(() => setNotification(''), 3000);
      });
  };

  const updateBooking = (id, details) => {
    fetch(`${API}/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ details, user }),
    })
      .then(res => res.json())
      .then(() => {
        refreshBookings();
        setNotification('Booking updated successfully!');
        setTimeout(() => setNotification(''), 3000);
      })
      .catch(() => {
        setNotification('Failed to update booking.');
        setTimeout(() => setNotification(''), 3000);
      });
  };

  const deleteBooking = (id) => {
    fetch(`${API}/bookings/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    })
      .then(res => res.json())
      .then(() => {
        refreshBookings();
        setNotification('Booking deleted successfully!');
        setTimeout(() => setNotification(''), 3000);
      })
      .catch(() => {
        setNotification('Failed to delete booking.');
        setTimeout(() => setNotification(''), 3000);
      });
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
        onProfileClick={() => setShowProfile(true)}
        title="Neuron Studios Demo App"
      />
      <Upload open={showUpload} onClose={() => setShowUpload(false)} user={user} />
      {showProfile && <Profile user={user} onClose={() => setShowProfile(false)} />}
      <div className="app-container">
        <h1 style={{
          textAlign: 'center',
          color: '#00ffe7',
          marginBottom: 24,
          letterSpacing: 2,
          fontFamily: 'Orbitron, Arial, sans-serif'
        }}>
          Neuron Studios Demo App
        </h1>
        <BookingForm
          addBooking={addBooking}
          isDateBooked={isDateBooked}
          bookedDates={bookings}
          setNotification={setNotification}
        />
        <Calendar
          bookedDates={bookings}
          isDateBooked={isDateBooked}
        />
        <BookingList
          bookings={bookings}
          user={user}
          onUpdate={updateBooking}
          onDelete={deleteBooking}
          setNotification={setNotification}
        />
        {notification && <div className="notification">{notification}</div>}
      </div>
    </>
  );
}

export default App;