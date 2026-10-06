module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@applyalert/contracts$': '<rootDir>/../../packages/contracts/src/index.ts',
    '^@applyalert/contracts/(.*)$': '<rootDir>/../../packages/contracts/src/$1',
    '^@applyalert/validation$': '<rootDir>/../../packages/validation/src/index.ts',
    '^@applyalert/validation/(.*)$': '<rootDir>/../../packages/validation/src/$1',
    '^lucide-react-native$': '<rootDir>/../../node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-screens|react-native-safe-area-context|@tanstack|react-native-get-random-values|uuid|react-native-mmkv|lucide-react-native)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
  ],
};
