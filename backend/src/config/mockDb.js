const bcrypt = require('bcryptjs');

// Pre-hashed Password123!
const DEFAULT_HASH = '$2a$10$wT8K488hWcE7b2v7x2kY7eC1l9t1S6lX/7mH0u6f8vN1y6d9g2rC.';

const departments = [
  { department_id: 1, department_code: 'CSE', department_name: 'Computer Science and Engineering' },
  { department_id: 2, department_code: 'EEE', department_name: 'Electrical and Electronic Engineering' },
  { department_id: 3, department_code: 'BBA', department_name: 'Business Administration' },
  { department_id: 4, department_code: 'ENGLISH', department_name: 'Department of English' },
  { department_id: 5, department_code: 'LAW', department_name: 'Department of Law & Justice' }
];

let users = [
  {
    user_id: 1,
    university_id: 'ADMIN-001',
    full_name: 'Chief Administrator',
    email: 'admin@bubt.edu.bd',
    role: 'ADMIN',
    department_id: 1,
    department_code: 'CSE',
    department_name: 'Computer Science and Engineering',
    password_hash: bcrypt.hashSync('Password123!', 10),
    phone: '+8801711000001',
    is_active: true,
    created_at: new Date()
  },
  {
    user_id: 2,
    university_id: 'T-1001',
    full_name: 'Dr. Md. Shamsul Haque',
    email: 'shamsul@bubt.edu.bd',
    role: 'TEACHER',
    department_id: 1,
    department_code: 'CSE',
    department_name: 'Computer Science and Engineering',
    password_hash: bcrypt.hashSync('Password123!', 10),
    phone: '+8801711000002',
    is_active: true,
    created_at: new Date()
  },
  {
    user_id: 3,
    university_id: 'S-2001',
    full_name: 'Md. Hasan Ali',
    email: 'hasan.staff@bubt.edu.bd',
    role: 'STAFF',
    department_id: 1,
    department_code: 'CSE',
    department_name: 'Computer Science and Engineering',
    password_hash: bcrypt.hashSync('Password123!', 10),
    phone: '+8801711000003',
    is_active: true,
    created_at: new Date()
  },
  {
    user_id: 4,
    university_id: '20244203028',
    full_name: 'Kajal Mia',
    email: '20244203028@bubt.edu.bd',
    role: 'STUDENT',
    department_id: 1,
    department_code: 'CSE',
    department_name: 'Computer Science and Engineering',
    semester: '7th Semester',
    section: 'Section 02',
    password_hash: bcrypt.hashSync('Password123!', 10),
    phone: '+8801700000004',
    is_active: true,
    created_at: new Date()
  }
];

let notices = [
  {
    notice_id: 1,
    title: 'Midterm Examination Schedule - Fall 2026',
    content: 'All undergraduate students are hereby notified that the Fall 2026 Midterm Examinations will commence from November 15, 2026. Admit cards must be collected from the departmental office.',
    category: 'EXAM',
    target_role: 'ALL',
    published_by: 1,
    publisher_name: 'Chief Administrator',
    publisher_role: 'ADMIN',
    department_code: 'CSE',
    is_urgent: true,
    created_at: new Date(Date.now() - 3600000 * 4)
  },
  {
    notice_id: 2,
    title: 'Campus Wi-Fi Maintenance & Fiber Upgrade',
    content: 'IT Support will perform scheduled backbone maintenance on Campus Wi-Fi routers this Friday from 10:00 PM to 4:00 AM. High-speed connectivity will resume on Saturday.',
    category: 'ACADEMIC',
    target_role: 'ALL',
    published_by: 1,
    publisher_name: 'Chief Administrator',
    publisher_role: 'ADMIN',
    department_code: 'CSE',
    is_urgent: false,
    created_at: new Date(Date.now() - 3600000 * 24)
  },
  {
    notice_id: 3,
    title: 'National Hackathon 2026 Registration Open',
    content: 'Registration is now open for the Intra-University Hackathon. Teams consisting of 3-4 students can register with their departmental faculty advisors by October 25.',
    category: 'EVENT',
    target_role: 'STUDENT',
    published_by: 2,
    publisher_name: 'Dr. Md. Shamsul Haque',
    publisher_role: 'TEACHER',
    department_code: 'CSE',
    is_urgent: false,
    created_at: new Date(Date.now() - 3600000 * 48)
  }
];

