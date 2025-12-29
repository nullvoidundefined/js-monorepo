module.exports = {
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@application/shared$': '<rootDir>/../../packages/shared/src',
    '^@application/types$': '<rootDir>/../../packages/shared/src/types',
    '^@application/controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@application/routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@application/middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@application/utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
