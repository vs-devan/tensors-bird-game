// backend/routes/api.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { getDepartment } = require('../utils/department');

// Validate IIT Madras email
const validateEmail = (email) => {
  return /.*@(smail\.iitm\.ac\.in|iitm\.ac\.in)$/i.test(email);
};

// POST /api/user - Create or update user
router.post('/user', async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ success: false, error: 'Email and name are required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, error: 'Invalid IIT Madras email' });
  }
  const department = getDepartment(email);
  const referralCode = Math.random().toString(36).substring(2, 10); // Generate unique referral code
  const result = await User.createOrUpdate({ email, name, department, referralCode });
  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.status(200).json({ success: true, data: { email, name, department, referralCode } });
});

// GET /api/user/:email - Get user by email
// backend/routes/api.js
router.get('/user/:email', async (req, res) => {
  const email = decodeURIComponent(req.params.email); // Decode URL-encoded email
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, error: 'Invalid IIT Madras email' });
  }
  const result = await User.getByEmail(email);
  if (!result.success) {
    return res.status(404).json({ success: false, error: result.error });
  }
  res.status(200).json({ success: true, data: result.data });
});

// POST /api/score - Update high score
router.post('/score', async (req, res) => {
  const { email, score } = req.body;
  if (!email || typeof score !== 'number') {
    return res.status(400).json({ success: false, error: 'Email and score are required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, error: 'Invalid IIT Madras email' });
  }
  const result = await User.updateHighScore(email, score);
  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.status(200).json({ success: true });
});

// GET /api/leaderboard - Get leaderboard
router.get('/leaderboard', async (req, res) => {
  const result = await User.getLeaderboard();
  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.status(200).json({ success: true, data: result.data });
});

// POST /api/referral - Validate referral and grant extra life
router.post('/referral', async (req, res) => {
  const { referralCode, email } = req.body;
  if (!referralCode || !email) {
    return res.status(400).json({ success: false, error: 'Referral code and email are required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, error: 'Invalid IIT Madras email' });
  }
  // Check if referral code exists
  const snapshot = await User.collection('users')
    .where('referralCode', '==', referralCode)
    .get();
  if (snapshot.empty) {
    return res.status(400).json({ success: false, error: 'Invalid referral code' });
  }
  // In a real implementation, track referral usage (e.g., one per session) in Firestore
  res.status(200).json({ success: true, extraLife: true });
});

module.exports = router;