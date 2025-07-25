/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@common/(.*)$": "<rootDir>/../../packages/common/src/$1",
    "^@logger/(.*)$": "<rootDir>/../../packages/logger/src/$1",
    "^@db$": "<rootDir>/src/generated/db",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "./tsconfig.test.json" }],
  },
};
