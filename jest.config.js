module.exports = {
  preset: "jest-preset-angular",
  roots: ['src'],
  setupFilesAfterEnv: ["<rootDir>/src/setup-jest.ts"],
  moduleNameMapper: {
    '@env(.*)': '<rootDir>/src/environments/$1',
    '@entity(.*)': '<rootDir>/src/entity/$1'
  },
  transform: {
    "^.+\\.(ts|js|html)$": "ts-preset-angular"
  },
}