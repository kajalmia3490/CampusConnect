const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const pool = await getPool();
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM Users WHERE role = 'STUDENT') AS total_students,
        (SELECT COUNT(*) FROM Users WHERE role = 'TEACHER') AS total_teachers,
        (SELECT COUNT(*) FROM Users WHERE role = 'STAFF') AS total_staff,
        (SELECT COUNT(*) FROM Courses) AS total_courses,
        (SELECT COUNT(*) FROM Notices) AS total_notices,
        (SELECT COUNT(*) FROM Complaints WHERE status IN ('Pending', 'Under Review', 'In Progress')) AS pending_complaints,
        (SELECT COUNT(*) FROM CampusEvents WHERE status = 'Upcoming') AS upcoming_events,
        (SELECT COUNT(*) FROM LostAndFound WHERE status = 'Active') AS active_lost_found
    `;

    const result = await pool.request().query(statsQuery);
    return res.json({ success: true, stats: result.recordset[0] });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve stats.', error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  const { role, department_id, search } = req.query;

  try {
    const pool = await getPool();
    let query = `
      SELECT u.user_id, u.university_id, u.full_name, u.email, u.role, 
             u.department_id, d.department_code, d.department_name,
             u.semester, u.section, u.phone, u.avatar_url, u.is_active, u.created_at
      FROM Users u
      LEFT JOIN Departments d ON u.department_id = d.department_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (role) {
      query += ` AND u.role = @role`;
      request.input('role', sql.VarChar, role);
    }

    if (department_id) {
      query += ` AND u.department_id = @deptId`;
      request.input('deptId', sql.Int, parseInt(department_id));
    }

    if (search) {
      query += ` AND (u.full_name LIKE @search OR u.university_id LIKE @search OR u.email LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC`;

    const result = await request.query(query);
    return res.json({ success: true, count: result.recordset.length, users: result.recordset });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.', error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { university_id, full_name, email, password, role, department_id, semester, section, phone } = req.body;

  if (!university_id || !full_name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Required fields: university_id, full_name, email, password, role.' });
  }

  try {
    const pool = await getPool();
    const existing = await pool.request()
      .input('uid', sql.VarChar, university_id.trim())
      .input('email', sql.VarChar, email.trim())
      .query('SELECT user_id FROM Users WHERE university_id = @uid OR email = @email');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'User with this ID or Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('uid', sql.VarChar, university_id.trim())
      .input('name', sql.NVarChar, full_name.trim())
      .input('email', sql.VarChar, email.trim().toLowerCase())
      .input('pwd', sql.VarChar, hashedPassword)
      .input('role', sql.VarChar, role.toUpperCase())
      .input('deptId', sql.Int, department_id || null)
      .input('sem', sql.Int, semester || null)
      .input('sec', sql.VarChar, section || null)
      .input('phone', sql.VarChar, phone || null)
      .query(`
        INSERT INTO Users (university_id, full_name, email, password_hash, role, department_id, semester, section, phone)
        OUTPUT INSERTED.user_id, INSERTED.university_id, INSERTED.full_name, INSERTED.email, INSERTED.role
        VALUES (@uid, @name, @email, @pwd, @role, @deptId, @sem, @sec, @phone);
      `);

    return res.status(201).json({ success: true, message: 'User created successfully.', user: result.recordset[0] });
  } catch (err) {
    console.error('createUser error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create user.', error: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        UPDATE Users
        SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END
        OUTPUT INSERTED.user_id, INSERTED.university_id, INSERTED.full_name, INSERTED.is_active
        WHERE user_id = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, message: 'User status updated.', user: result.recordset[0] });
  } catch (err) {
    console.error('toggleUserStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle status.', error: err.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT d.*,
             (SELECT COUNT(*) FROM Users u WHERE u.department_id = d.department_id AND u.role = 'STUDENT') AS students_count,
             (SELECT COUNT(*) FROM Users u WHERE u.department_id = d.department_id AND u.role = 'TEACHER') AS teachers_count,
             (SELECT COUNT(*) FROM Courses c WHERE c.department_id = d.department_id) AS courses_count
      FROM Departments d
      ORDER BY d.department_name ASC
    `);

    return res.json({ success: true, departments: result.recordset });
  } catch (err) {
    console.error('getDepartments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch departments.', error: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  const { department_code, department_name } = req.body;

  if (!department_code || !department_name) {
    return res.status(400).json({ success: false, message: 'Department code and name are required.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('code', sql.VarChar, department_code.toUpperCase().trim())
      .input('name', sql.NVarChar, department_name.trim())
      .query(`
        INSERT INTO Departments (department_code, department_name)
        OUTPUT INSERTED.*
        VALUES (@code, @name);
      `);

    return res.status(201).json({ success: true, message: 'Department created.', department: result.recordset[0] });
  } catch (err) {
    console.error('createDepartment error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create department.', error: err.message });
  }
};
