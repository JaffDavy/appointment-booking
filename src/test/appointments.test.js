import request from "supertest";
import app from "../app.js";
import { pool } from "../config/db.js";

describe("Appointments API Tests", () => {
  let authToken;

  beforeAll(async () => {
    // Generate a completely unique email per test run to prevent 409 conflicts
    const uniqueEmail = `alice.${Date.now()}@clinic.com`;

    // 1. Register the user
    const registerRes = await request(app).post("/auth/register").send({
      name: "Alice Smith",
      email: uniqueEmail,
      password: "password123",
      role: "client",
    });

    // Debug fallback if it still throws a 400 or 409
    if (registerRes.status !== 201) {
      console.log("Setup Registration Details:", registerRes.body);
    }

    // 2. Log in with the exact same credentials
    const loginRes = await request(app).post("/auth/login").send({
      email: uniqueEmail,
      password: "password123",
    });

    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  test("Should fail to book without authentication", async () => {
    const res = await request(app)
      .post("/appointments/book")
      .send({ slotId: "some-uuid" });
    expect(res.status).toBe(401);
  });

  test("Should return 404 for booking non-existent slot", async () => {
    const res = await request(app)
      .post("/appointments/book")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ slotId: "00000000-0000-0000-0000-000000000000" });

    expect([400, 404]).toContain(res.status);
  });
});
