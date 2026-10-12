const { getPool, sql } = require('../config/db');

exports.getRoutines = async (req, res) => {
  const { day_of_week, department_id, semester, section, teacher_id } = req.query;

  try {
    const pool = await getPool();
    let query = `
      SELECT r.*, 
             c.course_code, c.course_title, c.credits,
             u.full_name AS teacher_name, u.email AS teacher_email,
             d.department_code, d.department_name
      FROM ClassRoutines r
      INNER JOIN Courses c ON r.course_id = c.course_id
      LEFT JOIN Users u ON r.teacher_id = u.user_id
      INNER JOIN Departments d ON r.department_id = d.department_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (day_of_week) {
      query += ` AND r.day_of_week = @day`;
      request.input('day', sql.VarChar, day_of_week);
    }

    if (department_id) {
      query += ` AND r.department_id = @deptId`;
      request.input('deptId', sql.Int, parseInt(department_id));
    }

    if (semester) {
      query += ` AND r.semester = @sem`;
      request.input('sem', sql.Int, parseInt(semester));
    }

    if (section) {
      query += ` AND r.section = @sec`;
      request.input('sec', sql.VarChar, section);
    }

    if (teacher_id) {
      query += ` AND r.teacher_id = @tid`;
      request.input('tid', sql.Int, parseInt(teacher_id));
    }

    query += ` ORDER BY 
      CASE r.day_of_week 
        WHEN 'Sunday' THEN 1 
        WHEN 'Monday' THEN 2 
        WHEN 'Tuesday' THEN 3 
        WHEN 'Wednesday' THEN 4 
        WHEN 'Thursday' THEN 5 
        WHEN 'Friday' THEN 6 
        WHEN 'Saturday' THEN 7 
      END, r.start_time ASC`;

    const result = await request.query(query);
    return res.json({ success: true, count: result.recordset.length, routines: result.recordset });
  } catch (err) {
    console.error('getRoutines error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve routines.', error: err.message });
  }
};

exports.getTodayRoutines = async (req, res) => {
  try {
    const pool = await getPool();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];

    let query = `
      SELECT r.*, 
             c.course_code, c.course_title, c.credits,
             u.full_name AS teacher_name,
             d.department_code
      FROM ClassRoutines r
      INNER JOIN Courses c ON r.course_id = c.course_id
      LEFT JOIN Users u ON r.teacher_id = u.user_id
      INNER JOIN Departments d ON r.department_id = d.department_id
      WHERE r.day_of_week = @today
    `;

    const request = pool.request().input('today', sql.VarChar, todayName);

    if (req.user.role === 'STUDENT') {
      if (req.user.department_id) {
        query += ` AND r.department_id = @deptId`;
        request.input('deptId', sql.Int, req.user.department_id);
      }
      if (req.user.semester) {
        query += ` AND r.semester = @sem`;
        request.input('sem', sql.Int, req.user.semester);
      }
      if (req.user.section) {
        query += ` AND r.section = @sec`;
        request.input('sec', sql.VarChar, req.user.section);
      }
    } else if (req.user.role === 'TEACHER') {
      query += ` AND r.teacher_id = @tid`;
      request.input('tid', sql.Int, req.user.user_id);
    }

    query += ` ORDER BY r.start_time ASC`;

    const result = await request.query(query);
    return res.json({ success: true, today: todayName, routines: result.recordset });
  } catch (err) {
    console.error('getTodayRoutines error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch today\'s routine.', error: err.message });
  }
};

exports.createRoutine = async (req, res) => {
  const { course_id, teacher_id, department_id, semester, section, day_of_week, start_time, end_time, room_number } = req.body;

  if (!course_id || !department_id || !semester || !section || !day_of_week || !start_time || !end_time || !room_number) {
    return res.status(400).json({ success: false, message: 'Please provide all required routine schedule details.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('cid', sql.Int, course_id)
      .input('tid', sql.Int, teacher_id || null)
      .input('dept', sql.Int, department_id)
      .input('sem', sql.Int, semester)
      .input('sec', sql.VarChar, section)
      .input('day', sql.VarChar, day_of_week)
      .input('start', sql.VarChar, start_time)
      .input('end', sql.VarChar, end_time)
      .input('room', sql.NVarChar, room_number)
      .query(`
        INSERT INTO ClassRoutines (course_id, teacher_id, department_id, semester, section, day_of_week, start_time, end_time, room_number)
        OUTPUT INSERTED.*
        VALUES (@cid, @tid, @dept, @sem, @sec, @day, @start, @end, @room);
      `);

    return res.status(201).json({ success: true, message: 'Class schedule added.', routine: result.recordset[0] });
  } catch (err) {
    console.error('createRoutine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add class routine.', error: err.message });
  }
};

exports.deleteRoutine = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM ClassRoutines WHERE routine_id = @id');
    return res.json({ success: true, message: 'Routine entry deleted.' });
  } catch (err) {
    console.error('deleteRoutine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete routine.', error: err.message });
  }
};
