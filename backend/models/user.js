// models/user.js
const mongoose = require('mongoose');
const crypto = require('crypto');

// Helper to generate 7-char key (mix of letters, numbers, and '-')
function generateSecretKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-';
  let key = '';
  for (let i = 0; i < 7; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String },
  highScore: { type: Number, default: 0 },
  referralCode: { type: String, default: null },
  secretKey: { type: String, unique: true }, // new field for authentication
  updatedAt: { type: Date, default: Date.now }
});

// Static method: create or update user with secret key
userSchema.statics.createOrUpdate = async function (userData) {
  try {
    const { email, name, department, highScore = 0, referralCode = null } = userData;

    let user = await this.findOne({ email });
    if (!user) {
      // create new user
      user = new this({
        email,
        name,
        department,
        highScore,
        referralCode,
        secretKey: generateSecretKey()
      });
    } else {
      // update existing user
      user.name = name || user.name;
      user.department = department || user.department;
      user.highScore = highScore || user.highScore;
      user.referralCode = referralCode || user.referralCode;
    }

    user.updatedAt = new Date();
    await user.save();

    return { success: true, secretKey: user.secretKey, email: user.email };
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return { success: false, error: error.message };
  }
};

// Static method: login using secret key
userSchema.statics.loginWithSecretKey = async function (key) {
  try {
    const user = await this.findOne({ secretKey: key });
    if (!user) return { success: false, error: 'Invalid secret key' };
    return { success: true, data: user };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, error: error.message };
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
