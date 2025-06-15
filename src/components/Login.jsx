import React, { useState } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';

const API = 'http://localhost:4000/api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Login failed');
        return;
      }
      const data = await res.json();
      onLogin(data.username);
    } catch (err) {
      setError('Network error');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await fetch('http://localhost:4000/api/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });
    if (res.ok) {
      const data = await res.json();
      onLogin(data.username, data.name); // Pass both username and name
    } else {
      // handle error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form" style={{ maxWidth: 350, margin: '40px auto' }}>
      <h2>Producer Login</h2>
      <input
        className="input-field"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        autoFocus
      />
      <input
        className="input-field"
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="submit-button" type="submit">Login</button>
      {error && <div style={{ color: '#ff00cc', marginTop: 10 }}>{error}</div>}
      <div style={{ marginTop: 16, color: '#00ffe7', fontSize: 13 }}>
        <b>Demo Users:</b><br />
        Frosty / frosty123<br />
        Zenny / zenny456<br />
        Dawnmane / dawn789<br />
        Medz / medz321
      </div>
      <div style={{ margin: '16px 0' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => { /* handle error */ }}
        />
      </div>
    </form>
  );
}

export default Login;