/**
 * Tests for the cache module implementation
 * Mocks @upstash/redis to test actual functionality
 */

// Mock environment variables first
const originalEnv = process.env;

// Mock the Redis module
const mockRedisInstance = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
};

jest.mock("@upstash/redis", () => ({
  Redis: jest.fn(() => mockRedisInstance),
}));

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, "error").mockImplementation();

describe("Cache Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment for each test
    process.env = {
      ...originalEnv,
      UPSTASH_REDIS_REST_URL: "https://test-redis.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "test-token",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
    mockConsoleError.mockRestore();
  });

  describe("with Redis enabled", () => {
    // Re-import the module for each test suite with fresh env
    let cacheModule: typeof import("@/lib/cache");

    beforeEach(async () => {
      jest.resetModules();
      cacheModule = await import("@/lib/cache");
    });

    describe("CACHE_TTL constants", () => {
      it("should have correct TTL values", () => {
        expect(cacheModule.CACHE_TTL.SHORT).toBe(60);
        expect(cacheModule.CACHE_TTL.MEDIUM).toBe(300);
        expect(cacheModule.CACHE_TTL.LONG).toBe(900);
        expect(cacheModule.CACHE_TTL.VERY_LONG).toBe(3600);
      });
    });

    describe("cacheKey generators", () => {
      it("should generate correct userUsage key", () => {
        expect(cacheModule.cacheKey.userUsage("user-123")).toBe("cache:user:usage:user-123");
      });

      it("should generate correct historyCount key", () => {
        expect(cacheModule.cacheKey.historyCount("user-456")).toBe("cache:history:count:user-456");
      });

      it("should generate correct historyPage key", () => {
        expect(cacheModule.cacheKey.historyPage("user-789", 3)).toBe("cache:history:page:user-789:3");
      });
    });

    describe("cacheGet", () => {
      it("should return cached value", async () => {
        mockRedisInstance.get.mockResolvedValueOnce({ data: "cached" });

        const result = await cacheModule.cacheGet("test-key");

        expect(result).toEqual({ data: "cached" });
        expect(mockRedisInstance.get).toHaveBeenCalledWith("test-key");
      });

      it("should return null on cache miss", async () => {
        mockRedisInstance.get.mockResolvedValueOnce(null);

        const result = await cacheModule.cacheGet("missing-key");

        expect(result).toBeNull();
      });

      it("should return null and log error on Redis error", async () => {
        mockRedisInstance.get.mockRejectedValueOnce(new Error("Redis error"));

        const result = await cacheModule.cacheGet("error-key");

        expect(result).toBeNull();
        expect(mockConsoleError).toHaveBeenCalledWith("Cache get error:", expect.any(Error));
      });
    });

    describe("cacheSet", () => {
      it("should set value with default TTL", async () => {
        mockRedisInstance.set.mockResolvedValueOnce("OK");

        await cacheModule.cacheSet("test-key", { data: "value" });

        expect(mockRedisInstance.set).toHaveBeenCalledWith(
          "test-key",
          { data: "value" },
          { ex: 300 } // Default MEDIUM TTL
        );
      });

      it("should set value with custom TTL", async () => {
        mockRedisInstance.set.mockResolvedValueOnce("OK");

        await cacheModule.cacheSet("test-key", "value", 60);

        expect(mockRedisInstance.set).toHaveBeenCalledWith("test-key", "value", { ex: 60 });
      });

      it("should log error on Redis error", async () => {
        mockRedisInstance.set.mockRejectedValueOnce(new Error("Set failed"));

        await cacheModule.cacheSet("test-key", "value");

        expect(mockConsoleError).toHaveBeenCalledWith("Cache set error:", expect.any(Error));
      });
    });

    describe("cacheDelete", () => {
      it("should delete key", async () => {
        mockRedisInstance.del.mockResolvedValueOnce(1);

        await cacheModule.cacheDelete("test-key");

        expect(mockRedisInstance.del).toHaveBeenCalledWith("test-key");
      });

      it("should log error on Redis error", async () => {
        mockRedisInstance.del.mockRejectedValueOnce(new Error("Delete failed"));

        await cacheModule.cacheDelete("test-key");

        expect(mockConsoleError).toHaveBeenCalledWith("Cache delete error:", expect.any(Error));
      });
    });

    describe("cacheDeletePattern", () => {
      it("should delete all keys matching pattern", async () => {
        mockRedisInstance.keys.mockResolvedValueOnce(["key1", "key2", "key3"]);
        mockRedisInstance.del.mockResolvedValueOnce(3);

        await cacheModule.cacheDeletePattern("cache:test:*");

        expect(mockRedisInstance.keys).toHaveBeenCalledWith("cache:test:*");
        expect(mockRedisInstance.del).toHaveBeenCalledWith("key1", "key2", "key3");
      });

      it("should not call del if no keys match", async () => {
        mockRedisInstance.keys.mockResolvedValueOnce([]);

        await cacheModule.cacheDeletePattern("cache:nonexistent:*");

        expect(mockRedisInstance.keys).toHaveBeenCalled();
        expect(mockRedisInstance.del).not.toHaveBeenCalled();
      });

      it("should log error on Redis error", async () => {
        mockRedisInstance.keys.mockRejectedValueOnce(new Error("Keys failed"));

        await cacheModule.cacheDeletePattern("cache:*");

        expect(mockConsoleError).toHaveBeenCalledWith("Cache delete pattern error:", expect.any(Error));
      });
    });

    describe("invalidateUserCache", () => {
      it("should invalidate all user cache keys", async () => {
        mockRedisInstance.del.mockResolvedValue(1);

        await cacheModule.invalidateUserCache("user-123");

        // Should delete: userUsage, historyCount, and 10 history pages
        expect(mockRedisInstance.del).toHaveBeenCalledWith("cache:user:usage:user-123");
        expect(mockRedisInstance.del).toHaveBeenCalledWith("cache:history:count:user-123");
        // Check some page deletes
        expect(mockRedisInstance.del).toHaveBeenCalledWith("cache:history:page:user-123:1");
        expect(mockRedisInstance.del).toHaveBeenCalledWith("cache:history:page:user-123:10");
      });

      it("should log error on failure", async () => {
        // When del fails, the error is caught at the cacheDelete level
        mockRedisInstance.del.mockRejectedValue(new Error("Delete failed"));

        await cacheModule.invalidateUserCache("user-123");

        // Errors are logged by individual cacheDelete calls
        expect(mockConsoleError).toHaveBeenCalledWith("Cache delete error:", expect.any(Error));
      });
    });

    describe("cacheGetOrSet", () => {
      it("should return cached value on cache hit", async () => {
        mockRedisInstance.get.mockResolvedValueOnce({ cached: true });

        const fetcher = jest.fn().mockResolvedValue({ fresh: true });
        const result = await cacheModule.cacheGetOrSet("test-key", fetcher);

        expect(result).toEqual({ cached: true });
        expect(fetcher).not.toHaveBeenCalled();
      });

      it("should fetch and cache on cache miss", async () => {
        mockRedisInstance.get.mockResolvedValueOnce(null);
        mockRedisInstance.set.mockResolvedValueOnce("OK");

        const fetcher = jest.fn().mockResolvedValue({ fresh: true });
        const result = await cacheModule.cacheGetOrSet("test-key", fetcher, 600);

        expect(result).toEqual({ fresh: true });
        expect(fetcher).toHaveBeenCalled();
        // Wait for async cache set
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(mockRedisInstance.set).toHaveBeenCalledWith("test-key", { fresh: true }, { ex: 600 });
      });

      it("should use default TTL when not specified", async () => {
        mockRedisInstance.get.mockResolvedValueOnce(null);
        mockRedisInstance.set.mockResolvedValueOnce("OK");

        const fetcher = jest.fn().mockResolvedValue("data");
        await cacheModule.cacheGetOrSet("test-key", fetcher);

        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(mockRedisInstance.set).toHaveBeenCalledWith("test-key", "data", { ex: 300 });
      });

      it("should return fresh data even if caching fails", async () => {
        mockRedisInstance.get.mockResolvedValueOnce(null);
        mockRedisInstance.set.mockRejectedValueOnce(new Error("Cache error"));

        const fetcher = jest.fn().mockResolvedValue({ data: "important" });
        const result = await cacheModule.cacheGetOrSet("test-key", fetcher);

        expect(result).toEqual({ data: "important" });
      });
    });

    describe("isCachingEnabled", () => {
      it("should return true when Redis is configured", () => {
        expect(cacheModule.isCachingEnabled()).toBe(true);
      });
    });
  });

  describe("with Redis disabled", () => {
    let cacheModuleDisabled: typeof import("@/lib/cache");

    beforeEach(async () => {
      // Clear env vars to disable Redis
      process.env = { ...originalEnv };
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      jest.resetModules();
      cacheModuleDisabled = await import("@/lib/cache");
    });

    it("isCachingEnabled should return false", () => {
      expect(cacheModuleDisabled.isCachingEnabled()).toBe(false);
    });

    it("cacheGet should return null", async () => {
      const result = await cacheModuleDisabled.cacheGet("any-key");
      expect(result).toBeNull();
    });

    it("cacheSet should do nothing", async () => {
      // Should not throw
      await cacheModuleDisabled.cacheSet("key", "value");
      expect(mockRedisInstance.set).not.toHaveBeenCalled();
    });

    it("cacheDelete should do nothing", async () => {
      await cacheModuleDisabled.cacheDelete("key");
      expect(mockRedisInstance.del).not.toHaveBeenCalled();
    });

    it("cacheDeletePattern should do nothing", async () => {
      await cacheModuleDisabled.cacheDeletePattern("cache:*");
      expect(mockRedisInstance.keys).not.toHaveBeenCalled();
    });

    it("invalidateUserCache should do nothing", async () => {
      await cacheModuleDisabled.invalidateUserCache("user-123");
      expect(mockRedisInstance.del).not.toHaveBeenCalled();
    });

    it("cacheGetOrSet should always call fetcher", async () => {
      const fetcher = jest.fn().mockResolvedValue({ data: "fresh" });
      const result = await cacheModuleDisabled.cacheGetOrSet("key", fetcher);

      expect(result).toEqual({ data: "fresh" });
      expect(fetcher).toHaveBeenCalled();
    });
  });
});
