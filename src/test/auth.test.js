import request from "supertest";
import app from "../app";
import { pool } from "../config/db.js";

const uniqueEmail = `user-${Date.now()}@test.com`;

describe("Auth System Tests", () => {

    afterAll(async () => {
        await pool.end();
    });

    describe("User Registration", () => {
        test("Should register a new user successfully", async () => {
            const response = await request(app)
               .post("/auth/register")
               .send({
                    name: "Test User",
                    email: uniqueEmail,
                    password_hash: "password123", 
                    role: "client"
               });
            expect(response.status).toBe(201);
        }, 15000);

        test("Should not register a user with an existing email", async () => {
            const response = await request(app)
               .post("/auth/register")
               .send({
                    name: "Duplicate User",
                    email: uniqueEmail, 
                    password_hash: "password123",
                    role: "client"
               });
            expect(response.status).toBe(409); 
        });

        test("Should not register a user without a password", async () => {
            const response = await request(app)
                .post("/auth/register")
                .send({
                    name: "User Without Password",
                    email: "userwithoutpassword@example.com",
                    role: "client"
                });
            expect(response.status).toBe(400);
        });
    });

    describe("User Login", () => {
        test("Should log in an existing user successfully", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: uniqueEmail,
                    password: "password123"
                });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("token");
        });

        test("Should not log in with incorrect password", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: uniqueEmail,
                    password: "wrongpassword"
                });
            expect(response.status).toBe(401);
        });

        test("Should not log in with non-existent email", async () => {
            const response = await request(app)
                .post("/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "password123"
                });
            expect(response.status).toBe(401);
        });
    });
});