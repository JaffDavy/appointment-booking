import request from "supertest";
import app from "../app.js";

describe("Swagger Documentation Tests", () => {
    test("Should serve the Swagger UI at /api-docs", async () => {
        const res = await request(app).get("/api-docs/");
        expect([200, 301]).toContain(res.status);
    });

    test("Should serve the raw Swagger JSON/YAML file", async () => {
        const res = await request(app).get("/api-docs-json");
        if (res.status === 200) {
            expect(res.body.openapi).toBe("3.0.0");
            expect(res.body.info.title).toBe("Appointment Booking API");
        }
    });
});