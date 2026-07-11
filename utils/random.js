function generateRandomString(prefix = 'item', length = 8) {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let value = prefix;

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    value += charset[randomIndex];
  }

  return value;
}

function generateRandomName(prefix = 'automation') {
  return generateRandomString(prefix, 6);
}

function generateRandomEmail(prefix = 'user') {
  const timestamp = Date.now();
  return `${prefix}+${timestamp}@example.com`;
}

module.exports = {
  generateRandomString,
  generateRandomName,
  generateRandomEmail,
};
