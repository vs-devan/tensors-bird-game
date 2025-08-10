console.log('api.js loaded');

const API_BASE = 'http://localhost:3000/api/';

export async function fetchLeaderboard() {
  console.log('fetchLeaderboard called: Sending GET to', `${API_BASE}leaderboard`);
  try {
    const response = await fetch(`${API_BASE}leaderboard`);
    console.log('fetchLeaderboard response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('fetchLeaderboard success:', data);
    return data;
  } catch (error) {
    console.error('fetchLeaderboard error:', error.message);
    console.log('fetchLeaderboard returning empty array as fallback');
    return [];
  }
}

export async function submitScore(name, email, department, score) {
  console.log('submitScore called with:', { name, email, department, score });
  console.log('submitScore sending POST to', `${API_BASE}submit-score`);
  try {
    const response = await fetch(`${API_BASE}submit-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, department, score }),
    });
    console.log('submitScore response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('submitScore success:', data);
    return data;
  } catch (error) {
    console.error('submitScore error:', error.message);
    console.log('submitScore returning error object');
    return { error: error.message };
  }
}