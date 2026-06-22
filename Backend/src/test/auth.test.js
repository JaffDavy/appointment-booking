import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/User.js";

const uniqueEmail = `user-${Date.now()}@test.com`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await User.deleteMany({ email: uniqueEmail });
  await mongoose.connection.close();
});

describe("Auth System Tests", () => {
  describe("User Registration", () => {
    test("Should register a new user successfully", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: uniqueEmail,
        password: "password123",
        role: "client",
      });
      expect(res.status).toBe(201);
    }, 15000);

    test("Should not register a user with an existing email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Duplicate User",
        email: uniqueEmail,
        password: "password123",
        role: "client",
      });
      expect(res.status).toBe(400);
    });

    test("Should not register a user without a password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "No Password",
        email: "nopassword@test.com",
        role: "client",
      });
      expect(res.status).toBe(400);
    });
  });

  describe("User Login", () => {
    test("Should log in successfully", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: uniqueEmail,
        password: "password123",
      });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    test("Should not log in with wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: uniqueEmail,
        password: "wrongpassword",
      });
      expect(res.status).toBe(400);
    });

    test("Should not log in with non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@test.com",
        password: "password123",
      });
      expect(res.status).toBe(400);
    });
  });
});
