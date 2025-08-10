// backend/utils/department.js
const departmentMap = {
  cs: 'Computer Science',
  ee: 'Electrical Engineering',
  me: 'Mechanical Engineering',
  ed: 'Engineering Design',
  ch: 'Chemical Engineering',
  ce: 'Civil Engineering',
  bt: 'Biotechnology',
  ae: 'Aerospace Engineering',
  ph: 'Physics',
  ma: 'Mathematics',
  // Add more department mappings as needed
};

function getDepartment(email) {
  // Validate email format
  const emailRegex = /.*@(smail\.iitm\.ac\.in|iitm\.ac\.in)$/i;
  if (!emailRegex.test(email)) {
    return 'Invalid Email';
  }

  // Extract prefix from email (e.g., 'cs' from 'cs20b001@smail.iitm.ac.in')
  const prefix = email.split('@')[0].match(/^[a-z]+/i)?.[0].toLowerCase() || '';
  return departmentMap[prefix] || 'Unknown';
}

module.exports = { getDepartment };