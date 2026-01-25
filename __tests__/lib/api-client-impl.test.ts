/**
 * Tests for the API client implementation
 * These tests mock fetch to test the actual module functionality
 */

// Mock fetch globally before importing
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Response if not available in test environment
if (typeof Response === "undefined") {
  (global as unknown as { Response: typeof Response }).Response = class Response {
    ok: boolean;
    status: number;
    body: unknown;

    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      return this.body;
    }
  } as unknown as typeof Response;
}

import { apiFetch, apiPost, apiDelete, API_HEADERS, JSON_API_HEADERS } from "@/lib/api-client";

describe("API Client Implementation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  describe("Constants", () => {
    it("API_HEADERS should include CSRF header", () => {
      expect(API_HEADERS["X-Requested-With"]).toBe("XMLHttpRequest");
    });

    it("JSON_API_HEADERS should include CSRF and Content-Type", () => {
      expect(JSON_API_HEADERS["X-Requested-With"]).toBe("XMLHttpRequest");
      expect(JSON_API_HEADERS["Content-Type"]).toBe("application/json");
    });
  });

  describe("apiFetch", () => {
    it("should add CSRF header for POST requests", async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

      await apiFetch("/api/test", { method: "POST" });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      expect(headers.get("X-Requested-With")).toBe("XMLHttpRequest");
    });

    it("should add CSRF header for DELETE requests", async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

      await apiFetch("/api/test", { method: "DELETE" });

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      expect(headers.get("X-Requested-With")).toBe("XMLHttpRequest");
    });

    it("should add CSRF header for PUT requests", async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

      await apiFetch("/api/test", { method: "PUT" });

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      expect(headers.get("X-Requested-With")).toBe("XMLHttpRequest");
    });

    it("should NOT add CSRF header for GET requests", async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

      await apiFetch("/api/test", { method: "GET" });

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      expect(headers.get("X-Requested-With")).toBeNull();
    });

    it("should NOT add CSRF header for HEAD requests", async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

      await apiFetch("/api/test", { method: "HEAD" });

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      expect(headers.get("X-Requested-With")).toBeNull();
    });

    it("should NOT add CSRF header for OPTIONS requests", async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

      await apiFetch("/api/test", { method: "OPTIONS" });

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      expect(headers.get("X-Requested-With")).toBeNull();
    });

    it("should default to GET when no method specified", async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

      await apiFetch("/api/test");

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      // No CSRF for GET
      expect(headers.get("X-Requested-With")).toBeNull();
    });

    it("should preserve existing headers", async () => {
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: true })));

      await apiFetch("/api/test", {
        method: "POST",
        headers: { "Authorization": "Bearer token123" },
      });

      const [, options] = mockFetch.mock.calls[0];
      const headers = options.headers as Headers;
      expect(headers.get("Authorization")).toBe("Bearer token123");
      expect(headers.get("X-Requested-With")).toBe("XMLHttpRequest");
    });

    it("should return the fetch response", async () => {
      const mockResponse = new Response(JSON.stringify({ data: "test" }));
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await apiFetch("/api/test");

      expect(result).toBe(mockResponse);
    });
  });

  describe("apiPost", () => {
    it("should make POST request with JSON body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

      const result = await apiPost("/api/test", { name: "test" });

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "test" }),
        })
      );
      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
    });

    it("should include CSRF and Content-Type headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiPost("/api/test", {});

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should return error for non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: "Bad request" } }),
      });

      const result = await apiPost("/api/test", {});

      expect(result.data).toBeNull();
      expect(result.error).toBe("Bad request");
      expect(result.response.status).toBe(400);
    });

    it("should use default error message when none provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      const result = await apiPost("/api/test", {});

      expect(result.error).toBe("Error de servidor");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await apiPost("/api/test", {});

      expect(result.data).toBeNull();
      expect(result.error).toBe("Error de conexion");
      // Response is a placeholder with status 0
      expect(result.response).toBeTruthy();
    });

    it("should return typed data", async () => {
      interface UserResponse {
        id: string;
        name: string;
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "123", name: "Test User" }),
      });

      const result = await apiPost<UserResponse>("/api/users", { name: "Test User" });

      expect(result.data?.id).toBe("123");
      expect(result.data?.name).toBe("Test User");
    });
  });

  describe("apiDelete", () => {
    it("should make DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ deleted: true }),
      });

      const result = await apiDelete("/api/test/123");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test/123",
        expect.objectContaining({
          method: "DELETE",
        })
      );
      expect(result.data).toEqual({ deleted: true });
      expect(result.error).toBeNull();
    });

    it("should include CSRF header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiDelete("/api/test");

      expect(mockFetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Requested-With": "XMLHttpRequest",
          }),
        })
      );
    });

    it("should return error for non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: { message: "Not found" } }),
      });

      const result = await apiDelete("/api/test/999");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Not found");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

      const result = await apiDelete("/api/test");

      expect(result.data).toBeNull();
      expect(result.error).toBe("Error de conexion");
    });
  });
});
