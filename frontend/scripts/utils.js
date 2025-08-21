// utils.js: Validation, department inference, device detection

console.log('utils.js loaded');

const departmentMap = {
  'cs': 'Computer Science',
  'ee': 'Electrical Engineering',
  'me': 'Mechanical Engineering',
  'ed': 'Engineering Design',
  'ch': 'Chemical Engineering',
  'ce': 'Civil Engineering',
  'bt': 'Biotechnology',
};

function getDepartment(email) {
  const prefix = email.split('@')[0].match(/^[a-z]+/i)?.[0].toLowerCase() || '';
  return departmentMap[prefix] || 'Unknown';
}

function isValidIITMEmail(email) {
  // Pattern: 2 letters, 2 digits, 1 letter, 3 digits, then domain
  const regex = /^[a-zA-Z]{2}\d{2}[a-zA-Z]{1}\d{3}@(smail\.iitm\.ac\.in|iitm\.ac\.in)$/i;
  return regex.test(email);
}

function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent) || 'ontouchstart' in window;
}

export { getDepartment, isValidIITMEmail, isMobile };