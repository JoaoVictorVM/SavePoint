import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Path to the Next.js app for loading next.config + .env files
  dir: "./",
});

const customConfig: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Apenas para mocks específicos por ambiente, se precisarmos
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  testMatch: [
    "<rootDir>/__tests__/**/*.test.{ts,tsx}",
    "<rootDir>/src/**/*.test.{ts,tsx}",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**/layout.tsx",
    "!src/app/**/page.tsx", // server components — fora do escopo (estratégia 4a)
    "!src/middleware.ts",
    "!src/proxy.ts",
  ],
  // Sem threshold inicialmente (estratégia 7a)
};

export default createJestConfig(customConfig);