let routines = [
  {
    routine_id: 1,
    course_code: 'CSE 311',
    course_title: 'Database Management Systems',
    day_of_week: 'Sunday',
    start_time: '09:00 AM',
    end_time: '10:30 AM',
    room_number: 'Room 402, Building 2',
    teacher_name: 'Dr. Md. Shamsul Haque',
    teacher_id: 2,
    semester: '7th Semester',
    section: 'Section 02',
    department_code: 'CSE'
  },
  {
    routine_id: 2,
    course_code: 'CSE 312',
    course_title: 'Database Management Systems Lab',
    day_of_week: 'Sunday',
    start_time: '11:00 AM',
    end_time: '01:00 PM',
    room_number: 'Software Lab 3, Building 2',
    teacher_name: 'Dr. Md. Shamsul Haque',
    teacher_id: 2,
    semester: '7th Semester',
    section: 'Section 02',
    department_code: 'CSE'
  },
  {
    routine_id: 3,
    course_code: 'CSE 321',
    course_title: 'Software Engineering & Design Patterns',
    day_of_week: 'Tuesday',
    start_time: '10:00 AM',
    end_time: '11:30 AM',
    room_number: 'Room 501, Building 1',
    teacher_name: 'Prof. A. Rahman',
    teacher_id: 2,
    semester: '7th Semester',
    section: 'Section 02',
    department_code: 'CSE'
  }
];

let courses = [
  {
    course_id: 1,
    course_code: 'CSE 311',
    course_title: 'Database Management Systems',
    credits: 3.0,
    semester: '7th Semester',
    department_code: 'CSE',
    teacher_name: 'Dr. Md. Shamsul Haque',
    is_enrolled: true
  },
  {
    course_id: 2,
    course_code: 'CSE 312',
    course_title: 'Database Management Systems Lab',
    credits: 1.5,
    semester: '7th Semester',
    department_code: 'CSE',
    teacher_name: 'Dr. Md. Shamsul Haque',
    is_enrolled: true
  },
  {
    course_id: 3,
    course_code: 'CSE 321',
    course_title: 'Software Engineering & Design Patterns',
    credits: 3.0,
    semester: '7th Semester',
    department_code: 'CSE',
    teacher_name: 'Prof. A. Rahman',
    is_enrolled: true
  }
];

let complaints = [
  {
    complaint_id: 1,
    title: 'Projector Malfunction in Room 402',
    description: 'The overhead HDMI projector flickers and turns off during database lectures.',
    location: 'Room 402, Building 2',
    category: 'CLASSROOM',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    user_id: 4,
    reporter_name: 'Kajal Mia',
    reporter_id: '20244203028',
    created_at: new Date(Date.now() - 3600000 * 5)
  }
];

let events = [
  {
    event_id: 1,
    title: 'Intra-University Tech Fest 2026',
    description: 'Annual technology symposium featuring project exhibitions, competitive programming, and robotics showcases.',
    venue: 'Auditorium, Main Campus',
    start_time: new Date(Date.now() + 86400000 * 5),
    end_time: new Date(Date.now() + 86400000 * 7),
    category: 'COMPETITION',
    organizer_id: 1,
    is_registered: false
  }
];

let lostFound = [
  {
    item_id: 1,
    item_type: 'LOST',
    title: 'Black Lenovo Laptop Charger 65W',
    description: 'Left behind on the third row bench after DBMS Lab lecture.',
    location_found: 'Software Lab 3',
    contact_info: 'Contact student desk or WhatsApp: 01700000004',
    status: 'OPEN',
    created_at: new Date(Date.now() - 3600000 * 8)
  }
];

let notifications = [
  {
    notification_id: 1,
    user_id: 4,
    title: 'Welcome to CampusConnect!',
    message: 'Your university student portal is active. You can check routines, grades, notices, and file campus maintenance tickets.',
    type: 'GENERAL',
    is_read: false,
    created_at: new Date()
  }
];

