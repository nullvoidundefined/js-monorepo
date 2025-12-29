module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@application/shared$': '<rootDir>/../../packages/shared/src',
    '^@application/types$': '<rootDir>/../../packages/shared/src/types',
    '^@application/controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@application/routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@application/middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@application/utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/__tests__/**'],
  coverageDirectory: 'coverage',
};

