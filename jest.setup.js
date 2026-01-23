import "@testing-library/jest-dom";

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  replayIntegration: jest.fn(() => ({})),
}));

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
