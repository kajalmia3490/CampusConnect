# CampusConnect — Backend Development Plan

## Project Overview
- **Project:** CampusConnect — A Mobile-Based University Student & Campus Services Platform
- **Team:** Nirob Sarkar (Backend), Kajal Mia (Database), Abdullah Al Adnan (Frontend), Khadiza Akter Lima (UI/UX), Subir Das (QA)
- **Tech Stack:** Node.js + Express.js (Backend), MongoDB + Mongoose (Database), JWT Authentication
- **Timeline:** 8 Weeks (SDP-3)
- **Your Role:** Backend Developer (Node.js + Express API)

---

## Branch Strategy

| Branch | Purpose | Owner |
|--------|---------|-------|
| `main` | Protected — production ready | All (merged via PR) |
| `dev` | Integration branch | All |
| `frontend/dev` | Flutter frontend | Abdullah |
| **`backend/dev`** | **Node.js + Express API** | **You (Nirob)** |

---

## Backend Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── cloudinary.js
│   │   └── firebase.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── noticeController.js
│   │   ├── routineController.js
│   │   ├── courseController.js
│   │   ├── materialController.js
│   │   ├── assignmentController.js
│   │   ├── eventController.js
│   │   ├── complaintController.js
│   │   └── lostFoundController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   ├── validate.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Notice.js
│   │   ├── Routine.js
│   │   ├── Material.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   ├── Event.js
│   │   ├── Complaint.js
│   │   └── LostFound.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── notices.js
│   │   ├── routines.js
│   │   ├── courses.js
│   │   ├── materials.js
│   │   ├── assignments.js
│   │   ├── events.js
│   │   ├── complaints.js
│   │   └── lostFound.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   └── response.js
│   └── app.js
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## Week-by-Week Backend Development Plan

### Week 1: Project Setup & Database Schema
**Goal:** Initialize Node.js project, MongoDB connection, User model & Auth

- [ ] Initialize Node.js project (`npm init`)
- [ ] Install dependencies:
  ```bash
  npm install express mongoose dotenv cors helmet morgan bcryptjs jsonwebtoken cookie-parser multer cloudinary
  npm install -D nodemon eslint prettier jest supertest
  ```
- [ ] Project folder structure setup
- [ ] Database connection (MongoDB + Mongoose)
- [ ] User Model:
  ```javascript
  {
    name, email, password (hashed), role (student/teacher/admin/staff),
    department, semester, profileImage, createdAt, updatedAt
  }
  ```
- [ ] Auth Controller: register, login, logout, getMe
- [ ] Auth Middleware: JWT verify, role-based access
- [ ] Auth Routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- [ ] Input validation (email, password strength)
- [ ] Password hashing (bcryptjs, salt rounds: 12)
- [ ] JWT token generation & refresh token logic
- [ ] .env configuration (PORT, MONGO_URI, JWT_SECRET, CLOUDINARY_URL)
- [ ] Error handling middleware
- [ ] Basic tests for auth endpoints

**Deliverables:** Working auth system (register/login/logout/me), MongoDB connected

---

### Week 2: Notice & Routine APIs
**Goal:** Notice CRUD, Class Routine CRUD

- [ ] Notice Model:
  ```javascript
  {
    title, content, priority (low/medium/high), 
    department, semester, attachments[], 
    postedBy (ref: User), expiresAt, isActive
  }
  ```
- [ ] Notice Controller:
  - Create notice (admin/teacher only)
  - Get all notices (filter by department/semester/priority)
  - Get single notice
  - Update notice
  - Delete notice
  - Search notices
- [ ] Routine Model:
  ```javascript
  {
    course (ref: Course), day (Mon-Sun),
    startTime, endTime, room, teacher (ref: User)
  }
  ```
- [ ] Routine Controller:
  - Get weekly routine (by department/semester)
  - Get daily routine
  - Create/update/delete routine (admin/teacher only)
- [ ] Routes: `/api/notices`, `/api/notices/:id`, `/api/routines`
- [ ] Pagination for notices list
- [ ] File upload for notice attachments (Multer + Cloudinary)

**Deliverables:** Full notice CRUD, routine CRUD, file upload

---

### Week 3: Course & Material APIs
**Goal:** Course management, learning materials

- [ ] Course Model:
  ```javascript
  {
    code, name, description, department, 
    teacher (ref: User), credits, semester,
    schedule[], materials[]
  }
  ```
- [ ] Course Controller:
  - Get all courses (filter by department/semester)
  - Get single course with details
  - Enroll student in course
  - Create/update/delete course (admin/teacher only)
- [ ] Material Model:
  ```javascript
  {
    title, description, fileUrl, fileType,
    course (ref: Course), uploadedBy (ref: User),
    createdAt
  }
  ```
- [ ] Material Controller:
  - Upload material (teacher only)
  - Get materials by course
  - Download material
  - Delete material (uploader/teacher only)
- [ ] Routes: `/api/courses`, `/api/courses/:id/materials`
- [ ] File upload validation (type: pdf/png/jpg, size limit)

**Deliverables:** Course management, material upload/download

---

