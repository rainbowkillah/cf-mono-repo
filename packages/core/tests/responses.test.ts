import { describe, it, expect } from "vitest";
import { json, notFound, unauthorized } from "../src/responses";

describe("Response Helpers", () => {
  describe("json()", () => {
    it("should create JSON response with correct content-type", async () => {
      const data = { message: "Hello, World!" };
      const response = json(data);

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe(
        "application/json; charset=utf-8"
      );

      const body = await response.json();
      expect(body).toEqual(data);
    });

    it("should accept custom status code", async () => {
      const data = { error: "Bad Request" };
      const response = json(data, { status: 400 });

      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body).toEqual(data);
    });

    it("should merge custom headers", async () => {
      const data = { ok: true };
      const response = json(data, {
        headers: { "x-custom-header": "test" },
      });

      expect(response.headers.get("content-type")).toBe(
        "application/json; charset=utf-8"
      );
      expect(response.headers.get("x-custom-header")).toBe("test");
    });
  });

  describe("notFound()", () => {
    it("should return 404 response", async () => {
      const response = notFound();

      expect(response.status).toBe(404);
      expect(await response.text()).toBe("Not Found");
    });
  });

  describe("unauthorized()", () => {
    it("should return 401 response", async () => {
      const response = unauthorized();

      expect(response.status).toBe(401);
      expect(await response.text()).toBe("Unauthorized");
    });
  });
});
