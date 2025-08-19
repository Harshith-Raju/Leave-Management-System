# Leave Management System

A mini leave management system for startups with employee management, leave application, and approval workflows.

## Features

1. Add and manage employees
2. Apply for leave with validation
3. Approve/reject leave requests
4. Track leave balances
5. Handle edge cases (overlapping leaves, insufficient balance, etc.)

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL

## Setup Instructions

1. **Database Setup**:
   - Create MySQL database using the schema in `database/schema.sql`
   - Update database credentials in `backend/config/db.js`

2. **Backend Setup**:
   - Navigate to `backend` folder
   - Run `npm install`
   - Start server with `node server.js`

3. **Frontend Setup**:
   - Open `frontend/index.html` in browser
   - Make sure backend is running (default: http://localhost:3000)

## API Endpoints

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee
- `POST /api/leaves` - Apply for leave
- `PUT /api/leaves/:id` - Approve/reject leave
- `GET /api/leaves/balance/:employeeId` - Get leave balance
- `GET /api/leaves` - Get pending leaves (for approval)

## Edge Cases Handled

1. Leave before joining date
2. Insufficient leave balance
3. Overlapping leaves
4. Invalid date ranges
5. Non-existent employee
6. Duplicate leave requests
7. Negative leave balance
8. Backdated leave applications

## Potential Improvements

1. Add user authentication
2. Implement different leave types
3. Add leave accrual system
4. Email notifications
5. Dashboard with analytics
6. Role-based access control






"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBjb21wYW55LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1NTYwODYzNywiZXhwIjoxNzU2MjEzNDM3fQ.4tNLvOhzSJu4bH3Va5cYk2TXZk9rI00wq28yPi-BJeA"



 2. Login and get token
POST /auth/login

# 3. Test employee endpoints
GET /employees
POST /employees
GET /employees/1
GET /employees/1/balance

# 4. Test leave endpoints
POST /leaves/apply
GET /leaves/my-leaves
GET /leaves
PATCH /leaves/1/status

# 5. Test edge cases
POST /leaves/apply (with invalid data)

# 6. Health check
GET /health