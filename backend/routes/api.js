// backend/routes/api.js
const express = require('express');
const { mongoose } = require('../config/db');
const router = express.Router();
const User= require('../models/user'); // Assuming you have a User model defined
// Example Schema & Model
const crypto = require('crypto');
// GET all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// CREATE a new user

router.post('/users', async (req, res) => {
  try {
    const { name, email, department, highScore = 0 } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    // Generate secret key: first 8 letters/numbers from email, uppercase
    const secretKey = email.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase();

    // Ensure uniqueness in DB
    const existingKey = await User.findOne({ secretKey });
    if (existingKey) {
      return res.status(500).json({ success: false, error: 'Key generation conflict. Try again.' });
    }

    const user = new User({ name, email, department, highScore, secretKey });
    await user.save();

    res.status(201).json({
      success: true,
      data: user,
      secretKey
    });
  } catch (err) {
    console.error('Error creating user:', err);

    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// GET top 10 users by high score
router.get('/users/top10', async (req, res) => {
  try {
    const topUsers = await User.find({ highScore: { $gt: 0 } })
      .sort({ highScore: -1 }) // Sort descending
      .limit(10)
      .select('name email department highScore referralCode updatedAt');

    res.json({ success: true, data: topUsers });
  } catch (err) {
    console.error('Error fetching top 10 users:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



router.post('/users/login', async (req, res) => {
  try {
    const { secretKey } = req.body;
    if (!secretKey) {
      return res.status(400).json({ success: false, error: 'Secret key required' });
    }

    // Convert secretKey to uppercase
    const upperCaseSecretKey = secretKey.toUpperCase();

    const result = await User.loginWithSecretKey(upperCaseSecretKey);
    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json({ success: true, data: result.data });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// UPDATE high score using secretKey
router.put('/users/update-score', async (req, res) => {
  try {
    const { secretKey, highScore } = req.body;

    if (!secretKey) {
      return res.status(400).json({ success: false, error: 'Secret key required' });
    }
    if (typeof highScore !== 'number') {
      return res.status(400).json({ success: false, error: 'High score must be a number' });
    }

    const user = await User.findOne({ secretKey });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (highScore > user.highScore) {
      user.highScore = highScore;
      user.updatedAt = new Date();
      await user.save();
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('Error updating high score:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});





// DELETE a user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
