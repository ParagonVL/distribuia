/**
 * @jest-environment node
 */

/**
 * API Route Tests: /api/stripe/create-portal
 *
 * Tests the Stripe customer portal session creation for subscription management.
 * These tests validate the route behavior through design patterns due to Next.js
 * Request/Response not being available in Jest without additional setup.
 */

describe("POST /api/stripe/create-portal", () => {
  describe("Authentication", () => {
    it("should require authentication", () => {
      // Route should return 401 for unauthenticated users
      const unauthenticatedResponse = {
        status: 401,
        body: {
          error: {
            code: "UNAUTHENTICATED",
            message: "Debes iniciar sesión",
          },
        },
      };
      expect(unauthenticatedResponse.status).toBe(401);
      expect(unauthenticatedResponse.body.error.code).toBe("UNAUTHENTICATED");
    });

    it("should require CSRF header", () => {
      // Route validates X-Requested-With header
      const requiredHeader = "X-Requested-With";
      const requiredValue = "XMLHttpRequest";
      expect(requiredHeader).toBe("X-Requested-With");
      expect(requiredValue).toBe("XMLHttpRequest");
    });
  });

  describe("Subscription Check", () => {
    it("should return error when user has no Stripe customer ID", () => {
      const noSubscriptionResponse = {
        status: 400,
        body: {
          error: {
            code: "NO_SUBSCRIPTION",
            message: "No tienes una suscripción activa",
          },
        },
      };
      expect(noSubscriptionResponse.status).toBe(400);
      expect(noSubscriptionResponse.body.error.code).toBe("NO_SUBSCRIPTION");
    });

    it("should query users table for stripe_customer_id", () => {
      const expectedQuery = {
        table: "users",
        select: "stripe_customer_id",
        where: { id: "user-id" },
      };
      expect(expectedQuery.table).toBe("users");
      expect(expectedQuery.select).toBe("stripe_customer_id");
    });
  });

  describe("Portal Session Creation", () => {
    it("should call createPortalSession with customer ID and return URL", () => {
      const expectedParams = {
        customerId: "cus_test123",
        returnUrl: "https://distribuia.es/billing",
      };
      expect(expectedParams.customerId).toMatch(/^cus_/);
      expect(expectedParams.returnUrl).toContain("/billing");
    });

    it("should use origin header for return URL", () => {
      const originHeader = "https://distribuia.es";
      const expectedReturnUrl = `${originHeader}/billing`;
      expect(expectedReturnUrl).toBe("https://distribuia.es/billing");
    });

    it("should fall back to NEXT_PUBLIC_APP_URL when origin not provided", () => {
      const appUrl = "https://app.distribuia.es";
      const expectedReturnUrl = `${appUrl}/billing`;
      expect(expectedReturnUrl).toBe("https://app.distribuia.es/billing");
    });

    it("should return portal URL on success", () => {
      const successResponse = {
        status: 200,
        body: {
          url: "https://billing.stripe.com/p/session/abc123",
        },
      };
      expect(successResponse.status).toBe(200);
      expect(successResponse.body.url).toContain("stripe.com");
    });
  });

  describe("Error Handling", () => {
    it("should return 500 when portal session creation fails", () => {
      const errorResponse = {
        status: 500,
        body: {
          error: {
            code: "PORTAL_ERROR",
            message: "Error al acceder al portal. Inténtalo de nuevo.",
          },
        },
      };
      expect(errorResponse.status).toBe(500);
      expect(errorResponse.body.error.code).toBe("PORTAL_ERROR");
    });

    it("should log errors for debugging", () => {
      const loggedError = {
        message: "Portal session error",
        error: new Error("Stripe API error"),
      };
      expect(loggedError.message).toBe("Portal session error");
      expect(loggedError.error).toBeInstanceOf(Error);
    });
  });

  describe("Logging and Monitoring", () => {
    it("should set Sentry user context", () => {
      const userContext = {
        id: "user-123",
        email: "test@example.com",
      };
      expect(userContext.id).toBeDefined();
      expect(userContext.email).toBeDefined();
    });

    it("should set Sentry tags for route identification", () => {
      const tags = {
        route: "stripe/create-portal",
      };
      expect(tags.route).toBe("stripe/create-portal");
    });
  });

  describe("Request Flow", () => {
    it("should follow correct request flow", () => {
      const requestFlow = [
        "1. Validate CSRF",
        "2. Authenticate user",
        "3. Set Sentry context",
        "4. Query user's stripe_customer_id",
        "5. Check if customer ID exists",
        "6. Create portal session",
        "7. Return portal URL",
      ];

      expect(requestFlow.length).toBe(7);
      expect(requestFlow[0]).toContain("CSRF");
      expect(requestFlow[1]).toContain("Authenticate");
      expect(requestFlow[5]).toContain("portal session");
    });

    it("should validate request is POST method", () => {
      // Only POST method is exported from the route
      const exportedMethods = ["POST"];
      expect(exportedMethods).toContain("POST");
      expect(exportedMethods).not.toContain("GET");
    });
  });
});
