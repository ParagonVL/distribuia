import * as Sentry from "@sentry/nextjs";

interface LogContext {
  [key: string]: unknown;
}

interface UserContext {
  id: string;
  email?: string;
  plan?: string;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Structured logger that integrates with Sentry
 * In production, only warn and error levels are logged to console
 * All errors are sent to Sentry with context
 */
export const logger = {
  /**
   * Set user context for all subsequent Sentry events
   */
  setUser(user: UserContext | null) {
    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
      });
      Sentry.setTag("plan", user.plan || "free");
    } else {
      Sentry.setUser(null);
    }
  },

  /**
   * Set custom tags for filtering in Sentry
   */
  setTags(tags: Record<string, string>) {
    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  },

  debug(message: string, context?: LogContext) {
    if (!isProduction) {
      console.log(`[DEBUG] ${message}`, context || "");
    }
  },

  info(message: string, context?: LogContext) {
    if (!isProduction) {
      console.log(`[INFO] ${message}`, context || "");
    }
  },

  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context || "");

    if (isProduction) {
      Sentry.captureMessage(message, {
        level: "warning",
        extra: context,
      });
    }
  },

  error(message: string, error?: Error | unknown, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error, context || "");

    if (isProduction && error instanceof Error) {
      Sentry.captureException(error, {
        extra: { message, ...context },
        tags: context?.errorType ? { errorType: String(context.errorType) } : undefined,
      });
    } else if (isProduction) {
      Sentry.captureMessage(message, {
        level: "error",
        extra: { error, ...context },
      });
    }
  },

  /**
   * Log API request with context
   */
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API ${method} ${path}`, context);
  },

  /**
   * Log API error with full context
   */
  apiError(method: string, path: string, error: Error | unknown, context?: LogContext) {
    this.error(`API ${method} ${path} failed`, error, context);
  },
};

export default logger;
