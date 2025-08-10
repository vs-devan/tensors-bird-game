// backend/models/user.js
const db = require('../config/db');

const User = {
  // Create or update user data
  async createOrUpdate(userData) {
    try {
      const { email, name, department, highScore = 0, referralCode = null } = userData;
      const userRef = db.collection('users').doc(email);
      await userRef.set(
        {
          email,
          name,
          department,
          highScore,
          referralCode,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      return { success: true, email };
    } catch (error) {
      console.error('Error creating/updating user:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user by email
  async getByEmail(email) {
    try {
      const userRef = db.collection('users').doc(email);
      const doc = await userRef.get();
      if (!doc.exists) {
        return { success: false, error: 'User not found' };
      }
      return { success: true, data: doc.data() };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, error: error.message };
    }
  },

  // Update high score
  async updateHighScore(email, score) {
    try {
      const userRef = db.collection('users').doc(email);
      await userRef.update({
        highScore: score,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating high score:', error);
      return { success: false, error: error.message };
    }
  },

  // Get leaderboard (top 100 users by high score)
  async getLeaderboard() {
    try {
      const snapshot = await db
        .collection('users')
        .where('highScore', '>', 0)
        .orderBy('highScore', 'desc')
        .limit(100)
        .get();
      const leaderboard = snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        email: doc.id,
        name: doc.data().name,
        department: doc.data().department,
        highScore: doc.data().highScore,
      }));
      return { success: true, data: leaderboard };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return { success: false, error: error.message };
    }
  },

  // Get top 5 users for shortlisting
  async getTopFive() {
    try {
      const snapshot = await db
        .collection('users')
        .where('highScore', '>', 0)
        .orderBy('highScore', 'desc')
        .limit(5)
        .get();
      const topFive = snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        email: doc.id,
        name: doc.data().name,
        department: doc.data().department,
        highScore: doc.data().highScore,
      }));
      return { success: true, data: topFive };
    } catch (error) {
      console.error('Error fetching top 5:', error);
      return { success: false, error: error.message };
    }
  },
};

module.exports = User;