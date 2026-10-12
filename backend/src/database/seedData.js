const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/db');

async function seed() {
  try {
    console.log(' Starting Database Seeding for CampusConnect...');
    const pool = await getPool();

    // 1. Departments
    const depts = [
      { code: 'CSE', name: 'Computer Science and Engineering' },
      { code: 'EEE', name: 'Electrical and Electronic Engineering' },
      { code: 'BBA', name: 'Business Administration' },
      { code: 'ENGLISH', name: 'Department of English' },
      { code: 'LAW', name: 'Department of Law & Justice' }
    ];

    for (const d of depts) {
      await pool.request()
        .input('code', sql.VarChar, d.code)
        .input('name', sql.NVarChar, d.name)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Departments WHERE department_code = @code)
          BEGIN
            INSERT INTO Departments (department_code, department_name) VALUES (@code, @name);
          END
        `);
    }
    console.log(' Departments seeded.');

    // Fetch CSE dept ID
    const cseDeptRes = await pool.request().query("SELECT department_id FROM Departments WHERE department_code = 'CSE'");
    const cseDeptId = cseDeptRes.recordset[0].department_id;

    // 2. Users (Admin, Teachers, Staff, Students)
    const defaultPassword = await bcrypt.hash('Password123!', 10);

    const users = [
      // Admin
      {
        uid: 'ADMIN-001',
        name: 'Chief Administrator',
        email: 'admin@bubt.edu.bd',
        role: 'ADMIN',
        deptId: cseDeptId,
        semester: null,
        section: null,
        phone: '+8801711000001'
      },
      // Teachers
      {
        uid: 'T-1001',
        name: 'Dr. Md. Shamsul Haque',
        email: 'shamsul@bubt.edu.bd',
        role: 'TEACHER',
        deptId: cseDeptId,
        semester: null,
        section: null,
        phone: '+8801711000002'
      },
      {
        uid: 'T-1002',
        name: 'Prof. Farhana Rahman',
        email: 'farhana@bubt.edu.bd',
        role: 'TEACHER',
        deptId: cseDeptId,
        semester: null,
        section: null,
        phone: '+8801711000003'
      },
      // Staff
      {
        uid: 'S-2001',
        name: 'Hasan Mahmud (Campus Supervisor)',
        email: 'staff.hasan@bubt.edu.bd',
        role: 'STAFF',
        deptId: null,
        semester: null,
        section: null,
        phone: '+8801811000004'
      },
      // Students (The SDP-03 Team members!)
      {
        uid: '20244203028',
        name: 'Kajal Mia',
        email: 'kajal@bubt.edu.bd',
        role: 'STUDENT',
        deptId: cseDeptId,
        semester: 6,
        section: '1',
        phone: '+8801700000028'
      },
      {
        uid: '20244203017',
        name: 'Nirob Sarkar',
        email: 'nirob@bubt.edu.bd',
        role: 'STUDENT',
        deptId: cseDeptId,
        semester: 6,
        section: '1',
        phone: '+8801700000017'
      },
      {
        uid: '20244203038',
        name: 'Abdullah Al Adnan',
        email: 'adnan@bubt.edu.bd',
        role: 'STUDENT',
        deptId: cseDeptId,
        semester: 6,
        section: '1',
        phone: '+8801700000038'
      },
      {
        uid: '20244203046',
        name: 'Khadiza Akter Lima',
        email: 'lima@bubt.edu.bd',
        role: 'STUDENT',
        deptId: cseDeptId,
        semester: 6,
        section: '1',
        phone: '+8801700000046'
      },
      {
        uid: '20244203048',
        name: 'Subir Das',
        email: 'subir@bubt.edu.bd',
        role: 'STUDENT',
        deptId: cseDeptId,
        semester: 6,
        section: '1',
        phone: '+8801700000048'
      }
    ];

    for (const u of users) {
      await pool.request()
        .input('uid', sql.VarChar, u.uid)
        .input('name', sql.NVarChar, u.name)
        .input('email', sql.VarChar, u.email)
        .input('pwd', sql.VarChar, defaultPassword)
        .input('role', sql.VarChar, u.role)
        .input('deptId', sql.Int, u.deptId)
        .input('sem', sql.Int, u.semester)
        .input('sec', sql.VarChar, u.section)
        .input('phone', sql.VarChar, u.phone)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Users WHERE university_id = @uid OR email = @email)
          BEGIN
            INSERT INTO Users (university_id, full_name, email, password_hash, role, department_id, semester, section, phone)
            VALUES (@uid, @name, @email, @pwd, @role, @deptId, @sem, @sec, @phone);
          END
        `);
    }
    console.log(' Users seeded.');

    // Fetch user IDs
    const teacherRes = await pool.request().query("SELECT user_id FROM Users WHERE university_id = 'T-1001'");
    const teacherId1 = teacherRes.recordset[0].user_id;

    const teacherRes2 = await pool.request().query("SELECT user_id FROM Users WHERE university_id = 'T-1002'");
    const teacherId2 = teacherRes2.recordset[0].user_id;

    const adminRes = await pool.request().query("SELECT user_id FROM Users WHERE role = 'ADMIN'");
    const adminId = adminRes.recordset[0].user_id;

    const studentKajal = await pool.request().query("SELECT user_id FROM Users WHERE university_id = '20244203028'");
    const kajalId = studentKajal.recordset[0].user_id;

    const staffRes = await pool.request().query("SELECT user_id FROM Users WHERE role = 'STAFF'");
    const staffId = staffRes.recordset[0].user_id;

    // 3. Courses
    const courses = [
      { code: 'CSE 3200', title: 'System Development Project - III', credits: 2.0, dept: cseDeptId, sem: 6, teacher: teacherId1 },
      { code: 'CSE 3201', title: 'Database Management Systems', credits: 3.0, dept: cseDeptId, sem: 6, teacher: teacherId1 },
      { code: 'CSE 3205', title: 'Computer Networks & Security', credits: 3.0, dept: cseDeptId, sem: 6, teacher: teacherId2 },
      { code: 'CSE 3211', title: 'Software Engineering & Design Patterns', credits: 3.0, dept: cseDeptId, sem: 6, teacher: teacherId2 }
    ];

    for (const c of courses) {
      await pool.request()
        .input('code', sql.VarChar, c.code)
        .input('title', sql.NVarChar, c.title)
        .input('credits', sql.Decimal(3, 1), c.credits)
        .input('dept', sql.Int, c.dept)
        .input('sem', sql.Int, c.sem)
        .input('teacher', sql.Int, c.teacher)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Courses WHERE course_code = @code)
          BEGIN
            INSERT INTO Courses (course_code, course_title, credits, department_id, semester, teacher_id)
            VALUES (@code, @title, @credits, @dept, @sem, @teacher);
          END
        `);
    }
    console.log(' Courses seeded.');

    // Fetch Course IDs
    const cse3200Res = await pool.request().query("SELECT course_id FROM Courses WHERE course_code = 'CSE 3200'");
    const cse3200Id = cse3200Res.recordset[0].course_id;

    const cse3201Res = await pool.request().query("SELECT course_id FROM Courses WHERE course_code = 'CSE 3201'");
    const cse3201Id = cse3201Res.recordset[0].course_id;

    const cse3205Res = await pool.request().query("SELECT course_id FROM Courses WHERE course_code = 'CSE 3205'");
    const cse3205Id = cse3205Res.recordset[0].course_id;

    const cse3211Res = await pool.request().query("SELECT course_id FROM Courses WHERE course_code = 'CSE 3211'");
    const cse3211Id = cse3211Res.recordset[0].course_id;

    // Enroll students in courses
    const studentUsers = await pool.request().query("SELECT user_id FROM Users WHERE role = 'STUDENT'");
    for (const row of studentUsers.recordset) {
      for (const cid of [cse3200Id, cse3201Id, cse3205Id, cse3211Id]) {
        await pool.request()
          .input('cid', sql.Int, cid)
          .input('sid', sql.Int, row.user_id)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM CourseEnrollments WHERE course_id = @cid AND student_id = @sid)
            BEGIN
              INSERT INTO CourseEnrollments (course_id, student_id) VALUES (@cid, @sid);
            END
          `);
      }
    }
    console.log(' Course enrollments seeded.');

    // 4. Class Routines
    const routines = [
      { cid: cse3200Id, tid: teacherId1, day: 'Sunday', start: '09:00 AM', end: '10:30 AM', room: 'Lab 402, Building 2' },
      { cid: cse3201Id, tid: teacherId1, day: 'Sunday', start: '10:45 AM', end: '12:15 PM', room: 'Room 501, Building 1' },
      { cid: cse3205Id, tid: teacherId2, day: 'Monday', start: '09:00 AM', end: '10:30 AM', room: 'Lab 305, Building 2' },
      { cid: cse3211Id, tid: teacherId2, day: 'Monday', start: '10:45 AM', end: '12:15 PM', room: 'Room 503, Building 1' },
      { cid: cse3201Id, tid: teacherId1, day: 'Tuesday', start: '01:00 PM', end: '02:30 PM', room: 'Lab 401, Building 2' },
      { cid: cse3200Id, tid: teacherId1, day: 'Wednesday', start: '10:45 AM', end: '01:00 PM', room: 'Project Lab 404' },
      { cid: cse3205Id, tid: teacherId2, day: 'Thursday', start: '10:45 AM', end: '12:15 PM', room: 'Room 408, Building 2' }
    ];

    for (const r of routines) {
      await pool.request()
        .input('cid', sql.Int, r.cid)
        .input('tid', sql.Int, r.tid)
        .input('dept', sql.Int, cseDeptId)
        .input('sem', sql.Int, 6)
        .input('sec', sql.VarChar, '1')
        .input('day', sql.VarChar, r.day)
        .input('start', sql.VarChar, r.start)
        .input('end', sql.VarChar, r.end)
        .input('room', sql.NVarChar, r.room)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM ClassRoutines WHERE course_id = @cid AND day_of_week = @day AND start_time = @start)
          BEGIN
            INSERT INTO ClassRoutines (course_id, teacher_id, department_id, semester, section, day_of_week, start_time, end_time, room_number)
            VALUES (@cid, @tid, @dept, @sem, @sec, @day, @start, @end, @room);
          END
        `);
    }
    console.log(' Class routines seeded.');

    // 5. Notices
    const notices = [
      {
        title: 'Midterm Examination Schedule - Fall 2026',
        content: 'The Midterm Examinations of Fall 2026 semester for Day and Evening programs will commence from October 28, 2026. Detailed room and seat allocation will be published on the notice board.',
        cat: 'Exam',
        pri: 'Urgent',
        author: adminId,
        dept: null
      },
      {
        title: 'SDP-3 Project Proposal & Sprint-1 Guidelines',
        content: 'All 6th semester CSE students enrolled in CSE 3200 must submit their initial project proposal and GitHub repository links by this Thursday. Ensure role-based workflows and database connectivity are documented.',
        cat: 'Academic',
        pri: 'High',
        author: teacherId1,
        dept: cseDeptId
      },
      {
        title: 'BUBT Tech Carnival & National Hackathon 2026',
        content: 'The Department of CSE is organizing the annual Tech Carnival 2026 on November 15-16. Registration is now open for Competitive Programming, Hackathon, and Project Showcase.',
        cat: 'General',
        pri: 'Normal',
        author: adminId,
        dept: null
      }
    ];

    for (const n of notices) {
      await pool.request()
        .input('title', sql.NVarChar, n.title)
        .input('content', sql.NVarChar, n.content)
        .input('cat', sql.VarChar, n.cat)
        .input('pri', sql.VarChar, n.pri)
        .input('author', sql.Int, n.author)
        .input('dept', sql.Int, n.dept)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Notices WHERE title = @title)
          BEGIN
            INSERT INTO Notices (title, content, category, priority, author_id, department_id)
            VALUES (@title, @content, @cat, @pri, @author, @dept);
          END
        `);
    }
    console.log(' Notices seeded.');

    // 6. Learning Materials
    const materials = [
      {
        cid: cse3200Id,
        title: 'CampusConnect SRS and Architecture Blueprint',
        desc: 'Comprehensive system requirements specification and MS SQL schema diagram for SDP-03.',
        topic: 'Architecture & System Design',
        file: 'https://bubt.edu.bd/academic/materials/sdp03_spec.pdf',
        type: 'PDF',
        uploader: teacherId1
      },
      {
        cid: cse3201Id,
        title: 'Chapter 05: Relational Indexing & B-Trees',
        desc: 'Lecture slides on Clustered vs Non-Clustered Indexes in MS SQL Server.',
        topic: 'Database Optimization',
        file: 'https://bubt.edu.bd/academic/materials/dbms_ch05.pdf',
        type: 'PDF',
        uploader: teacherId1
      },
      {
        cid: cse3205Id,
        title: 'Network Socket Programming with Node.js',
        desc: 'Source code and tutorial covering TCP sockets and REST API security.',
        topic: 'Socket Programming',
        file: 'https://bubt.edu.bd/academic/materials/network_sockets.zip',
        type: 'ZIP',
        uploader: teacherId2
      }
    ];

    for (const m of materials) {
      await pool.request()
        .input('cid', sql.Int, m.cid)
        .input('title', sql.NVarChar, m.title)
        .input('desc', sql.NVarChar, m.desc)
        .input('topic', sql.NVarChar, m.topic)
        .input('file', sql.NVarChar, m.file)
        .input('type', sql.VarChar, m.type)
        .input('uploader', sql.Int, m.uploader)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM LearningMaterials WHERE title = @title)
          BEGIN
            INSERT INTO LearningMaterials (course_id, title, description, topic, file_url, file_type, uploaded_by)
            VALUES (@cid, @title, @desc, @topic, @file, @type, @uploader);
          END
        `);
    }
    console.log(' Learning materials seeded.');

    // 7. Assignments
    const assignments = [
      {
        cid: cse3200Id,
        title: 'Sprint 1: Architecture, DB Schema & Auth Implementation',
        desc: 'Submit repository link and documentation demonstrating JWT auth, MS SQL schema, and core mobile app screens.',
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
        marks: 25,
        teacher: teacherId1
      },
      {
        cid: cse3201Id,
        title: 'Lab Task 03: Complex SQL Joins & Stored Procedures',
        desc: 'Solve the query exercises in MS SQL Server and export your .sql solution file.',
        dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
        marks: 15,
        teacher: teacherId1
      }
    ];

    for (const a of assignments) {
      await pool.request()
        .input('cid', sql.Int, a.cid)
        .input('title', sql.NVarChar, a.title)
        .input('desc', sql.NVarChar, a.desc)
        .input('due', sql.DateTime, a.dueDate)
        .input('marks', sql.Int, a.marks)
        .input('teacher', sql.Int, a.teacher)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Assignments WHERE title = @title)
          BEGIN
            INSERT INTO Assignments (course_id, title, description, due_date, total_marks, teacher_id)
            VALUES (@cid, @title, @desc, @due, @marks, @teacher);
          END
        `);
    }
    console.log(' Assignments seeded.');

    // 8. Campus Events
    const events = [
      {
        title: 'BUBT CSE TechFest 2026',
        desc: 'Annual festival celebrating software development, robotics, and cyber security with industry tech leaders and competitions.',
        organizer: 'BUBT IT Club & Dept. of CSE',
        date: new Date(Date.now() + 14 * 24 * 3600 * 1000),
        venue: 'International Conference Hall, Building 1',
        capacity: 250,
        creator: adminId
      },
      {
        title: 'Career & Internship Fair 2026',
        desc: 'Meet recruiters from top IT companies and software firms. Bring copies of your CV for on-spot interviews.',
        organizer: 'BUBT Career Guidance Office',
        date: new Date(Date.now() + 21 * 24 * 3600 * 1000),
        venue: 'Campus Ground & Auditorium',
        capacity: 500,
        creator: adminId
      }
    ];

    for (const ev of events) {
      await pool.request()
        .input('title', sql.NVarChar, ev.title)
        .input('desc', sql.NVarChar, ev.desc)
        .input('org', sql.NVarChar, ev.organizer)
        .input('date', sql.DateTime, ev.date)
        .input('venue', sql.NVarChar, ev.venue)
        .input('cap', sql.Int, ev.capacity)
        .input('creator', sql.Int, ev.creator)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM CampusEvents WHERE title = @title)
          BEGIN
            INSERT INTO CampusEvents (title, description, organizer, event_date, venue, capacity, created_by)
            VALUES (@title, @desc, @org, @date, @venue, @cap, @creator);
          END
        `);
    }
    console.log(' Campus events seeded.');

    // 9. Complaints & Timelines
    const complaints = [
      {
        title: 'Lab 402 AC Not Cooling Adequately',
        cat: 'Lab Equipment',
        pri: 'High',
        desc: 'During the 3-hour afternoon lab, the back AC unit in Lab 402 turns off automatically and makes clicking noises.',
        loc: 'Building 2, 4th Floor, Lab 402',
        status: 'In Progress',
        user: kajalId,
        staff: staffId
      },
      {
        title: 'Weak Wi-Fi Signal on 3rd Floor Study Zone',
        cat: 'IT/Network',
        pri: 'Medium',
        desc: 'Students frequently lose Wi-Fi connection in the south study zone corridor.',
        loc: 'Building 1, 3rd Floor Corridor',
        status: 'Under Review',
        user: kajalId,
        staff: staffId
      }
    ];

    for (const cmp of complaints) {
      const exists = await pool.request()
        .input('title', sql.NVarChar, cmp.title)
        .query("SELECT complaint_id FROM Complaints WHERE title = @title");

      if (exists.recordset.length === 0) {
        const insertRes = await pool.request()
          .input('title', sql.NVarChar, cmp.title)
          .input('cat', sql.VarChar, cmp.cat)
          .input('pri', sql.VarChar, cmp.pri)
          .input('desc', sql.NVarChar, cmp.desc)
          .input('loc', sql.NVarChar, cmp.loc)
          .input('status', sql.VarChar, cmp.status)
          .input('user', sql.Int, cmp.user)
          .input('staff', sql.Int, cmp.staff)
          .query(`
            INSERT INTO Complaints (title, category, priority, description, location, status, user_id, assigned_staff_id)
            OUTPUT INSERTED.complaint_id
            VALUES (@title, @cat, @pri, @desc, @loc, @status, @user, @staff);
          `);

        const cmpId = insertRes.recordset[0].complaint_id;

        // Insert timeline events
        await pool.request()
          .input('cmpId', sql.Int, cmpId)
          .input('status', sql.VarChar, 'Pending')
          .input('remarks', sql.NVarChar, 'Complaint registered in CampusConnect portal.')
          .input('by', sql.Int, cmp.user)
          .query(`INSERT INTO ComplaintTimelines (complaint_id, status, remarks, updated_by) VALUES (@cmpId, @status, @remarks, @by)`);

        await pool.request()
          .input('cmpId', sql.Int, cmpId)
          .input('status', sql.VarChar, cmp.status)
          .input('remarks', sql.NVarChar, 'Assigned to Facilities & Maintenance Team. Inspection team scheduled.')
          .input('by', sql.Int, cmp.staff)
          .query(`INSERT INTO ComplaintTimelines (complaint_id, status, remarks, updated_by) VALUES (@cmpId, @status, @remarks, @by)`);
      }
    }
    console.log(' Complaints & timelines seeded.');

    // 10. Lost & Found Items
    const lostFounds = [
      {
        type: 'Lost',
        title: 'Blue BUBT Student ID Card Lanyard',
        cat: 'ID Card',
        desc: 'Lost student ID card for Kajal Mia (20244203028) with blue lanyard near the campus cafeteria.',
        loc: 'Campus Cafeteria, Ground Floor',
        date: new Date(Date.now() - 24 * 3600 * 1000),
        contact: 'Phone: 01700000028 or CSE Dept Office',
        status: 'Active',
        user: kajalId
      },
      {
        type: 'Found',
        title: 'Casio Scientific Calculator fx-991EX',
        cat: 'Electronics',
        desc: 'Left on desk row 3 in Room 501 after Database class. Please show receipt or verify ID to claim.',
        loc: 'Room 501, Building 1',
        date: new Date(Date.now() - 48 * 3600 * 1000),
        contact: 'Contact Teacher Dr. Shamsul Haque (Room 412)',
        status: 'Active',
        user: teacherId1
      }
    ];

    for (const lf of lostFounds) {
      await pool.request()
        .input('type', sql.VarChar, lf.type)
        .input('title', sql.NVarChar, lf.title)
        .input('cat', sql.VarChar, lf.cat)
        .input('desc', sql.NVarChar, lf.desc)
        .input('loc', sql.NVarChar, lf.loc)
        .input('date', sql.DateTime, lf.date)
        .input('contact', sql.NVarChar, lf.contact)
        .input('status', sql.VarChar, lf.status)
        .input('user', sql.Int, lf.user)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM LostAndFound WHERE title = @title)
          BEGIN
            INSERT INTO LostAndFound (type, title, category, description, location, item_date, contact_info, status, user_id)
            VALUES (@type, @title, @cat, @desc, @loc, @date, @contact, @status, @user);
          END
        `);
    }
    console.log(' Lost and Found seeded.');

    // 11. Notifications
    const notifications = [
      {
        uid: kajalId,
        title: 'Welcome to CampusConnect!',
        msg: 'Your academic portal is activated for Fall 2026. Explore routines, courses, notices, and services.',
        type: 'General'
      },
      {
        uid: kajalId,
        title: 'New Notice: Midterm Exam Schedule',
        msg: 'Exam schedule published by Examination Controller office. Check notices tab.',
        type: 'Notice'
      },
      {
        uid: kajalId,
        title: 'Assignment Posted: SDP-3 Sprint 1',
        msg: 'Dr. Md. Shamsul Haque uploaded assignment due in 5 days.',
        type: 'Assignment'
      }
    ];

    for (const notif of notifications) {
      await pool.request()
        .input('uid', sql.Int, notif.uid)
        .input('title', sql.NVarChar, notif.title)
        .input('msg', sql.NVarChar, notif.msg)
        .input('type', sql.VarChar, notif.type)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM Notifications WHERE user_id = @uid AND title = @title)
          BEGIN
            INSERT INTO Notifications (user_id, title, message, type)
            VALUES (@uid, @title, @msg, @type);
          END
        `);
    }
    console.log(' Notifications seeded.');

    console.log(' All database seed data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error(' Error seeding database:', err);
    process.exit(1);
  }
}

seed();
