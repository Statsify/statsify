/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  testMatch: ['<rootDir>/tests/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
};
