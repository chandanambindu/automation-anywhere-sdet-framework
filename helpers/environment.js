const envConfig = require('../config/env');

function getRequiredEnv(name) {
  const value = process.env[name] || envConfig[name] || '';

  if (!value) {
    throw new Error(`Required environment variable is missing: ${name}`);
  }

  return value;
}

function getOptionalEnv(name, fallback = '') {
  return process.env[name] || envConfig[name] || fallback;
}

module.exports = {
  getRequiredEnv,
  getOptionalEnv,
};
