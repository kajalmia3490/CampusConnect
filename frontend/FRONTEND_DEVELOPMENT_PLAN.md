# CampusConnect — Frontend Development Plan

## Project Overview
- **Project:** CampusConnect — A Mobile-Based University Student & Campus Services Platform
- **Team:** Nirob Sarkar (Backend), Kajal Mia (Database), Abdullah Al Adnan (Frontend), Khadiza Akter Lima (UI/UX), Subir Das (QA)
- **Tech Stack:** Flutter / Dart (Frontend), Node.js + Express.js (Backend), MongoDB + Mongoose (Database)
- **Timeline:** 8 Weeks (SDP-3)
- **Your Role:** Frontend Developer (Flutter Mobile App)

---

## Branch Strategy

| Branch | Purpose | Owner |
|--------|---------|-------|
| `main` | Protected — production ready | All (merged via PR) |
| `dev` | Integration branch | All |
| `frontend/dev` | Flutter frontend development | **You (Abdullah)** |
| `backend/dev` | Node.js + Express API | Nirob |

---

## Flutter Project Structure (Clean Architecture + Feature-First)

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   │   ├── app_colors.dart
│   │   ├── app_text_styles.dart
│   │   ├── app_sizes.dart
│   │   └── app_icons.dart
│   ├── utils/
│   │   ├── validators.dart
│   │   ├── formatters.dart
│   │   └── helpers.dart
│   ├── services/
│   │   ├── api_service.dart
│   │   ├── auth_service.dart
│   │   ├── storage_service.dart
│   │   └── notification_service.dart
│   ├── routes/
│   │   ├── app_routes.dart
│   │   └── route_generator.dart
│   └── theme/
│       ├── app_theme.dart
│       └── app_colors.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── user_model.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   └── usecases/
│   │   │       ├── login.dart
│   │   │       ├── register.dart
│   │   │       └── check_auth.dart
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── auth_bloc.dart
│   │       │   └── auth_event.dart
│   │       ├── pages/
│   │       │   ├── login_page.dart
│   │       │   ├── register_page.dart
│   │       │   └── splash_page.dart
│   │       └── widgets/
│   │           └── auth_text_field.dart
│   ├── home/
│   │   ├── presentation/
│   │   │   ├── pages/
│   │   │   │   └── home_dashboard.dart
│   │   │   └── widgets/
│   │   │       ├── today_classes_card.dart
│   │   │       ├── latest_notices_card.dart
│   │   │       └── upcoming_assignments_card.dart
│   │   └── data/
│   │       └── models/
│   │           └── dashboard_model.dart
│   ├── notices/
│   │   ├── data/
│   │   │   ├── models/notice_model.dart
│   │   │   └── repositories/notice_repository.dart
│   │   └── presentation/
│   │       ├── pages/notice_list_page.dart
│   │       └── widgets/notice_card.dart
│   ├── routine/
│   │   └── presentation/
│   │       └── pages/routine_page.dart
│   ├── courses/
│   │   └── presentation/
│   │       └── pages/course_detail_page.dart
│   ├── materials/
│   │   └── presentation/
│   │       └── pages/materials_page.dart
│   ├── assignments/
│   │   └── presentation/
│   │       └── pages/assignment_list_page.dart
│   ├── events/
│   │   └── presentation/
│   │       └── pages/events_page.dart
│   ├── complaints/
│   │   └── presentation/
│   │       └── pages/complaints_page.dart
│   ├── lost_found/
│   │   └── presentation/
│   │       └── pages/lost_found_page.dart
│   └── profile/
│       └── presentation/
│           └── pages/profile_page.dart
├── shared/
│   ├── widgets/
│   │   ├── custom_button.dart
│   │   ├── custom_app_bar.dart
│   │   ├── loading_widget.dart
│   │   └── error_widget.dart
│   └── theme/
│       └── app_theme.dart
└── injection_container.dart  # Riverpod providers
```

---

## Week-by-Week Development Plan

### Week 1: Project Setup & Authentication
**Goal:** Flutter project initialized, routing, login/register screens

- [ ] `flutter create .` — Initialize Flutter project
- [ ] Add dependencies to `pubspec.yaml`:
  ```yaml
  dependencies:
    flutter:
      sdk: flutter
    flutter_riverpod: ^2.4.0
    riverpod_annotation: ^2.3.0
    http: ^1.2.0
    shared_preferences: ^2.2.0
    firebase_core: ^2.24.0
    firebase_messaging: ^14.7.0
    flutter_local_notifications: ^16.3.0
    intl: ^0.19.0
    flutter_svg: ^2.0.9
    cached_network_image: ^3.3.0
    validators: ^3.0.0
    equatable: ^2.0.5
    json_annotation: ^4.8.1
    dio: ^5.4.0
  dev_dependencies:
    build_runner: ^2.4.0
    riverpod_generator: ^2.3.0
    json_serializable: ^6.7.0
    mockito: ^5.4.0
    flutter_test:
      sdk: flutter
  ```
- [ ] Setup project folder structure (see above)
- [ ] Splash screen → Login → Register flow
- [ ] Auth API integration (login, register, token storage)
- [ ] Riverpod state management setup
- [ ] Basic routing (go_router or auto_route)

**Deliverables:** Working login/register flow, token persistence, splash screen

---

### Week 2: Home Dashboard & Navigation
**Goal:** Bottom navigation, home dashboard with today's classes, notices, assignments

- [ ] Bottom Navigation Bar (Home, Services, Notifications, Profile)
- [ ] Home Dashboard screen:
  - Today's classes widget
  - Latest notices widget
  - Upcoming assignments widget
  - Quick stats (courses count, pending assignments)
- [ ] API integration for dashboard data
- [ ] Loading states & error handling
- [ ] Pull-to-refresh functionality

**Deliverables:** Functional home dashboard with real data from backend

---

### Week 3: Notice Management & Class Routine
**Goal:** Notices list, filtering, search; class routine view

- [ ] Notice List page:
  - List of notices with title, date, priority
  - Filter by department/semester
  - Search functionality
  - Notice detail page (with attachments)
- [ ] Class Routine page:
  - Weekly view (Mon-Sun)
  - Daily schedule with course, teacher, room, time
  - Tap to view details
- [ ] API integration for notices & routines
- [ ] Offline caching (Hive or SharedPreferences)

**Deliverables:** Notice browsing, routine viewing, search/filter

---

### Week 4: Course Management & Learning Materials
**Goal:** Course list, materials upload/download

- [ ] Course List page:
  - List of enrolled courses
  - Course details (teacher, credits, schedule)
- [ ] Learning Materials page:
  - List of materials per course
  - Download/view PDFs, images
  - Teacher-only upload functionality
- [ ] API integration for courses & materials
- [ ] File download & cache management

**Deliverables:** Course browsing, material viewing/download

---

### Week 5: Assignment Management
**Goal:** Assignment creation, submission, feedback

- [ ] Assignment List page:
  - List of assignments with due dates
  - Status (pending, submitted, graded)
- [ ] Assignment Detail page:
  - Description, instructions, attachments
  - Submission form (text + file upload)
- [ ] Teacher view:
  - Create assignment
  - View submissions
  - Grade & feedback
- [ ] API integration for assignments

**Deliverables:** Full assignment workflow (create, submit, grade)

---

### Week 6: Events, Complaints & Lost & Found
**Goal:** Event registration, complaint tracking, lost & found

- [ ] Events page:
  - List of upcoming events
  - Event detail (date, location, capacity, registration)
  - Registration flow
- [ ] Complaints page:
  - Submit complaint (title, description, category, image)
  - Complaint list with status timeline
  - Status tracking (pending → in progress → resolved)
- [ ] Lost & Found page:
  - Post lost/found items
  - Browse items
  - Contact owner
- [ ] API integration for all three features

**Deliverables:** Events, complaints, lost & found fully functional

---

### Week 7: Profile, Admin & Testing
**Goal:** User profile, admin functions, QA testing

- [ ] Profile page:
  - View/edit profile info
  - Academic info (department, semester)
  - Settings (notifications, theme)
- [ ] Admin functions (role-based):
  - Manage users
  - Manage departments, courses
  - Manage notices, routines
- [ ] QA Testing (with Subir):
  - Unit tests for key logic
  - Widget tests for UI components
  - Integration tests for API calls
  - Bug fixes

**Deliverables:** Profile, admin panel, tested app

---

### Week 8: Final Polish & Documentation
**Goal:** Final fixes, documentation, deployment prep

- [ ] UI polishing & consistency
- [ ] Performance optimization
- [ ] Error handling & edge cases
- [ ] Write user documentation
- [ ] Final presentation prep
- [ ] Merge `frontend/dev` → `dev` → `main` (via PR)

**Deliverables:** Production-ready app, documentation, presentation

---

## API Integration Points (Coordinate with Nirob)

| Feature | Endpoint | Method | Description |
|---------|----------|--------|-------------|
| Auth | `/api/auth/login` | POST | Login with email/password |
| Auth | `/api/auth/register` | POST | Register new user |
| Auth | `/api/auth/me` | GET | Get current user profile |
| Notices | `/api/notices` | GET | List notices (filterable) |
| Notices | `/api/notices/:id` | GET | Single notice detail |
| Routines | `/api/routines` | GET | Class routine (weekly) |
| Courses | `/api/courses` | GET | List courses |
| Materials | `/api/courses/:id/materials` | GET | Course materials |
| Assignments | `/api/assignments` | GET | List assignments |
| Assignments | `/api/assignments/:id/submit` | POST | Submit assignment |
| Events | `/api/events` | GET | List events |
| Events | `/api/events/:id/register` | POST | Register for event |
| Complaints | `/api/complaints` | POST | Submit complaint |
| Complaints | `/api/complaints` | GET | List user complaints |
| Lost & Found | `/api/lost-found` | GET/POST | Browse/post items |

---

## UI/UX Guidelines (per Proposal)

- Clean, modern, mobile-first design
- Consistent reusable components
- Card-based information presentation
- Bottom navigation: Home, Services, Notifications, Profile
- Services section: Routine, Courses, Materials, Assignments, Events, Complaints, Lost & Found
- Home screen prioritizes today's classes & relevant info
- Simple forms (minimal steps)
- Complaint tracking with visual status timeline
- Event screens: date, location, registration status, capacity
- Role-based access protection (teacher/admin only actions)

---

## Security Considerations

- JWT token storage (secure storage, not shared preferences)
- Token refresh logic
- Input validation on all forms
- File upload validation (type, size)
- HTTPS only for API calls
- Error messages don't leak sensitive info

---

## Testing Strategy

- **Unit Tests:** Business logic, validators, formatters
- **Widget Tests:** UI components, buttons, forms
- **Integration Tests:** Auth flow, API calls, navigation
- **QA:** Subir Das (team QA) will test all features

---

## Deliverables (Your Part)

1. ✅ Flutter project with full folder structure
2. ✅ All frontend screens (auth, home, notices, routine, courses, materials, assignments, events, complaints, lost & found, profile, admin)
3. ✅ API integration with backend
4. ✅ State management (Riverpod)
5. ✅ Push notifications setup (Firebase)
6. ✅ Unit & widget tests
7. ✅ Documentation & user guide
8. ✅ Final presentation

---

## Coordination Points

- **Daily:** Standup with team (online)
- **Week 1:** API contract with Nirob (endpoints, request/response format)
- **Week 2:** UI/UX review with Khadiza
- **Week 4:** Database schema review with Kajal
- **Week 6:** Integration testing with backend
- **Week 8:** Final demo & presentation

---

## Next Steps (Immediate)

1. 🔄 Push this plan to `frontend/dev` branch
2. 🔄 Initialize Flutter project on this branch
3. 🔄 Share API contract with Nirob (backend dev)
4. 🔄 Coordinate UI design with Khadiza
5. 🔄 Set up Firebase project for push notifications

---

*Last Updated: October 2026*
*Author: Abdullah Al Adnan (20244203038) — Frontend Developer*
