// backend/config/db.js
console.log(process.env.FIREBASE_CREDENTIALS);
// backend/config/db.js (updated for debugging)
const admin = require('firebase-admin');
require('dotenv').config();

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  console.log('Firebase credentials parsed successfully');
} catch (error) {
  console.error('Error parsing FIREBASE_CREDENTIALS:', error.message);
  throw error; // Stop initialization if invalid
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
console.log('Firestore initialized successfully'); // Add this log

module.exports = db;