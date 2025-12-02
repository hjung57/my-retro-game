module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: ['public/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/']
};
