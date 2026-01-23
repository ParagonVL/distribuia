import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Reduce in production for cost optimization
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay configuration
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text to avoid capturing sensitive data
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
