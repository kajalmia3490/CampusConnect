const { getPool, sql } = require('../config/db');

exports.getComplaints = async (req, res) => {
  const { status, category, priority } = req.query;

  try {
    const pool = await getPool();
    let query = `
      SELECT c.*,
             u.full_name AS student_name, u.university_id AS student_uid, u.email AS student_email,
             s.full_name AS staff_name
      FROM Complaints c
      INNER JOIN Users u ON c.user_id = u.user_id
      LEFT JOIN Users s ON c.assigned_staff_id = s.user_id
      WHERE 1=1
    `;

    const request = pool.request();

    // If STUDENT: only see their own complaints
    if (req.user.role === 'STUDENT') {
      query += ` AND c.user_id = @userId`;
      request.input('userId', sql.Int, req.user.user_id);
    } else if (req.user.role === 'STAFF') {
      // Staff can see all complaints or those assigned to them
      query += ` AND (c.assigned_staff_id = @userId OR c.assigned_staff_id IS NULL)`;
      request.input('userId', sql.Int, req.user.user_id);
    }

    if (status) {
      query += ` AND c.status = @status`;
      request.input('status', sql.VarChar, status);
    }

    if (category) {
      query += ` AND c.category = @category`;
      request.input('category', sql.VarChar, category);
    }

    if (priority) {
      query += ` AND c.priority = @priority`;
      request.input('priority', sql.VarChar, priority);
    }

    query += ` ORDER BY c.created_at DESC`;

    const result = await request.query(query);
    return res.json({ success: true, count: result.recordset.length, complaints: result.recordset });
  } catch (err) {
    console.error('getComplaints error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve complaints.', error: err.message });
  }
};

exports.getComplaintById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT c.*,
               u.full_name AS student_name, u.university_id AS student_uid, u.email AS student_email, u.phone AS student_phone,
               s.full_name AS staff_name, s.email AS staff_email
        FROM Complaints c
        INNER JOIN Users u ON c.user_id = u.user_id
        LEFT JOIN Users s ON c.assigned_staff_id = s.user_id
        WHERE c.complaint_id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const complaint = result.recordset[0];

    // Check permission: Student can only view their own
    if (req.user.role === 'STUDENT' && complaint.user_id !== req.user.user_id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Get timeline
    const timelineRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT t.*, u.full_name AS updater_name, u.role AS updater_role
        FROM ComplaintTimelines t
        INNER JOIN Users u ON t.updated_by = u.user_id
        WHERE t.complaint_id = @id
        ORDER BY t.created_at ASC
      `);

    return res.json({
      success: true,
      complaint: {
        ...complaint,
        timeline: timelineRes.recordset
      }
    });
  } catch (err) {
    console.error('getComplaintById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve complaint.', error: err.message });
  }
};

exports.createComplaint = async (req, res) => {
  const { title, category, priority = 'Medium', description, location, image_url } = req.body;

  if (!title || !category || !description || !location) {
    return res.status(400).json({ success: false, message: 'Title, category, description, and location are required.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('cat', sql.VarChar, category)
      .input('pri', sql.VarChar, priority)
      .input('desc', sql.NVarChar, description)
      .input('loc', sql.NVarChar, location)
      .input('img', sql.NVarChar, image_url || null)
      .input('uid', sql.Int, req.user.user_id)
      .query(`
        INSERT INTO Complaints (title, category, priority, description, location, image_url, status, user_id)
        OUTPUT INSERTED.*
        VALUES (@title, @cat, @pri, @desc, @loc, @img, 'Pending', @uid);
      `);

    const newComplaint = result.recordset[0];

    // Add initial timeline
    await pool.request()
      .input('cid', sql.Int, newComplaint.complaint_id)
      .input('status', sql.VarChar, 'Pending')
      .input('remarks', sql.NVarChar, 'Complaint ticket submitted by user.')
      .input('uid', sql.Int, req.user.user_id)
      .query(`
        INSERT INTO ComplaintTimelines (complaint_id, status, remarks, updated_by)
        VALUES (@cid, @status, @remarks, @uid);
      `);

    return res.status(201).json({ success: true, message: 'Complaint registered successfully.', complaint: newComplaint });
  } catch (err) {
    console.error('createComplaint error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create complaint.', error: err.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  const { id } = req.params;
  const { status, remarks = '', assigned_staff_id } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required.' });
  }

  try {
    const pool = await getPool();

    const updateRequest = pool.request()
      .input('id', sql.Int, id)
      .input('status', sql.VarChar, status);

    let updateSql = `
      UPDATE Complaints
      SET status = @status, updated_at = GETDATE()
    `;

    if (assigned_staff_id !== undefined) {
      updateSql += `, assigned_staff_id = @staffId`;
      updateRequest.input('staffId', sql.Int, assigned_staff_id || null);
    } else if (req.user.role === 'STAFF') {
      updateSql += `, assigned_staff_id = @staffId`;
      updateRequest.input('staffId', sql.Int, req.user.user_id);
    }

    updateSql += ` OUTPUT INSERTED.* WHERE complaint_id = @id;`;

    const result = await updateRequest.query(updateSql);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const updated = result.recordset[0];

    // Add timeline entry
    await pool.request()
      .input('cid', sql.Int, id)
      .input('status', sql.VarChar, status)
      .input('remarks', sql.NVarChar, remarks || `Status updated to ${status}`)
      .input('uid', sql.Int, req.user.user_id)
      .query(`
        INSERT INTO ComplaintTimelines (complaint_id, status, remarks, updated_by)
        VALUES (@cid, @status, @remarks, @uid);
      `);

    // Notify student
    await pool.request()
      .input('uid', sql.Int, updated.user_id)
      .input('title', sql.NVarChar, `Complaint Update: ${updated.title}`)
      .input('msg', sql.NVarChar, `Status updated to: ${status}. Remarks: ${remarks || 'In review.'}`)
      .input('cid', sql.Int, updated.complaint_id)
      .query(`
        INSERT INTO Notifications (user_id, title, message, type, reference_id)
        VALUES (@uid, @title, @msg, 'Complaint', @cid);
      `);

    return res.json({ success: true, message: 'Complaint status updated.', complaint: updated });
  } catch (err) {
    console.error('updateComplaintStatus error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update status.', error: err.message });
  }
};
