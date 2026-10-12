# CampusConnect – A Mobile-Based University Student & Campus Services Platform

> **BUBT SDP-03 System Development Project**  
> Developed for **Bangladesh University of Business and Technology (BUBT)**  
> **Team Members:**  
> 1. Nirob Sarkar (ID: 20244203017)  
> 2. Abdullah Al Adnan (ID: 20244203038)  
> 3. Khadiza Akter Lima (ID: 20244203046)  
> 4. Subir Das (ID: 20244203048)  
> 5. Kajal Mia (ID: 20244203028)  

---

## 🚀 Tech Stack Overview

- **Mobile Frontend**: **React Native (Expo SDK 57)** with cross-platform support for **Android / iOS** and **React Native Web**.
- **Backend API**: **Node.js** with **Express.js**, REST API architecture, and JWT role-based authentication.
- **Database**: **Microsoft SQL Server (MS SQL Server)**, verified and running on instance `SERVER\KAJAL` under database `CampusConnectDB`.

---

run command: 
kajal@SERVER MINGW64 /d/Development/University Projects/SDP 03/CampusConnect
$ cd "d:\Development\University Projects\SDP 03\CampusConnect\mobile"
npx expo start

## 📁 Repository Structure

```
CampusConnect/
├── backend/                         # Node.js + Express + MS SQL Server API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # Connection pool config for MS SQL Server
│   │   │   └── jwt.js               # JWT secret and token expiration
│   │   ├── database/
│   │   │   ├── schema.sql           # Complete MS SQL Server table definitions
│   │   │   └── seedData.js          # Realistic BUBT seed dataset
│   │   ├── middleware/
│   │   │   ├── auth.js              # Token authentication & user verification
│   │   │   └── roleCheck.js         # Role-based authorization (RBAC)
│   │   ├── controllers/             # Express controllers for all features
│   │   ├── routes/                  # Express API route modules
│   │   └── server.js                # Express app entry point
│   ├── .env                         # Server environment configuration
│   └── package.json
│
├── mobile/                          # React Native (Expo) Mobile Application
│   ├── src/
│   │   ├── components/              # Header, BottomNav, StatusBadge, Timeline, etc.
│   │   ├── context/                 # AuthContext & quick-login helper
│   │   ├── screens/                 # Dashboard, Routine, Courses, Materials,
│   │   │                            # Assignments, Complaints, Lost&Found, Admin
│   │   ├── services/api.js          # REST client communicating with Backend
│   │   └── theme/theme.js           # BUBT brand colors, fonts, and elevation tokens
│   ├── App.js                       # Primary React Native app container
│   ├── package.json
│   └── dist/                        # Optimized production web bundle
│
└── README.md
```

---

## 🔑 Demo User Accounts (Pre-Seeded)

All demo accounts are configured with the password: **`Password123!`**

| Role | Name | ID / Identifier | Email | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Kajal Mia | `20244203028` | `kajal@bubt.edu.bd` | Routine, courses, materials, submit assignments, file complaints, Lost & Found |
| **Student** | Nirob Sarkar | `20244203017` | `nirob@bubt.edu.bd` | Student academic & campus services |
| **Teacher** | Dr. Md. Shamsul Haque | `T-1001` | `shamsul@bubt.edu.bd` | Upload materials, create assignments, grade student submissions |
| **Staff** | Hasan Ali | `S-2001` | `staff.hasan@bubt.edu.bd` | Maintenance tickets, status updates, timeline remarks |
| **Administrator** | Chief Administrator | `ADMIN-001` | `admin@bubt.edu.bd` | System statistics, user directory, departments, campus notices |

*(Tip: In the mobile app, navigate to the **Profile** tab to use the **1-Click Role Switcher** to test all 4 perspectives instantly without manual logout).*

---

## 🗄️ Database Tables (MS SQL Server)

The database schema includes 15 interconnected relational tables:
1. `Departments` (department_code, department_name)
2. `Users` (university_id, full_name, email, password_hash, role, department_id, semester, section, is_active)
3. `Courses` (course_code, course_title, credits, department_id, semester, teacher_id)
4. `CourseEnrollments` (course_id, student_id)
5. `Notices` (title, content, category, priority, department_id, author_id, expires_at)
6. `ClassRoutines` (course_id, teacher_id, department_id, semester, section, day_of_week, start_time, end_time, room_number)
7. `LearningMaterials` (course_id, title, topic, file_url, file_type, uploaded_by)
8. `Assignments` (course_id, title, description, due_date, total_marks, teacher_id)
9. `AssignmentSubmissions` (assignment_id, student_id, submission_text, file_url, status, marks_obtained, feedback)
10. `CampusEvents` (title, description, organizer, event_date, venue, capacity, status)
11. `EventRegistrations` (event_id, user_id, registered_at)
12. `Complaints` (title, category, priority, description, location, status, user_id, assigned_staff_id)
13. `ComplaintTimelines` (complaint_id, status, remarks, updated_by, created_at)
14. `LostAndFound` (type, title, category, description, location, item_date, contact_info, status, user_id)
15. `Notifications` (user_id, title, message, type, is_read, reference_id)

---

## 🏃 Running the Application

### 1. Backend Server (Node.js & MS SQL Server)
```powershell
cd "d:\Development\University Projects\SDP 03\CampusConnect\backend"
node src/server.js
```
- API Health Check: `http://localhost:5000/api/health`

### 2. Mobile App (React Native Web)
```powershell
cd "d:\Development\University Projects\SDP 03\CampusConnect\mobile"
npx expo start --web
```
Or view the bundled build on port 3000:
- URL: `http://localhost:3000`

### 3. Mobile App on Android Emulator / Physical Device
```powershell
cd "d:\Development\University Projects\SDP 03\CampusConnect\mobile"
npx expo start --android
```
Scan the QR code with **Expo Go** on your Android device connected to the same Wi-Fi network.
