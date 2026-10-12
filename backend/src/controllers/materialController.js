const { getPool, sql } = require('../config/db');

exports.getMaterials = async (req, res) => {
  const { course_id, topic, search } = req.query;

  try {
    const pool = await getPool();
    let query = `
      SELECT m.*, 
             c.course_code, c.course_title,
             u.full_name AS uploader_name, u.role AS uploader_role
      FROM LearningMaterials m
      INNER JOIN Courses c ON m.course_id = c.course_id
      INNER JOIN Users u ON m.uploaded_by = u.user_id
      WHERE 1=1
    `;

    const request = pool.request();

    if (course_id) {
      query += ` AND m.course_id = @cid`;
      request.input('cid', sql.Int, parseInt(course_id));
    }

    if (topic) {
      query += ` AND m.topic = @topic`;
      request.input('topic', sql.NVarChar, topic);
    }

    if (search) {
      query += ` AND (m.title LIKE @search OR m.description LIKE @search OR m.topic LIKE @search)`;
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    query += ` ORDER BY m.created_at DESC`;

    const result = await request.query(query);
    return res.json({ success: true, count: result.recordset.length, materials: result.recordset });
  } catch (err) {
    console.error('getMaterials error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve materials.', error: err.message });
  }
};

exports.uploadMaterial = async (req, res) => {
  const { course_id, title, description, topic, file_url, file_type = 'PDF' } = req.body;

  if (!course_id || !title || !file_url) {
    return res.status(400).json({ success: false, message: 'Course, title, and file URL are required.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('cid', sql.Int, course_id)
      .input('title', sql.NVarChar, title)
      .input('desc', sql.NVarChar, description || null)
      .input('topic', sql.NVarChar, topic || null)
      .input('file', sql.NVarChar, file_url)
      .input('type', sql.VarChar, file_type)
      .input('uploader', sql.Int, req.user.user_id)
      .query(`
        INSERT INTO LearningMaterials (course_id, title, description, topic, file_url, file_type, uploaded_by)
        OUTPUT INSERTED.*
        VALUES (@cid, @title, @desc, @topic, @file, @type, @uploader);
      `);

    // Notify enrolled students
    const courseRes = await pool.request().input('cid', sql.Int, course_id).query('SELECT course_code, course_title FROM Courses WHERE course_id = @cid');
    const course = courseRes.recordset[0];

    await pool.request()
      .input('title', sql.NVarChar, `New Material: ${title}`)
      .input('msg', sql.NVarChar, `Learning resource uploaded for ${course.course_code} (${course.course_title}).`)
      .input('cid', sql.Int, course_id)
      .query(`
        INSERT INTO Notifications (user_id, title, message, type, reference_id)
        SELECT student_id, @title, @msg, 'Material', @cid
        FROM CourseEnrollments
        WHERE course_id = @cid
      `);

    return res.status(201).json({ success: true, message: 'Learning material added successfully.', material: result.recordset[0] });
  } catch (err) {
    console.error('uploadMaterial error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload material.', error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM LearningMaterials WHERE material_id = @id');
    return res.json({ success: true, message: 'Material deleted successfully.' });
  } catch (err) {
    console.error('deleteMaterial error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete material.', error: err.message });
  }
};
