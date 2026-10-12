const { getPool, sql } = require('../config/db');

exports.getCourses = async (req, res) => {
  const { department_id, semester, my_courses } = req.query;

  try {
    const pool = await getPool();
    let query = `
      SELECT c.*, 
             u.full_name AS teacher_name, u.email AS teacher_email,
             d.department_code, d.department_name,
             (SELECT COUNT(*) FROM CourseEnrollments ce WHERE ce.course_id = c.course_id) AS enrolled_students_count,
             (SELECT COUNT(*) FROM LearningMaterials lm WHERE lm.course_id = c.course_id) AS materials_count,
             (SELECT COUNT(*) FROM Assignments a WHERE a.course_id = c.course_id) AS assignments_count
      FROM Courses c
      LEFT JOIN Users u ON c.teacher_id = u.user_id
      INNER JOIN Departments d ON c.department_id = d.department_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (my_courses === 'true') {
      if (req.user.role === 'STUDENT') {
        query += ` AND c.course_id IN (SELECT course_id FROM CourseEnrollments WHERE student_id = @userId)`;
        request.input('userId', sql.Int, req.user.user_id);
      } else if (req.user.role === 'TEACHER') {
        query += ` AND c.teacher_id = @userId`;
        request.input('userId', sql.Int, req.user.user_id);
      }
    }

    if (department_id) {
      query += ` AND c.department_id = @deptId`;
      request.input('deptId', sql.Int, parseInt(department_id));
    }

    if (semester) {
      query += ` AND c.semester = @sem`;
      request.input('sem', sql.Int, parseInt(semester));
    }

    query += ` ORDER BY c.semester ASC, c.course_code ASC`;

    const result = await request.query(query);
    return res.json({ success: true, count: result.recordset.length, courses: result.recordset });
  } catch (err) {
    console.error('getCourses error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve courses.', error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const courseRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT c.*, 
               u.full_name AS teacher_name, u.email AS teacher_email, u.phone AS teacher_phone,
               d.department_code, d.department_name
        FROM Courses c
        LEFT JOIN Users u ON c.teacher_id = u.user_id
        INNER JOIN Departments d ON c.department_id = d.department_id
        WHERE c.course_id = @id
      `);

    if (courseRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const course = courseRes.recordset[0];

    // Check if current user is enrolled
    let isEnrolled = false;
    if (req.user.role === 'STUDENT') {
      const enrollCheck = await pool.request()
        .input('cid', sql.Int, id)
        .input('sid', sql.Int, req.user.user_id)
        .query('SELECT enrollment_id FROM CourseEnrollments WHERE course_id = @cid AND student_id = @sid');
      isEnrolled = enrollCheck.recordset.length > 0;
    }

    // Materials
    const materials = await pool.request()
      .input('cid', sql.Int, id)
      .query('SELECT * FROM LearningMaterials WHERE course_id = @cid ORDER BY created_at DESC');

    // Assignments
    const assignments = await pool.request()
      .input('cid', sql.Int, id)
      .query('SELECT * FROM Assignments WHERE course_id = @cid ORDER BY due_date ASC');

    return res.json({
      success: true,
      course: {
        ...course,
        is_enrolled: isEnrolled,
        materials: materials.recordset,
        assignments: assignments.recordset
      }
    });
  } catch (err) {
    console.error('getCourseById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve course details.', error: err.message });
  }
};

exports.createCourse = async (req, res) => {
  const { course_code, course_title, credits = 3.0, department_id, semester, teacher_id } = req.body;

  if (!course_code || !course_title || !department_id || !semester) {
    return res.status(400).json({ success: false, message: 'Course code, title, department, and semester are required.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('code', sql.VarChar, course_code)
      .input('title', sql.NVarChar, course_title)
      .input('credits', sql.Decimal(3, 1), credits)
      .input('deptId', sql.Int, department_id)
      .input('sem', sql.Int, semester)
      .input('teacherId', sql.Int, teacher_id || null)
      .query(`
        INSERT INTO Courses (course_code, course_title, credits, department_id, semester, teacher_id)
        OUTPUT INSERTED.*
        VALUES (@code, @title, @credits, @deptId, @sem, @teacherId);
      `);

    return res.status(201).json({ success: true, message: 'Course created successfully.', course: result.recordset[0] });
  } catch (err) {
    console.error('createCourse error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create course.', error: err.message });
  }
};

exports.enrollCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request()
      .input('cid', sql.Int, id)
      .input('sid', sql.Int, req.user.user_id)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM CourseEnrollments WHERE course_id = @cid AND student_id = @sid)
        BEGIN
          INSERT INTO CourseEnrollments (course_id, student_id) VALUES (@cid, @sid);
        END
      `);

    return res.json({ success: true, message: 'Enrolled in course successfully.' });
  } catch (err) {
    console.error('enrollCourse error:', err);
    return res.status(500).json({ success: false, message: 'Failed to enroll.', error: err.message });
  }
};
