const { getPool, sql } = require('../config/db');

exports.getAssignments = async (req, res) => {
  const { course_id, upcoming_only } = req.query;

  try {
    const pool = await getPool();
    let query = `
      SELECT a.*, 
             c.course_code, c.course_title,
             u.full_name AS teacher_name,
             (SELECT COUNT(*) FROM AssignmentSubmissions s WHERE s.assignment_id = a.assignment_id) AS total_submissions_count
    `;

    if (req.user.role === 'STUDENT') {
      query += `,
        sub.submission_id AS my_submission_id,
        sub.status AS my_submission_status,
        sub.marks_obtained AS my_marks_obtained,
        sub.submitted_at AS my_submitted_at,
        sub.feedback AS my_feedback
      `;
    }

    query += `
      FROM Assignments a
      INNER JOIN Courses c ON a.course_id = c.course_id
      INNER JOIN Users u ON a.teacher_id = u.user_id
    `;

    if (req.user.role === 'STUDENT') {
      query += `
        LEFT JOIN AssignmentSubmissions sub 
          ON a.assignment_id = sub.assignment_id AND sub.student_id = @studentId
      `;
    }

    query += ` WHERE 1=1 `;

    const request = pool.request();

    if (req.user.role === 'STUDENT') {
      request.input('studentId', sql.Int, req.user.user_id);
      // Only for courses student is enrolled in
      query += ` AND a.course_id IN (SELECT course_id FROM CourseEnrollments WHERE student_id = @studentId)`;
    } else if (req.user.role === 'TEACHER') {
      query += ` AND a.teacher_id = @teacherId`;
      request.input('teacherId', sql.Int, req.user.user_id);
    }

    if (course_id) {
      query += ` AND a.course_id = @cid`;
      request.input('cid', sql.Int, parseInt(course_id));
    }

    if (upcoming_only === 'true') {
      query += ` AND a.due_date >= GETDATE()`;
    }

    query += ` ORDER BY a.due_date ASC`;

    const result = await request.query(query);
    return res.json({ success: true, count: result.recordset.length, assignments: result.recordset });
  } catch (err) {
    console.error('getAssignments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve assignments.', error: err.message });
  }
};

exports.getAssignmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT a.*, c.course_code, c.course_title, u.full_name AS teacher_name, u.email AS teacher_email
        FROM Assignments a
        INNER JOIN Courses c ON a.course_id = c.course_id
        INNER JOIN Users u ON a.teacher_id = u.user_id
        WHERE a.assignment_id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const assignment = result.recordset[0];

    // If student: fetch student's submission
    let mySubmission = null;
    let allSubmissions = [];

    if (req.user.role === 'STUDENT') {
      const subRes = await pool.request()
        .input('aid', sql.Int, id)
        .input('sid', sql.Int, req.user.user_id)
        .query('SELECT * FROM AssignmentSubmissions WHERE assignment_id = @aid AND student_id = @sid');
      if (subRes.recordset.length > 0) {
        mySubmission = subRes.recordset[0];
      }
    } else if (req.user.role === 'TEACHER' || req.user.role === 'ADMIN') {
      const allSubRes = await pool.request()
        .input('aid', sql.Int, id)
        .query(`
          SELECT s.*, u.university_id, u.full_name AS student_name, u.email AS student_email, u.section
          FROM AssignmentSubmissions s
          INNER JOIN Users u ON s.student_id = u.user_id
          WHERE s.assignment_id = @aid
          ORDER BY s.submitted_at DESC
        `);
      allSubmissions = allSubRes.recordset;
    }

    return res.json({
      success: true,
      assignment: {
        ...assignment,
        mySubmission,
        submissions: allSubmissions
      }
    });
  } catch (err) {
    console.error('getAssignmentById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve assignment.', error: err.message });
  }
};

