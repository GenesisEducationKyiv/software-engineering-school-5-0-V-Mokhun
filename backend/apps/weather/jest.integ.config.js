const commonConfig = require("./jest.common.config");

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  ...commonConfig,
  testMatch: ["**/integration/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/integration/setup.ts"],
};
