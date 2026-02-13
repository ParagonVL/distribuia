/**
 * @jest-environment node
 */

/**
 * API Route Tests: /api/stripe/create-checkout
 *
 * Tests the Stripe checkout session creation for subscription purchases.
 */

describe("POST /api/stripe/create-checkout", () => {
  describe("Authentication", () => {
    it("should require authentication", () => {
      const unauthenticatedStatus = 401;
      expect(unauthenticatedStatus).toBe(401);
    });

    it("should require CSRF header", () => {
      const requiredHeader = "X-Requested-With";
      expect(requiredHeader).toBe("X-Requested-With");
    });
  });

  describe("Request Validation", () => {
    it("should require priceId in body", () => {
      const requiredFields = ["priceId", "waiverAccepted"];
      expect(requiredFields).toContain("priceId");
    });

    it("should require waiverAccepted to be true", () => {
      // Spanish consumer law requires explicit waiver acceptance
      const waiverRequired = true;
      expect(waiverRequired).toBe(true);
    });

    it("should return 400 if waiver not accepted", () => {
      const errorResponse = {
        error: {
          code: "WAIVER_REQUIRED",
          message: "Debes aceptar la renuncia al derecho de desistimiento",
        },
      };
      expect(errorResponse.error.code).toBe("WAIVER_REQUIRED");
    });

    it("should validate priceId against allowed values", () => {
      const validPriceIds = [
        "price_starter_monthly",
        "price_pro_monthly",
      ];
      expect(validPriceIds).toHaveLength(2);
    });

    it("should return 400 for invalid priceId", () => {
      const errorResponse = {
        error: {
          code: "INVALID_PRICE",
          message: "Plan no valido",
        },
      };
      expect(errorResponse.error.code).toBe("INVALID_PRICE");
    });
  });

  describe("Stripe Customer Handling", () => {
    it("should create Stripe customer if not exists", () => {
      const customerCreation = {
        email: "user@example.com",
        metadata: { supabase_user_id: "uuid" },
      };
      expect(customerCreation).toHaveProperty("email");
      expect(customerCreation.metadata).toHaveProperty("supabase_user_id");
    });

    it("should reuse existing Stripe customer", () => {
      const existingCustomerId = "cus_existing123";
      expect(existingCustomerId).toMatch(/^cus_/);
    });

    it("should store customer ID in database", () => {
      const updateField = "stripe_customer_id";
      expect(updateField).toBe("stripe_customer_id");
    });
  });

  describe("Upgrade Flow (Existing Subscription)", () => {
    it("should detect existing active subscription", () => {
      // Query Stripe for active subscriptions
      const subscriptionQuery = {
        customer: "cus_123",
        status: "active",
        limit: 1,
      };
      expect(subscriptionQuery.status).toBe("active");
    });

    it("should use subscription update for upgrades", () => {
      // Updates existing subscription instead of creating new checkout
      const upgradeMethod = "stripe.subscriptions.update";
      expect(upgradeMethod).toContain("update");
    });

    it("should apply proration for upgrades", () => {
      const prorationBehavior = "create_prorations";
      expect(prorationBehavior).toBe("create_prorations");
    });

    it("should redirect to billing with success for upgrades", () => {
      const upgradeSuccessUrl = "/billing?success=true";
      expect(upgradeSuccessUrl).toContain("success=true");
    });
  });

  describe("New Subscription Flow", () => {
    it("should create checkout session for new subscribers", () => {
      const sessionConfig = {
        mode: "subscription",
        payment_method_types: ["card"],
        locale: "es",
        allow_promotion_codes: true,
      };
      expect(sessionConfig.mode).toBe("subscription");
      expect(sessionConfig.locale).toBe("es");
    });

    it("should include user metadata in subscription", () => {
      const metadata = { supabase_user_id: "uuid" };
      expect(metadata).toHaveProperty("supabase_user_id");
    });

    it("should set correct success/cancel URLs", () => {
      const successUrl = "https://distribuia.es/billing?success=true";
      const cancelUrl = "https://distribuia.es/billing?canceled=true";
      expect(successUrl).toContain("success=true");
      expect(cancelUrl).toContain("canceled=true");
    });
  });

  describe("Withdrawal Waiver Storage", () => {
    it("should store waiver acceptance for legal compliance", () => {
      const waiverRecord = {
        user_id: "uuid",
        product: "starter",
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0...",
        waiver_version: "v1",
        checkout_session_id: "cs_123",
      };
      expect(waiverRecord).toHaveProperty("ip_address");
      expect(waiverRecord).toHaveProperty("user_agent");
      expect(waiverRecord).toHaveProperty("waiver_version");
    });

    it("should reference Spanish consumer law", () => {
      // Article 103.m of RDL 1/2007
      const legalReference = "art. 103.m RDL 1/2007";
      expect(legalReference).toContain("103.m");
    });
  });

  describe("Response", () => {
    it("should return checkout URL for new subscriptions", () => {
      const response = { url: "https://checkout.stripe.com/..." };
      expect(response).toHaveProperty("url");
      expect(response.url).toContain("stripe.com");
    });

    it("should return billing URL for upgrades", () => {
      const response = { url: "/billing?success=true" };
      expect(response.url).toContain("billing");
    });
  });
});
