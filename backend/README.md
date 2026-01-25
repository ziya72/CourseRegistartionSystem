# College Course Registration System – Backend

This repository contains the backend for a **College Course Registration & Eligibility System**.

The current implementation focuses on **authentication, identity mapping, and database foundation**. Course registration and eligibility enforcement will be built on top of this.
---
## Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- bcrypt (password hashing)
- Postman (API testing)
---

---

## 🗄️ Database Design (Auth-Relevant Tables)

- `students`
  - Identified by `enrollment_no`
  - Accounts are **pre-created** by admin/bulk upload
- `teachers`
  - Faculty/admin authentication
- `faculty_numbers`
  - Links student to branch, admission year, roll number

---

## 🔐 Authentication Design

### Key Principle
**Signup does NOT create a student.**  
Signup only **activates an existing student account**.

Students already exist in the database before signup.

---

## 🔁 Student Signup (Activation-Based)

### Flow
1. Student enters institutional email
2. Backend extracts enrollment number from email prefix
3. Student record is verified in `students`
4. OTP is generated (placeholder)
5. Student verifies OTP
6. Student sets password
7. Account is activated

No academic rules are checked during authentication.

---

## 🔑 Signin

### Student Signin
- Uses `students` table
- Requires activated account
- JWT issued on success

### Teacher Signin
- Uses `teachers` table
- JWT issued on success

---

## 🔐 OTP Handling (Placeholder)

- OTP is generated server-side
- Printed in backend console
- Stored temporarily in memory
- No email service integration yet

Designed for easy replacement with real email/SMS OTP later.

---

## 📌 Authentication API Endpoints

### 1. Request OTP
**POST** `/auth/request-otp`

Request body:
```json
{
  "email": "gm0001@myamu.ac.in"
}
```

Response:
```json
{
  "message": "OTP sent (mocked)"
}
```

---

### 2. Verify OTP
**POST** `/auth/verify-otp`

Request body:
```json
{
  "email": "gm0001@myamu.ac.in",
  "otp": "123456"
}
```

Response:
```json
{
  "message": "OTP verified"
}
```

---

### 3. Register (Complete Signup)
**POST** `/auth/register`

Request body:
```json
{
  "email": "gm0001@myamu.ac.in",
  "password": "Student@123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Login (Student & Teacher)
**POST** `/auth/login`

Request body:
```json
{
  "email": "gm0001@myamu.ac.in",
  "password": "Student@123",
  "rememberMe": false
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Expiry:**
- `rememberMe: false` → 1 hour
- `rememberMe: true` → 7 days

---

## 🚀 Running the Server

```bash
npm install
npm run dev
```

Server runs at: **http://localhost:8000**

---

## 🗄️ Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed database with dummy data
npx prisma db seed

# View database in browser
npx prisma studio
```

Prisma Studio runs at: **http://localhost:5555**

---

## 🧪 Testing APIs

Use the included `api-tests.rest` file with VS Code REST Client extension, or use Postman/cURL.

---

## .env File Contents

```env
PORT=8000
DATABASE_URL=postgresql://username:password@localhost:5432/registration_db
JWT_SECRET=your_secret_key
```


