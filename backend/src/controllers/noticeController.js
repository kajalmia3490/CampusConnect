const { getPool, sql } = require('../config/db');

exports.getNotices = async (req, res) => {
  const { category, priority, department_id, search } = req.query;

  try {
    const pool = await getPool();
    let query = `
      SELECT n.*, 
             u.full_name AS author_name, u.role AS author_role,
             d.department_code, d.department_name
      FROM Notices n
      INNER JOIN Users u ON n.author_id = u.user_id
      LEFT JOIN Departments d ON n.department_id = d.department_id
      WHERE (n.expires_at IS NULL OR n.expires_at >= GETDATE())
    `;

    const request = pool.request();

    if (category) {
      query += ` AND n.category = @category`;
      request.input('category', sql.VarChar, category);
    }

    if (priority) {
      query += ` AND n.priority = @priority`;
      request.input('priority', sql.VarChar, priority);
    }

    if (department_id) {
      query += ` AND (n.department_id = @deptId OR n.department_id IS NULL)`;
      request.input('deptId', sql.Int, parseInt(department_id));
    }

    if (search) {
      query += ` AND (n.title LIKE @search OR n.content LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += ` ORDER BY CASE WHEN n.priority = 'Urgent' THEN 1 WHEN n.priority = 'High' THEN 2 ELSE 3 END, n.created_at DESC`;

    const result = await request.query(query);
    return res.json({ success: true, count: result.recordset.length, notices: result.recordset });
  } catch (err) {
    console.error('getNotices error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notices.', error: err.message });
  }
};

exports.getNoticeById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT n.*, 
               u.full_name AS author_name, u.role AS author_role,
               d.department_code, d.department_name
        FROM Notices n
        INNER JOIN Users u ON n.author_id = u.user_id
        LEFT JOIN Departments d ON n.department_id = d.department_id
        WHERE n.notice_id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Notice not found.' });
    }

    return res.json({ success: true, notice: result.recordset[0] });
  } catch (err) {
    console.error('getNoticeById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notice.', error: err.message });
  }
};

exports.createNotice = async (req, res) => {
  const { title, content, category = 'General', priority = 'Normal', department_id, attachment_url, expires_at } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Notice title and content are required.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('content', sql.NVarChar, content)
      .input('category', sql.VarChar, category)
      .input('priority', sql.VarChar, priority)
      .input('deptId', sql.Int, department_id || null)
      .input('authorId', sql.Int, req.user.user_id)
      .input('attach', sql.NVarChar, attachment_url || null)
      .input('expires', sql.DateTime, expires_at ? new Date(expires_at) : null)
      .query(`
        INSERT INTO Notices (title, content, category, priority, department_id, author_id, attachment_url, expires_at)
        OUTPUT INSERTED.*
        VALUES (@title, @content, @category, @priority, @deptId, @authorId, @attach, @expires);
      `);

    // Broadcast in-app notification to all students / users
    await pool.request()
      .input('title', sql.NVarChar, `Notice: ${title}`)
      .input('msg', sql.NVarChar, content.substring(0, 150) + (content.length > 150 ? '...' : ''))
      .input('refId', sql.Int, result.recordset[0].notice_id)
      .query(`
        INSERT INTO Notifications (user_id, title, message, type, reference_id)
        SELECT user_id, @title, @msg, 'Notice', @refId FROM Users WHERE is_active = 1
      `);

    return res.status(201).json({ success: true, message: 'Notice published successfully.', notice: result.recordset[0] });
  } catch (err) {
    console.error('createNotice error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create notice.', error: err.message });
  }
};

exports.deleteNotice = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Notices WHERE notice_id = @id');

    return res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (err) {
    console.error('deleteNotice error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete notice.', error: err.message });
  }
};