### Week 4: Assignment APIs
**Goal:** Assignment creation, submission, grading

- [ ] Assignment Model:
  ```javascript
  {
    title, description, dueDate, attachments[],
    course (ref: Course), createdBy (ref: User),
    maxMarks, instructions
  }
  ```
- [ ] Submission Model:
  ```javascript
  {
    assignment (ref: Assignment), student (ref: User),
    fileUrl, submittedAt, marks, feedback, status
  }
  ```
- [ ] Assignment Controller:
  - Create assignment (teacher only)
  - Get assignments by course
  - Submit assignment (student)
  - Grade submission (teacher only)
  - Get submissions for an assignment
- [ ] Routes: `/api/assignments`, `/api/assignments/:id/submit`
- [ ] Due date validation
- [ ] Late submission handling

**Deliverables:** Full assignment workflow (create, submit, grade)

---

### Week 5: Events & Complaints APIs
**Goal:** Event management, complaint submission & tracking

- [ ] Event Model:
  ```javascript
  {
    title, description, date, location,
    imageUrl, maxCapacity, registeredUsers[],
    createdBy (ref: User), status
  }
  ```
- [ ] Complaint Model:
  ```javascript
  {
    title, description, category,
    status (pending/in-progress/resolved),
    images[], user (ref: User),
    createdAt, updatedAt, timeline[]
  }
  ```
- [ ] Event Controller:
  - Get all events (filter by date/department)
  - Register for event
  - Cancel registration
  - Create event (admin/teacher only)
- [ ] Complaint Controller:
  - Submit complaint
  - Get user's complaints
  - Update complaint status (staff/admin only)
  - Add timeline entry
- [ ] Routes: `/api/events`, `/api/events/:id/register`, `/api/complaints`
- [ ] Event capacity check

**Deliverables:** Events with registration, complaints with status tracking

---

### Week 6: Lost & Found & Notification APIs
**Goal:** Lost & Found, Push notification setup

- [ ] LostFound Model:
  ```javascript
  {
    title, description, category (lost/found),
    location, imageUrl, contactInfo,
    user (ref: User), status (active/resolved),
    createdAt
  }
  ```
- [ ] LostFound Controller:
  - Post item (lost/found)
  - Get all items (filter by category)
  - Update status
  - Delete item
- [ ] Notification Setup:
  - Firebase Cloud Messaging (FCM) integration
  - Notification Model:
    ```javascript
    {
      title, body, type,
      recipient (ref: User),
      data {}, isRead, createdAt
    }
    ```
  - Send notification on: new notice, complaint status change, event registration
- [ ] Routes: `/api/lost-found`, `/api/notifications`

**Deliverables:** Lost & Found, Push notifications

---

### Week 7: Admin APIs & Testing
**Goal:** Admin management, comprehensive testing

- [ ] Admin Controller:
  - Get all users (filter by role/department)
  - Update user role
  - Delete user
  - Manage departments
  - System stats/dashboard data
- [ ] Routes: `/api/admin/*`
- [ ] Testing:
  - Unit tests for controllers
  - Integration tests for API endpoints
  - Error case testing
  - Performance testing
- [ ] QA coordination with Subir

**Deliverables:** Admin panel API, tested endpoints

---

### Week 8: Final Polish & Documentation
**Goal:** Security hardening, documentation, deployment prep

- [ ] Security hardening:
  - Rate limiting (express-rate-limit)
  - CORS configuration
  - Input sanitization (xss-clean, express-mongo-sanitize)
  - Helmet.js headers
  - SQL/NoSQL injection protection
- [ ] Write API documentation (Swagger/Postman collection)
- [ ] Write README with setup instructions
- [ ] Environment variables documentation
- [ ] Error handling & logging (Winston)
- [ ] Merge `backend/dev` → `dev` → `main` (via PR)

**Deliverables:** Production-ready backend API, documentation

---

## API Endpoint Summary (For Frontend Coordination)

### Authentication
```
POST   /api/auth/register        Register new user
POST   /api/auth/login           Login with email/password
GET    /api/auth/me              Get current user profile
POST   /api/auth/logout          Logout
POST   /api/auth/refresh         Refresh JWT token
```

### Notices
```
GET    /api/notices              List notices (filter: department, semester, priority, search)
GET    /api/notices/:id          Single notice
POST   /api/notices              Create notice (admin/teacher)
PUT    /api/notices/:id          Update notice (admin/teacher)
DELETE /api/notices/:id          Delete notice (admin)
```

### Routines
```
GET    /api/routines             Get weekly routine (filter: department, semester)
GET    /api/routines/daily       Get daily routine
POST   /api/routines             Create routine (admin/teacher)
PUT    /api/routines/:id         Update routine (admin/teacher)
DELETE /api/routines/:id         Delete routine (admin)
```

### Courses
```
GET    /api/courses              List courses (filter: department, semester)
GET    /api/courses/:id          Course details
POST   /api/courses              Create course (admin/teacher)
PUT    /api/courses/:id          Update course (admin/teacher)
DELETE /api/courses/:id          Delete course (admin)
POST   /api/courses/:id/enroll   Enroll in course (student)
```

