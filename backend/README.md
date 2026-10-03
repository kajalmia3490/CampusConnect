# CampusConnect Backend API

## Overview
Node.js + Express.js backend for CampusConnect mobile application.

## Tech Stack
- **Runtime:** Node.js (v26+)
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JsonWebToken)
- **File Upload:** Multer + Cloudinary
- **Testing:** Jest + Supertest

## Features
- ✅ User registration & login
- ✅ JWT authentication & role-based authorization
- ✅ Protected routes
- ✅ Error handling
- ✅ Input validation
- ✅ MongoDB connection with error handling

## Project Structure
```
backend/
├── src/
│   ├── config/          # Database, Cloudinary, Firebase config
│   ├── controllers/     # Route controllers (authController.js)
│   ├── middleware/       # Auth middleware (protect, authorize)
│   ├── models/          # Mongoose models (User.js)
│   ├── routes/          # API routes (auth.js)
│   └── utils/           # Helpers (errorHandler, response, validators)
├── tests/               # Unit & integration tests
├── server.js            # Entry point
├── .env.example         # Environment variables template
└── package.json
```

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLOUDINARY_URL` - Cloudinary credentials (for file uploads)

### 3. Start development server
```bash
npm run dev
```

### 4. Start production server
```bash
npm start
```

### 5. Run tests
```bash
npm test
```

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |
| POST | `/api/auth/logout` | Private | Logout user |

### Health Check
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/health` | Public | Check server status |

## User Roles
- `student` - Regular student
- `teacher` - Can create courses, assignments, materials
- `staff` - Can manage complaints, service requests
- `admin` - Full system access

## Error Handling
All errors return JSON with status and message:
```json
{
  "status": "fail",
  "message": "Error description"
}
```

## License
MIT

## Team
- **Backend:** Nirob Sarkar (20244203017)
- **Frontend:** Abdullah Al Adnan (20244203038)
- **Database:** Kajal Mia (20244203028)
- **UI/UX:** Khadiza Akter Lima (20244203046)
- **QA:** Subir Das (20244203048)