exports.createAssignment = async (req, res) => {
  const { course_id, title, description, due_date, total_marks = 100, attachment_url } = req.body;

  if (!course_id || !title || !description || !due_date) {
    return res.status(400).json({ success: false, message: 'Course, title, description, and due date are required.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('cid', sql.Int, course_id)
      .input('title', sql.NVarChar, title)
      .input('desc', sql.NVarChar, description)
      .input('dueDate', sql.DateTime, new Date(due_date))
      .input('marks', sql.Int, total_marks)
      .input('attach', sql.NVarChar, attachment_url || null)
      .input('teacher', sql.Int, req.user.user_id)
      .query(`
        INSERT INTO Assignments (course_id, title, description, due_date, total_marks, attachment_url, teacher_id)
        OUTPUT INSERTED.*
        VALUES (@cid, @title, @desc, @dueDate, @marks, @attach, @teacher);
      `);

    const newAssignment = result.recordset[0];

    // Notify enrolled students
    await pool.request()
      .input('title', sql.NVarChar, `New Assignment: ${title}`)
      .input('msg', sql.NVarChar, `Due by ${new Date(due_date).toLocaleDateString()}. Total marks: ${total_marks}.`)
      .input('aid', sql.Int, newAssignment.assignment_id)
      .input('cid', sql.Int, course_id)
      .query(`
        INSERT INTO Notifications (user_id, title, message, type, reference_id)
        SELECT student_id, @title, @msg, 'Assignment', @aid
        FROM CourseEnrollments
        WHERE course_id = @cid
      `);

    return res.status(201).json({ success: true, message: 'Assignment created successfully.', assignment: newAssignment });
  } catch (err) {
    console.error('createAssignment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create assignment.', error: err.message });
  }
};

exports.submitAssignment = async (req, res) => {
  const { id } = req.params;
  const { submission_text, file_url } = req.body;

  if (!submission_text && !file_url) {
    return res.status(400).json({ success: false, message: 'Please provide either text or a file link for your submission.' });
  }

  try {
    const pool = await getPool();

    // Check assignment due date
    const assignRes = await pool.request().input('aid', sql.Int, id).query('SELECT due_date FROM Assignments WHERE assignment_id = @aid');
    if (assignRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const isLate = new Date() > new Date(assignRes.recordset[0].due_date);
    const status = isLate ? 'Late' : 'Submitted';

    // Upsert submission
    const existing = await pool.request()
      .input('aid', sql.Int, id)
      .input('sid', sql.Int, req.user.user_id)
      .query('SELECT submission_id FROM AssignmentSubmissions WHERE assignment_id = @aid AND student_id = @sid');

    if (existing.recordset.length > 0) {
      await pool.request()
        .input('aid', sql.Int, id)
        .input('sid', sql.Int, req.user.user_id)
        .input('text', sql.NVarChar, submission_text || null)
        .input('file', sql.NVarChar, file_url || null)
        .input('status', sql.VarChar, status)
        .query(`
          UPDATE AssignmentSubmissions 
          SET submission_text = @text, file_url = @file, submitted_at = GETDATE(), status = @status
          WHERE assignment_id = @aid AND student_id = @sid
        `);
    } else {
      await pool.request()
        .input('aid', sql.Int, id)
        .input('sid', sql.Int, req.user.user_id)
        .input('text', sql.NVarChar, submission_text || null)
        .input('file', sql.NVarChar, file_url || null)
        .input('status', sql.VarChar, status)
        .query(`
          INSERT INTO AssignmentSubmissions (assignment_id, student_id, submission_text, file_url, status)
          VALUES (@aid, @sid, @text, @file, @status);
        `);
    }

    return res.json({ success: true, message: `Assignment submitted successfully (${status}).` });
  } catch (err) {
    console.error('submitAssignment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit assignment.', error: err.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const { marks_obtained, feedback } = req.body;

  if (marks_obtained === undefined || marks_obtained === null) {
    return res.status(400).json({ success: false, message: 'Marks obtained is required.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('subId', sql.Int, submissionId)
      .input('marks', sql.Decimal(5, 2), marks_obtained)
      .input('feedback', sql.NVarChar, feedback || '')
      .query(`
        UPDATE AssignmentSubmissions
        SET marks_obtained = @marks, feedback = @feedback, status = 'Graded', graded_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE submission_id = @subId;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const sub = result.recordset[0];

    // Notify the student
    await pool.request()
      .input('sid', sql.Int, sub.student_id)
      .input('title', sql.NVarChar, 'Assignment Graded')
      .input('msg', sql.NVarChar, `Your assignment submission received ${marks_obtained} marks. Feedback: ${feedback || 'Good effort.'}`)
      .input('aid', sql.Int, sub.assignment_id)
      .query(`
        INSERT INTO Notifications (user_id, title, message, type, reference_id)
        VALUES (@sid, @title, @msg, 'Assignment', @aid)
      `);

    return res.json({ success: true, message: 'Submission graded successfully.', submission: sub });
  } catch (err) {
    console.error('gradeSubmission error:', err);
    return res.status(500).json({ success: false, message: 'Failed to grade submission.', error: err.message });
  }
};
