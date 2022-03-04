const fs = require('fs');

const config = JSON.parse(fs.readFileSync(`../../.swcrc`, 'utf-8'));

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', config],
  },
};
