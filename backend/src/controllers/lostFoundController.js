const { getPool, sql } = require('../config/db');

exports.getItems = async (req, res) => {
  const { type, category, status = 'Active', search } = req.query;

  try {
    const pool = await getPool();
    let query = `
      SELECT lf.*,
             u.full_name AS poster_name, u.university_id AS poster_uid, u.email AS poster_email
      FROM LostAndFound lf
      INNER JOIN Users u ON lf.user_id = u.user_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (type) {
      query += ` AND lf.type = @type`;
      request.input('type', sql.VarChar, type);
    }

    if (category) {
      query += ` AND lf.category = @cat`;
      request.input('cat', sql.VarChar, category);
    }

    if (status && status !== 'all') {
      query += ` AND lf.status = @status`;
      request.input('status', sql.VarChar, status);
    }

    if (search) {
      query += ` AND (lf.title LIKE @search OR lf.description LIKE @search OR lf.location LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += ` ORDER BY lf.created_at DESC`;

    const result = await request.query(query);
    return res.json({ success: true, count: result.recordset.length, items: result.recordset });
  } catch (err) {
    console.error('getLostFoundItems error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve items.', error: err.message });
  }
};

exports.createItem = async (req, res) => {
  const { type, title, category, description, location, item_date, contact_info, image_url } = req.body;

  if (!type || !title || !category || !description || !location || !contact_info) {
    return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('type', sql.VarChar, type)
      .input('title', sql.NVarChar, title)
      .input('cat', sql.VarChar, category)
      .input('desc', sql.NVarChar, description)
      .input('loc', sql.NVarChar, location)
      .input('date', sql.DateTime, item_date ? new Date(item_date) : new Date())
      .input('contact', sql.NVarChar, contact_info)
      .input('img', sql.NVarChar, image_url || null)
      .input('uid', sql.Int, req.user.user_id)
      .query(`
        INSERT INTO LostAndFound (type, title, category, description, location, item_date, contact_info, image_url, status, user_id)
        OUTPUT INSERTED.*
        VALUES (@type, @title, @cat, @desc, @loc, @date, @contact, @img, 'Active', @uid);
      `);

    return res.status(201).json({ success: true, message: 'Item reported successfully.', item: result.recordset[0] });
  } catch (err) {
    console.error('createLostFoundItem error:', err);
    return res.status(500).json({ success: false, message: 'Failed to report item.', error: err.message });
  }
};

exports.updateItemStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Active', 'Claimed', 'Returned'

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.VarChar, status)
      .query(`
        UPDATE LostAndFound
        SET status = @status
        OUTPUT INSERTED.*
        WHERE item_id = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    return res.json({ success: true, message: 'Status updated successfully.', item: result.recordset[0] });
  } catch (err) {
    console.error('updateLostFoundStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update status.', error: err.message });
  }
};