### Materials
```
GET    /api/courses/:id/materials    List materials
POST   /api/courses/:id/materials    Upload material (teacher)
GET    /api/materials/:id/download   Download material
DELETE /api/materials/:id            Delete material (teacher/uploader)
```

### Assignments
```
GET    /api/assignments              List assignments (filter: course, status)
GET    /api/assignments/:id          Assignment detail
POST   /api/assignments              Create assignment (teacher)
POST   /api/assignments/:id/submit   Submit assignment (student)
GET    /api/assignments/:id/submissions  List submissions (teacher)
PUT    /api/submissions/:id/grade    Grade submission (teacher)
```

### Events
```
GET    /api/events               List events (filter: date, department)
GET    /api/events/:id           Event detail
POST   /api/events               Create event (admin/teacher)
POST   /api/events/:id/register  Register for event
DELETE /api/events/:id/register  Cancel registration
```

### Complaints
```
POST   /api/complaints               Submit complaint
GET    /api/complaints               List user's complaints
GET    /api/complaints/:id           Complaint detail with timeline
PUT    /api/complaints/:id/status    Update status (staff/admin)
```

### Lost & Found
```
GET    /api/lost-found           List items (filter: category)
POST   /api/lost-found           Post item
PUT    /api/lost-found/:id       Update status
DELETE /api/lost-found/:id       Delete item
```

### Admin
```
GET    /api/admin/users              List all users
PUT    /api/admin/users/:id          Update user
DELETE /api/admin/users/:id          Delete user
GET    /api/admin/stats              System statistics
```

### Notifications
```
GET    /api/notifications            List user notifications
PUT    /api/notifications/:id/read   Mark as read
```

---

## Database Collections Overview

| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `users` | User accounts | name, email, password, role, department, semester |
| `departments` | Department info | name, code, faculty |
| `courses` | Course info | code, name, department, teacher, credits, semester |
| `enrollments` | Student-course mapping | user, course, enrolledAt |
| `notices` | Announcements | title, content, priority, department, postedBy |
| `routines` | Class schedule | course, day, startTime, endTime, room, teacher |
| `materials` | Learning resources | title, fileUrl, course, uploadedBy |
| `assignments` | Assignment info | title, description, dueDate, course, createdBy |
| `submissions` | Student submissions | assignment, student, fileUrl, marks, feedback |
| `events` | Campus events | title, description, date, location, maxCapacity |
| `complaints` | Issue tracking | title, description, category, status, user, timeline |
| `lostFound` | Lost & found items | title, description, category, location, status |
| `notifications` | Push notifications | title, body, type, recipient, isRead |

---

## Security Implementation

```javascript
// Password hashing
const hashedPassword = await bcryptjs.hash(password, 12);

// JWT token
const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
  expiresIn: '7d'
});

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Role-based access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };
};

// Usage: router.post('/', auth, authorize('admin', 'teacher'), controller.create);
```

---

## Error Handling Pattern

```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Global error handler
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err
    });
  }

  // Production
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Unknown errors
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
};
```

---

## Environment Variables (.env)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/campusconnect
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
FIREBASE_CREDENTIALS_PATH=./firebase/credentials.json
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## Coordination Points (with Frontend)

| Week | Coordination | With |
|------|-------------|------|
| Week 1 | API Contract (endpoints, request/response) | Abdullah (Frontend) |
| Week 2 | Notice & Routine data format | Abdullah |
| Week 3 | Course & Material API spec | Abdullah, Kajal |
| Week 4 | Assignment submission format | Abdullah |
| Week 5 | Event registration & complaint flow | Abdullah |
| Week 6 | Notification payload structure | Abdullah |
| Week 7 | Integration testing | Subir (QA), Abdullah |
| Week 8 | Final API docs & demo | All |

---

## Deliverables (Your Part)

1. ✅ Node.js + Express server with full folder structure
2. ✅ All REST API endpoints (auth, notices, routines, courses, materials, assignments, events, complaints, lost & found, admin, notifications)
3. ✅ MongoDB models with proper relationships
4. ✅ JWT authentication & role-based authorization
5. ✅ File upload handling (Multer + Cloudinary)
6. ✅ Input validation & error handling
7. ✅ Security middleware (Helmet, CORS, rate limiting)
8. ✅ Firebase Cloud Messaging integration
9. ✅ Unit & integration tests
10. ✅ API documentation (Swagger/Postman)
11. ✅ README with setup instructions
12. ✅ Final presentation

---

## Immediate Next Steps (This Week)

1. 🔄 Initialize Node.js project
2. 🔄 Setup folder structure
3. 🔄 Install dependencies
4. 🔄 Create User model & Auth system
5. 🔄 Push initial backend structure to `backend/dev`
6. 🔄 Share API contract with Abdullah (Frontend)

---

## Deployment Prep (Week 8)

- Dockerfile for containerization
- Environment configuration for production
- Database migration script
- SSL/HTTPS setup
- PM2 process manager
- Nginx reverse proxy config

---

*Last Updated: October 2026*
*Author: Nirob Sarkar (20244203017) — Backend Developer*
