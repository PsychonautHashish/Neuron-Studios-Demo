const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { uploadTrackToDrive } = require('./googleDrive');
const { OAuth2Client } = require('google-auth-library');

const BOOKINGS_PATH = path.join(__dirname, '../src/data/bookings.json');
const USERS_PATH = path.join(__dirname, '../src/utils/users.json');
const uploadHistoryPath = path.join(__dirname, '../src/data/uploadHistory.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({
  dest: path.join(__dirname, '../src/data/uploads'),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    if (['audio/wav', 'audio/mp3', 'audio/mpeg'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only WAV or MP3 files allowed'));
  }
});

if (!fs.existsSync(path.join(__dirname, '../src/data/uploads'))) {
  fs.mkdirSync(path.join(__dirname, '../src/data/uploads'), { recursive: true });
}

// Helper to read/write bookings
function readBookings() {
  if (!fs.existsSync(BOOKINGS_PATH)) return [];
  const data = fs.readFileSync(BOOKINGS_PATH, 'utf-8');
  try {
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}
function writeBookings(bookings) {
  fs.writeFileSync(BOOKINGS_PATH, JSON.stringify(bookings, null, 2));
}

// Helper to read users
function readUsers() {
  if (!fs.existsSync(USERS_PATH)) return [];
  const data = fs.readFileSync(USERS_PATH, 'utf-8');
  try {
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

// Helper to read/write upload history
function readUploadHistory() {
  try {
    return JSON.parse(fs.readFileSync(uploadHistoryPath, 'utf8'));
  } catch {
    return [];
  }
}
function writeUploadHistory(history) {
  fs.writeFileSync(uploadHistoryPath, JSON.stringify(history, null, 2));
}

// --- API ROUTES ---

// Get all bookings
app.get('/api/bookings', (req, res) => {
  res.json(readBookings());
});

// Add a booking
app.post('/api/bookings', (req, res) => {
  const { date, startTime, endTime, details, user } = req.body;
  if (!date || !startTime || !endTime || !user) return res.status(400).json({ error: 'Missing fields' });
  const bookings = readBookings();

  // Check for overlap
  const overlap = bookings.some(b =>
    b.date === date &&
    !(
      endTime <= b.startTime || startTime >= b.endTime
    )
  );
  if (overlap) {
    return res.status(409).json({ error: 'Time slot overlaps with an existing booking' });
  }
  const newBooking = { id: Date.now().toString(), date, startTime, endTime, details, user };
  bookings.push(newBooking);
  writeBookings(bookings);
  res.json(newBooking);
});

// Update a booking (only by owner)
app.put('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { details, user } = req.body;
  let bookings = readBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  if (bookings[idx].user !== user) return res.status(403).json({ error: 'Not your booking' });
  bookings[idx].details = details;
  writeBookings(bookings);
  res.json(bookings[idx]);
});

// Delete a booking (only by owner)
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const { user } = req.body;
  let bookings = readBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  if (bookings[idx].user !== user) return res.status(403).json({ error: 'Not your booking' });
  const removed = bookings.splice(idx, 1)[0];
  writeBookings(bookings);
  res.json(removed);
});

// Login endpoint (for demo, plaintext)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ username: user.username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Upload endpoint
app.post('/api/upload', upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Make sure to use the correct field names from your frontend!
  const { user, type, genre } = req.body;
  const producer = user;
  const mainFolderId = '1TOOgAPZfxgA3TNNLAPJAgogZq50wQXUq'; // Set this to your Drive folder ID

  uploadTrackToDrive(req.file.path, producer, type, genre, mainFolderId)
    .then(fileInfo => {
      const history = readUploadHistory();
      history.push({
        user,
        filename: req.file.filename,
        original: req.file.originalname,
        uploadDate: new Date().toISOString()
      });
      writeUploadHistory(history);
      res.json({ filename: req.file.filename, original: req.file.originalname, driveLink: fileInfo.webViewLink });
    })
    .catch(err => {
      console.error('Drive upload error:', err);
      res.status(500).json({ error: 'Failed to upload to Google Drive' });
    });
});

// Serve upload history (demo: scan uploads folder for files uploaded by user)
app.get('/api/uploads', (req, res) => {
  const user = req.query.user;
  const history = readUploadHistory();
  const userUploads = history.filter(u => u.user === user);
  res.json(userUploads);
});

// Add this endpoint
app.post('/api/track-metadata', (req, res) => {
  const history = readUploadHistory();
  history.push(req.body);
  writeUploadHistory(history);
  res.json({ success: true });
});

// New local upload endpoint
app.post('/api/upload-local', upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Save info for later
  res.json({ filename: req.file.filename, original: req.file.originalname });
});

app.post('/api/upload-to-drive', async (req, res) => {
  let { displayName, user, type, genre, filename, original, trackName } = req.body;
  const mainFolderId = '1TOOgAPZfxgA3TNNLAPJAgogZq50wQXUq';

  // Use displayName if present, otherwise fallback to user
  let folderName = displayName || user;

  // Remove only forbidden characters for Google Drive folders
  // Forbidden: / \ ? * : < > " |
  if (folderName) {
    folderName = folderName.replace(/[\/\\\?\*\:\<\>\"\|]/g, '');
    folderName = folderName.trim(); // Remove leading/trailing spaces
  }

  if (!folderName || !type || !genre || !filename || !trackName) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const localFilePath = path.join(__dirname, '../src/data/uploads', filename);
  try {
    const fileInfo = await uploadTrackToDrive(localFilePath, folderName, type, genre, mainFolderId, original, trackName);
    // Save metadata
    const history = readUploadHistory();
    history.push({
      user,
      type,
      genre,
      filename,
      original: req.body.original || filename,
      trackName: req.body.trackName,
      bpm: req.body.bpm,
      key: req.body.key,
      lyricFile: req.body.lyricFile,
      uploadDate: req.body.uploadDate,
      driveLink: fileInfo.webViewLink,
    });
    writeUploadHistory(history);
    res.json({ success: true, driveLink: fileInfo.webViewLink });
  } catch (err) {
    console.error('Drive upload error:', err);
    res.status(500).json({ error: 'Failed to upload to Google Drive' });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

const googleClient = new OAuth2Client('405192266130-larvevbnuoa8leuctu853l39j0np1o6v.apps.googleusercontent.com');

app.post('/api/google-login', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: '405192266130-larvevbnuoa8leuctu853l39j0np1o6v.apps.googleusercontent.com',
    });
    const payload = ticket.getPayload();

    // List of allowed emails
    const allowedEmails = [
      'mbuthiaeddy@gmail.com',
      'yeddxgetthemoney@gmail.com',
      'zennybeatsstore@gmail.com',
      'frostyqbeats@gmail.com',
      'philzonmedz@gmail.com',
      'studiosneuron@gmail.com'
      // Add more allowed emails here
    ];

    if (!allowedEmails.includes(payload.email)) {
      return res.status(403).json({ error: 'Email not authorized' });
    }

    res.json({ username: payload.email, name: payload.name });
  } catch (err) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

