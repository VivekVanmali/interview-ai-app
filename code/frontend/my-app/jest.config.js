module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
      '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
    },
    // Remove the transform section if you're removing Babel
    // transform: {
    //   '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
    // },
    testMatch: [
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      '**/?(*.)+(spec|test).{js,jsx,ts,tsx}'
    ],
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/**/*.d.ts',
      '!src/index.js',
    ],
  };