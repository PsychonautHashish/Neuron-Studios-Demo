// backend/googleDrive.js
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const KEYFILEPATH = path.join(__dirname, 'your-service-account.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});
const drive = google.drive({ version: 'v3', auth });

// Helper to find or create a folder by name under a parent
async function getOrCreateFolder(name, parentId) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });
  if (res.data.files.length > 0) return res.data.files[0].id;
  const folder = await drive.files.create({
    resource: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
  });
  return folder.data.id;
}

// Main upload function
async function uploadTrackToDrive(localFilePath, producer, type, genre, mainFolderId) {
  // 1. Producer folder
  const producerFolderId = await getOrCreateFolder(producer, mainFolderId);
  // 2. Type folder
  const typeFolderId = await getOrCreateFolder(type, producerFolderId);
  // 3. Genre folder
  const genreFolderId = await getOrCreateFolder(genre, typeFolderId);

  // 4. Upload file
  const fileMetadata = {
    name: path.basename(localFilePath),
    parents: [genreFolderId],
  };
  const media = {
    mimeType: 'audio/wav', // or detect from file
    body: fs.createReadStream(localFilePath),
  };
  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: 'id, webViewLink',
  });
  return file.data;
}

module.exports = { uploadTrackToDrive };