const mockPool = {
  request: () => {
    const inputs = {};
    const req = {
      input: (name, type, value) => {
        inputs[name] = value;
        return req;
      },
      query: async (sqlText) => {
        const text = sqlText.trim();

        // 1. Health check
        if (text.includes('DB_NAME()')) {
          return {
            recordset: [{ db: 'CampusConnectDB (Cloud In-Memory)', serverTime: new Date() }],
            rowsAffected: [1]
          };
        }

        // 2. Auth: User lookup
        if (text.includes('FROM Users') && (text.includes('@id') || text.includes('u.email = @id'))) {
          const id = (inputs.id || '').trim().toLowerCase();
          const found = users.find(u =>
            (u.email && u.email.toLowerCase() === id) ||
            (u.university_id && u.university_id.toLowerCase() === id)
          );
          return {
            recordset: found ? [found] : [],
            rowsAffected: [found ? 1 : 0]
          };
        }

        // Auth: Check existing email or university_id
        if (text.includes('SELECT 1 FROM Users WHERE email = @email OR university_id = @uid')) {
          const found = users.find(u => u.email === inputs.email || u.university_id === inputs.uid);
          return { recordset: found ? [{ 1: 1 }] : [], rowsAffected: [found ? 1 : 0] };
        }

        // Auth: Register user
        if (text.includes('INSERT INTO Users')) {
          const newUser = {
            user_id: users.length + 1,
            university_id: inputs.uid,
            full_name: inputs.name,
            email: inputs.email,
            role: inputs.role || 'STUDENT',
            department_id: inputs.deptId || 1,
            department_code: 'CSE',
            department_name: 'Computer Science and Engineering',
            semester: inputs.sem || null,
            section: inputs.sec || null,
            password_hash: inputs.hash,
            phone: inputs.phone || null,
            is_active: true,
            created_at: new Date()
          };
          users.push(newUser);
          return { recordset: [newUser], rowsAffected: [1] };
        }

        // 3. User profile by user_id
        if (text.includes('FROM Users') && text.includes('user_id = @id')) {
          const found = users.find(u => u.user_id == inputs.id);
          return { recordset: found ? [found] : [], rowsAffected: [found ? 1 : 0] };
        }

        // 4. Notices
        if (text.includes('FROM Notices')) {
          let filtered = [...notices];
          if (inputs.cat) {
            filtered = filtered.filter(n => n.category === inputs.cat);
          }
          if (inputs.search) {
            const q = inputs.search.toLowerCase();
            filtered = filtered.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
          }
          return { recordset: filtered, rowsAffected: [filtered.length] };
        }

        if (text.includes('INSERT INTO Notices')) {
          const newNotice = {
            notice_id: notices.length + 1,
            title: inputs.title,
            content: inputs.content,
            category: inputs.cat || 'GENERAL',
            target_role: inputs.role || 'ALL',
            published_by: inputs.uid,
            publisher_name: 'User',
            publisher_role: 'ADMIN',
            department_code: 'CSE',
            is_urgent: inputs.urgent === 1 || inputs.urgent === true,
            created_at: new Date()
          };
          notices.unshift(newNotice);
          return { recordset: [newNotice], rowsAffected: [1] };
        }

        // 5. Routines
        if (text.includes('FROM ClassRoutines')) {
          let filtered = [...routines];
          if (inputs.day) {
            filtered = filtered.filter(r => r.day_of_week === inputs.day);
          }
          if (inputs.today) {
            filtered = filtered.filter(r => r.day_of_week === inputs.today);
          }
          return { recordset: filtered, rowsAffected: [filtered.length] };
        }

        // 6. Courses
        if (text.includes('FROM Courses')) {
          return { recordset: courses, rowsAffected: [courses.length] };
        }

        // 7. Complaints
        if (text.includes('FROM Complaints')) {
          return { recordset: complaints, rowsAffected: [complaints.length] };
        }

        if (text.includes('INSERT INTO Complaints')) {
          const newCmp = {
            complaint_id: complaints.length + 1,
            title: inputs.title,
            description: inputs.desc,
            location: inputs.loc,
            category: inputs.cat || 'OTHER',
            priority: inputs.priority || 'MEDIUM',
            status: 'OPEN',
            user_id: inputs.uid,
            reporter_name: 'Kajal Mia',
            reporter_id: '20244203028',
            created_at: new Date()
          };
          complaints.unshift(newCmp);
          return { recordset: [newCmp], rowsAffected: [1] };
        }

        // 8. Campus Events
        if (text.includes('FROM CampusEvents')) {
          return { recordset: events, rowsAffected: [events.length] };
        }

        // 9. Lost & Found
        if (text.includes('FROM LostAndFound')) {
          return { recordset: lostFound, rowsAffected: [lostFound.length] };
        }

        // 10. Notifications
        if (text.includes('FROM Notifications')) {
          const userNotifs = notifications.filter(n => !inputs.uid || n.user_id == inputs.uid);
          return { recordset: userNotifs, rowsAffected: [userNotifs.length] };
        }

        // 11. Departments
        if (text.includes('FROM Departments')) {
          return { recordset: departments, rowsAffected: [departments.length] };
        }

        // 12. Admin Stats
        if (text.includes('SELECT') && text.includes('total_students')) {
          return {
            recordset: [{
              total_students: 1250,
              total_teachers: 78,
              total_staff: 42,
              active_courses: 36,
              open_complaints: complaints.filter(c => c.status !== 'RESOLVED').length,
              published_notices: notices.length,
              total_events: events.length
            }],
            rowsAffected: [1]
          };
        }

        // Default empty recordset for any other query
        return { recordset: [], rowsAffected: [0] };
      }
    };
    return req;
  }
};

module.exports = {
  mockPool
};
