# Appointment Booking API

A robust RESTful API for managing medical appointments, built with Node.js, Express, PostgreSQL, and Prisma ORM. This system handles secure user authentication, role-based access control, and provides full interactive documentation via Swagger.

## Features

- **Secure Authentication:** JWT-based login and registration with role-based access control (Clients vs. Providers).
- **Database & ORM:** PostgreSQL managed efficiently through Prisma ORM with an automated schema migration path.
- **Preconfigured Seed Data:** Instant test environment setup with a built-in provider account execution flow.
- **API Documentation:** Interactive UI provided by Swagger/OpenAPI, fully updated and validated for all endpoints.
- **Testing:** Comprehensive integration test suite handling critical lifecycle workflows cleanly using Jest and Supertest.
- **Validation:** Custom input sanitization and an organized, global error-handling middleware architecture.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database & ORM:** PostgreSQL & Prisma ORM
- **Logging:** Winston & Morgan
- **Security:** JSON Web Tokens (JWT) & Bcrypt
- **Testing:** Jest & Supertest

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/JaffDavy/appointment-booking.git](https://github.com/JaffDavy/appointment-booking.git)
   cd appointment-booking-api
   ```

## install dependency

npm install

## enviroument variables

PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/appointment_booking_db?schema=public"
JWT_SECRET=your_super_secret_key

## run the application

npm start

## running test

npm test -- --runInBand
