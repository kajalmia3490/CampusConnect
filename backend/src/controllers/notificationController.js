const { getPool, sql } = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query(`
        SELECT * FROM Notifications
        WHERE user_id = @uid
        ORDER BY created_at DESC
      `);

    const unreadCount = result.recordset.filter(n => !n.is_read).length;

    return res.json({
      success: true,
      unread_count: unreadCount,
      notifications: result.recordset
    });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications.', error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('uid', sql.Int, req.user.user_id)
      .query('UPDATE Notifications SET is_read = 1 WHERE notification_id = @id AND user_id = @uid');

    return res.json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    console.error('markAsRead error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update notification.', error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request()
      .input('uid', sql.Int, req.user.user_id)
      .query('UPDATE Notifications SET is_read = 1 WHERE user_id = @uid');

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('markAllAsRead error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark notifications.', error: err.message });
  }
};
