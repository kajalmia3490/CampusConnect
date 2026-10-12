const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');
const { secret, expiresIn } = require('../config/jwt');

exports.login = async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or university_id

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please provide Student/Employee ID or Email and password.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.VarChar, identifier.trim())
      .query(`
        SELECT u.*, d.department_code, d.department_name
        FROM Users u
        LEFT JOIN Departments d ON u.department_id = d.department_id
        WHERE (u.email = @id OR u.university_id = @id)
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const user = result.recordset[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Please contact administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please check and try again.' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, email: user.email },
      secret,
      { expiresIn }
    );

    // Remove password_hash from response
    delete user.password_hash;

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.', error: err.message });
  }
};

exports.register = async (req, res) => {
  const { university_id, full_name, email, password, role = 'STUDENT', department_id, semester, section, phone } = req.body;

  if (!university_id || !full_name || !email || !password) {
    return res.status(400).json({ success: false, message: 'university_id, full_name, email and password are required.' });
  }

  try {
    const pool = await getPool();

    // Check existing
    const existing = await pool.request()
      .input('uid', sql.VarChar, university_id.trim())
      .input('email', sql.VarChar, email.trim())
      .query('SELECT user_id FROM Users WHERE university_id = @uid OR email = @email');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'User with this University ID or Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.request()
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
        OUTPUT INSERTED.user_id
        VALUES (@uid, @name, @email, @pwd, @role, @deptId, @sem, @sec, @phone);
      `);

    const newUserId = insertResult.recordset[0].user_id;

    const token = jwt.sign(
      { userId: newUserId, role: role.toUpperCase(), email },
      secret,
      { expiresIn }
    );

    // Welcome notification
    await pool.request()
      .input('uid', sql.Int, newUserId)
      .input('title', sql.NVarChar, 'Welcome to CampusConnect!')
      .input('msg', sql.NVarChar, 'Your account is ready. Access routines, notices, courses, and campus services seamlessly.')
      .query('INSERT INTO Notifications (user_id, title, message, type) VALUES (@uid, @title, @msg, \'General\')');

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        user_id: newUserId,
        university_id,
        full_name,
        email,
        role: role.toUpperCase(),
        department_id,
        semester,
        section,
        phone
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};
