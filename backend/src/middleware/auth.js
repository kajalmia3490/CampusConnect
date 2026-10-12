const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');
const { getPool, sql } = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const pool = await getPool();
    const userRes = await pool.request()
      .input('userId', sql.Int, decoded.userId)
      .query(`
        SELECT u.user_id, u.university_id, u.full_name, u.email, u.role, 
               u.department_id, d.department_code, d.department_name,
               u.semester, u.section, u.phone, u.avatar_url, u.is_active
        FROM Users u
        LEFT JOIN Departments d ON u.department_id = d.department_id
        WHERE u.user_id = @userId AND u.is_active = 1
      `);

    if (userRes.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token or inactive user account.' });
    }

    req.user = userRes.recordset[0];
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

module.exports = authenticateToken;
