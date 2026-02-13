const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/e2e/"],
  collectCoverageFrom: [
    "lib/**/*.{js,jsx,ts,tsx}",
    "!lib/supabase/**", // Supabase clients require runtime env
    "!lib/stripe/**", // Stripe requires API keys
    "!lib/groq/client.ts", // Requires Groq API
    "!lib/groq/generate.ts", // Requires Groq API
    "!lib/groq/index.ts", // Re-exports only
    "!lib/processors/youtube.ts", // Requires network calls
    "!lib/processors/article.ts", // Requires network calls
    "!lib/email/**", // Requires Resend API
    "!lib/logger.ts", // Sentry/logging setup
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
