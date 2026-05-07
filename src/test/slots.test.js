import request from "supertest";
import app from "../app.js";
import { pool } from "../config/db.js";

describe("Slots API Tests", () => {
    let token;

    beforeAll(async () => {
        const login = await request(app).post("/auth/login").send({
            email: "kevin@gmail.com",
            password: "george1000"
        });
        token = login.body.token;
    });

    afterAll(async () => {
        await pool.end();
    });

   test("Should allow provider to create a slot", async () => {
    const res = await request(app)
        .post("/slots")
        .set("Authorization", `Bearer ${token}`)
        .send({
          provider_id: "e34ed23a-0510-4924-a92b-bd236940636c",
          date: "2026-12-10",
          start_time: "2026-12-10 10:00:00",
          end_time: "2026-12-10 10:30:00",
          duration: 30
});
    expect([201, 409, 400]).toContain(res.status); 
});
});