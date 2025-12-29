module.exports = {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@client-web/controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@client-web/routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@client-web/middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@client-web/utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
