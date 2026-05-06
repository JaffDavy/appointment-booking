# Appointment Booking API

A robust RESTful API for managing medical appointments, built with Node.js, Express, and PostgreSQL. This system handles secure user authentication and provides full documentation via Swagger.

## Features
* **Secure Authentication:** JWT-based login and registration.
* **Password Hashing:** Uses `bcrypt` for secure storage.
* **Database:** PostgreSQL with a optimized connection pool.
* **API Documentation:** Interactive UI provided by Swagger/OpenAPI.
* **Testing:** Comprehensive test suite using Jest and Supertest.
* **Validation:** Input validation and custom error handling.

---

## 🛠️ Tech Stack
* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Database:** PostgreSQL
* **Logging:** Winston & Morgan
* **Security:** JSON Web Tokens (JWT) & Bcrypt
* **Testing:** Jest & Supertest

---

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://git@github.com:JaffDavy/appointment-booking.git]
   cd appointment-booking-api

2. **Install dependencies:**

  npm install

3. **Environment Variables:**

  Create a .env file in the root directory and add:

  Code snippet
  PORT=3000
  DB_USER=your_user
  DB_HOST=localhost
  DB_NAME=appointment_booking_db
  DB_PASSWORD=your_password
  DB_PORT=5432
  JWT_SECRET=your_super_secret_key

4. **Run the application:**

  npm start

 **API Documentation**

  Once the server is running, you can explore the interactive API documentation at:
  👉 http://localhost:3000/api-docs

 **Running Tests**
  The project uses Jest to ensure reliability. The test suite covers the full registration and login lifecycle.

  npm test