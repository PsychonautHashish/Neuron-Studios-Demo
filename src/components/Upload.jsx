import React, { useRef, useState } from 'react';

const API = 'http://localhost:4000/api';

// TODO: Replace with your actual Google Form POST URL and field names
const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/1vi0eFygfCRDPXLlZ006tUfIIhjcX-ZcbEwqaj4Mp04A/prefill';
const GOOGLE_FORM_FIELDS = {
  genre: 'entry.1575894252',
  type: 'entry.1164519494',
  trackName: 'entry.353893155',
  producer: 'entry.87605479',
  bpm: 'entry.1628022861',
  key: 'entry.94217809',
  lyric: 'entry.177607150',      // This will be the lyric file name or 'none'
  audioFile: 'entry.1040188244',  // This will be the audio file name
};

const GENRES = [
  "Afrobeats", "Hip Hop", "Trap", "R&B", "Pop", "Dancehall", "Reggae", "Amapiano", "House", "EDM", "Rock", "Jazz", "Soul", "Gospel", "Other"
];

const KEYS = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
  "Cm", "C#m", "Dbm", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gbm", "Gm", "G#m", "Abm", "Am", "A#m", "Bbm", "Bm"
];

function Upload({ open, onClose, user }) {
  const audioInput = useRef();
  const lyricInput = useRef();
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [audioFileInfo, setAudioFileInfo] = useState(null);
  const [lyricFileInfo, setLyricFileInfo] = useState(null);
  const [meta, setMeta] = useState({
    genre: '',
    type: '',
    trackName: '',
    bpm: '',
    key: '',
  });

  if (!open) return null;

  // Step 1: Upload audio and lyric files
  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage('');
    const audioFile = audioInput.current.files[0];
    const lyricFile = lyricInput.current.files[0];

    if (!audioFile) {
      setMessage('Please select an audio file.');
      return;
    }
    if (!['audio/wav', 'audio/mp3', 'audio/mpeg'].includes(audioFile.type)) {
      setMessage('Only WAV or MP3 files are allowed.');
      return;
    }
    setUploading(true);

    // Upload audio file
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('user', user); // or 'producer', but must match backend

    let audioUploadRes, lyricUploadRes;
    try {
      audioUploadRes = await fetch(`${API}/upload-local`, {
        method: 'POST',
        body: formData,
      });
      if (!audioUploadRes.ok) throw new Error('Audio upload failed');
      const audioData = await audioUploadRes.json();
      setAudioFileInfo(audioData); // { filename, original }
    } catch {
      setMessage('Audio upload failed.');
      setUploading(false);
      return;
    }

    // Upload lyric file if provided
    if (lyricFile) {
      const lyricFormData = new FormData();
      lyricFormData.append('audio', lyricFile); // reuse the same endpoint for simplicity
      lyricFormData.append('user', user);
      try {
        lyricUploadRes = await fetch(`${API}/upload`, {
          method: 'POST',
          body: lyricFormData,
        });
        if (!lyricUploadRes.ok) throw new Error('Lyric upload failed');
        const lyricData = await lyricUploadRes.json();
        setLyricFileInfo(lyricData); // { filename, original }
      } catch {
        setMessage('Lyric file upload failed.');
        setUploading(false);
        return;
      }
    } else {
      setLyricFileInfo(null);
    }

    setMessage('');
    setUploading(false);
  };

  // Step 2: Submit metadata to backend
  const handleMetaSubmit = async (e) => {
    e.preventDefault();
    setMessage('Submitting metadata...');
    try {
      const res = await fetch(`${API}/upload-to-drive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          type: meta.type,
          genre: meta.genre,
          filename: audioFileInfo.filename,
          original: audioFileInfo.original,
          trackName: meta.trackName, // <-- this must be the user's input!
          bpm: meta.bpm,
          key: meta.key,
          lyricFile: lyricFileInfo ? lyricFileInfo.filename : '',
          uploadDate: new Date().toISOString()
        }),
      });
      if (!res.ok) throw new Error('Failed to save metadata');
      setMessage('Track uploaded and metadata saved!');
    } catch {
      setMessage('Failed to save metadata.');
    }
  };

  // Reset state when closed
  const handleClose = () => {
    setAudioFileInfo(null);
    setLyricFileInfo(null);
    setMeta({
      genre: '',
      type: '',
      trackName: '',
      bpm: '',
      key: '',
    });
    setMessage('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <form
        onSubmit={audioFileInfo ? handleMetaSubmit : handleUpload}
        style={{
          background: 'rgba(30,30,60,0.97)',
          borderRadius: 16,
          padding: 32,
          minWidth: 320,
          boxShadow: '0 4px 32px #00ffe7a0',
          border: '2px solid #00ffe7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <h2 style={{ color: '#00ffe7', marginBottom: 16 }}>Upload Audio Track</h2>
        {!audioFileInfo ? (
          <>
            <input
              type="file"
              accept=".wav,.mp3,audio/wav,audio/mp3,audio/mpeg"
              ref={audioInput}
              style={{ marginBottom: 16 }}
            />
            <label style={{ color: '#00ffe7', marginBottom: 4 }}>
              Lyric File (optional)
            </label>
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              ref={lyricInput}
              style={{ marginBottom: 16 }}
            />
            <button className="submit-button" type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </>
        ) : (
          <>
            <div style={{ color: '#00ffe7', marginBottom: 12 }}>
              Uploaded: <b>{audioFileInfo.original}</b>
              {lyricFileInfo && (
                <div>Lyric File: <b>{lyricFileInfo.original}</b></div>
              )}
            </div>
            <input
              className="input-field"
              placeholder="Track Name"
              value={meta.trackName}
              onChange={e => setMeta(m => ({ ...m, trackName: e.target.value }))}
              required
            />
            <select
              className="input-field"
              value={meta.genre}
              onChange={e => setMeta(m => ({ ...m, genre: e.target.value }))}
              required
            >
              <option value="">Select Genre</option>
              {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select
              className="input-field"
              value={meta.type}
              onChange={e => setMeta(m => ({ ...m, type: e.target.value }))}
              required
            >
              <option value="">Select Type</option>
              <option value="beat">Beat</option>
              <option value="song">Song</option>
            </select>
            <input
              className="input-field"
              placeholder="BPM"
              type="number"
              value={meta.bpm}
              onChange={e => setMeta(m => ({ ...m, bpm: e.target.value }))}
              required
            />
            <select
              className="input-field"
              value={meta.key}
              onChange={e => setMeta(m => ({ ...m, key: e.target.value }))}
              required
            >
              <option value="">Select Key</option>
              {KEYS.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <button className="submit-button" type="submit">
              Submit Metadata
            </button>
          </>
        )}
        <button className="submit-button" type="button" style={{ marginTop: 8, background: '#333' }} onClick={handleClose}>
          Close
        </button>
        {message && <div style={{ color: '#00ffe7', marginTop: 12 }}>{message}</div>}
      </form>
    </div>
  );
}

export default Upload;