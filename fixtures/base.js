const base = require('@playwright/test');
const envConfig = require('../config/env');
const logger = require('../utils/logger');
const { generateRandomName } = require('../utils/random');

const test = base.test.extend({
  appConfig: async ({}, use) => {
    await use(envConfig);
  },
  testData: async ({}, use) => {
    await use({
      randomName: generateRandomName('form'),
    });
  },
  logger: async ({}, use) => {
    await use(logger);
  },
});

module.exports = { test, expect: base.expect };
