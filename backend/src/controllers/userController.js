const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/db');

exports.updateProfile = async (req, res) => {
  const { phone, avatar_url, full_name } = req.body;

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .input('name', sql.NVarChar, full_name || req.user.full_name)
      .input('phone', sql.VarChar, phone || req.user.phone)
      .input('avatar', sql.NVarChar, avatar_url || req.user.avatar_url)
      .query(`
        UPDATE Users
        SET full_name = @name, phone = @phone, avatar_url = @avatar
        OUTPUT INSERTED.user_id, INSERTED.university_id, INSERTED.full_name, INSERTED.email, INSERTED.role, 
               INSERTED.department_id, INSERTED.semester, INSERTED.section, INSERTED.phone, INSERTED.avatar_url
        WHERE user_id = @uid;
      `);

    return res.json({ success: true, message: 'Profile updated successfully.', user: result.recordset[0] });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  try {
    const pool = await getPool();
    const userRes = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query('SELECT password_hash FROM Users WHERE user_id = @uid');

    const isMatch = await bcrypt.compare(currentPassword, userRes.recordset[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .input('pwd', sql.VarChar, hashed)
      .query('UPDATE Users SET password_hash = @pwd WHERE user_id = @uid');

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ success: false, message: 'Failed to change password.', error: err.message });
  }
};
