## Leave Management System (LMS)

A full‑stack Leave Management System with role-based access for **employees**, **managers**, and **admins**. It supports onboarding employees, applying for leaves, approvals/rejections, and automatic leave balance validation.

---

## Why this project

This project demonstrates an end-to-end product flow:
- **Auth + RBAC** (JWT + role checks)
- **CRUD** for employee management
- **Workflow** for leave requests (apply → review → approve/reject)
- **Business rules** (balance checks, overlap checks, joining-date checks)
- **Relational modeling** with MySQL (employees, departments, leave requests, balances)

---

## Features

- **Authentication**
  - JWT login
  - Protected routes with `Authorization: Bearer <token>`
  - Roles: `employee`, `manager`, `admin`

- **Employee management (admin/manager)**
  - List employees with department mapping
  - Create/update/delete employees (admin-only for mutations)

- **Leave management**
  - Employees can apply for leave with a reason and date range
  - Managers/Admins can approve/reject requests
  - “My Leaves” view for employees

- **Leave balance**
  - Default balance initialization on employee creation
  - Balance deduction rules and validations

---

## Tech stack

- **Frontend**: React (Create React App)
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Auth**: JWT

---

## High-level architecture

- **Frontend (`frontend/`)**
  - React pages/components
  - Calls backend APIs on `http://localhost:3000`

- **Backend (`backend/`)**
  - Express REST API
  - Controllers + models (MySQL queries)
  - Middleware for JWT verification and role checks

- **Database**
  - Schema + seed logic via `backend/scripts/initDB.js`
  - SQL file available at `backend/database.sql`

---

## Quick start (local)

### Prerequisites

- Node.js **18+**
- MySQL **8+**

### 1) Configure environment variables

Create a `.env` file at project root (`LMS/.env`):

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lms
JWT_SECRET=your_jwt_secret
```

### 2) Start the backend

```bash
cd backend
npm install
npm run init-db
npm run dev
```

Backend runs on `http://localhost:3000`.

### 3) Start the frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3001` (CRA default; may vary if the port is in use).

---

## Demo accounts

You can use these accounts (as shown on the login screen):
- **Admin**: `admin@company.com` / `password`
- **Employee**: `test@company.com` / `password123`

If your local DB is fresh and demo accounts are not present, run `npm run init-db` in `backend/` again (or create users via admin UI / SQL inserts).

---

## Key API endpoints (summary)

Base URL: `http://localhost:3000`

### Auth

- **POST** `/api/auth/login`
  - Body:

```json
{ "email": "admin@company.com", "password": "password" }
```

  - Response (example):

```json
{
  "token": "<jwt>",
  "employee": {
    "id": 1,
    "name": "Admin",
    "email": "admin@company.com",
    "role": "admin",
    "department_id": 1,
    "department_name": "Engineering",
    "joining_date": "2025-01-01"
  }
}
```

- **GET** `/api/auth/profile` (auth)
  - Returns current employee profile (without password)

### Employees

- **GET** `/api/employees` (auth, manager/admin)
- **GET** `/api/employees/:id` (auth)
- **POST** `/api/employees` (auth, admin)
- **PUT** `/api/employees/:id` (auth, admin)
- **DELETE** `/api/employees/:id` (auth, admin)
- **GET** `/api/employees/:id/balance` (auth)

### Leaves

- **POST** `/api/leaves/apply` (auth)
- **GET** `/api/leaves` (auth, manager/admin)
- **GET** `/api/leaves/my-leaves` (auth)
- **PATCH** `/api/leaves/:id/status` (auth, manager/admin)

### Health

- **GET** `/health`

---

## Business rules & validations (highlights)

- Joining date is respected for leave applications
- Prevents invalid date ranges (end date before start date)
- Prevents past-dated leave applications (where applicable)
- Prevents insufficient balance
- Prevents overlaps with already approved leaves
- Prevents double-processing of approved/rejected requests

---

## Project documents

- **HLD**: see `docs/HLD.md`

---

## Roadmap ideas

- Leave types (sick/casual/paid) + accrual policies
- Holiday calendar support
- Notifications (Email/Slack)
- Audit trail with approver comments
- Pagination/filtering for admin lists
- Docker + CI/CD

