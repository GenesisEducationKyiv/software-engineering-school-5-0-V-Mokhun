const commonConfig = require("./jest.common.config");

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  ...commonConfig,
  testMatch: ["**/unit/**/*.test.ts"],
};
