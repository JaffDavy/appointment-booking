import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config();

export default {
  testEnvironment: 'node',
  transform: {},
  testTimeout: 30000,
  setupFiles: ['<rootDir>/jest.setup.js'],
};
