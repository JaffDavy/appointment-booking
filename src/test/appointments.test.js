import request from "supertest";
import app from "../app.js";
import { pool } from "../config/db.js";

describe("Appointments API Tests", () => {
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
    const login = await request(app).post("/auth/login").send({
        email: "alice.smith@clinic.com",
        password: "password123"
    });
    
    const res = await request(app)
        .post("/appointments/book")
        .set("Authorization", `Bearer ${login.body.token}`)
        .send({ slotId: "00000000-0000-0000-0000-000000000000" });
    expect([400, 404]).toContain(res.status);});
});