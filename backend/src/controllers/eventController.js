const { getPool, sql } = require('../config/db');

exports.getEvents = async (req, res) => {
  try {
    const pool = await getPool();
    const query = `
      SELECT e.*,
             (SELECT COUNT(*) FROM EventRegistrations er WHERE er.event_id = e.event_id) AS registered_count,
             CASE 
               WHEN EXISTS(SELECT 1 FROM EventRegistrations er WHERE er.event_id = e.event_id AND er.user_id = @userId) 
               THEN 1 ELSE 0 
             END AS is_user_registered
      FROM CampusEvents e
      ORDER BY e.event_date ASC
    `;

    const result = await pool.request()
      .input('userId', sql.Int, req.user.user_id)
      .query(query);

    return res.json({ success: true, count: result.recordset.length, events: result.recordset });
  } catch (err) {
    console.error('getEvents error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve events.', error: err.message });
  }
};

exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const eventRes = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, req.user.user_id)
      .query(`
        SELECT e.*,
               (SELECT COUNT(*) FROM EventRegistrations er WHERE er.event_id = e.event_id) AS registered_count,
               CASE 
                 WHEN EXISTS(SELECT 1 FROM EventRegistrations er WHERE er.event_id = e.event_id AND er.user_id = @userId) 
                 THEN 1 ELSE 0 
               END AS is_user_registered
        FROM CampusEvents e
        WHERE e.event_id = @id
      `);

    if (eventRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const attendees = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT er.registered_at, u.user_id, u.university_id, u.full_name, u.email, d.department_code
        FROM EventRegistrations er
        INNER JOIN Users u ON er.user_id = u.user_id
        LEFT JOIN Departments d ON u.department_id = d.department_id
        WHERE er.event_id = @id
        ORDER BY er.registered_at ASC
      `);

    return res.json({
      success: true,
      event: {
        ...eventRes.recordset[0],
        attendees: attendees.recordset
      }
    });
  } catch (err) {
    console.error('getEventById error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve event.', error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  const { title, description, organizer, event_date, venue, capacity = 100, banner_url } = req.body;

  if (!title || !description || !organizer || !event_date || !venue) {
    return res.status(400).json({ success: false, message: 'Title, description, organizer, date, and venue are required.' });
  }

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('desc', sql.NVarChar, description)
      .input('org', sql.NVarChar, organizer)
      .input('date', sql.DateTime, new Date(event_date))
      .input('venue', sql.NVarChar, venue)
      .input('cap', sql.Int, capacity)
      .input('banner', sql.NVarChar, banner_url || null)
      .input('creator', sql.Int, req.user.user_id)
      .query(`
        INSERT INTO CampusEvents (title, description, organizer, event_date, venue, capacity, banner_url, created_by)
        OUTPUT INSERTED.*
        VALUES (@title, @desc, @org, @date, @venue, @cap, @banner, @creator);
      `);

    return res.status(201).json({ success: true, message: 'Campus event created.', event: result.recordset[0] });
  } catch (err) {
    console.error('createEvent error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create event.', error: err.message });
  }
};

exports.registerEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();

    // Check capacity
    const checkRes = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT capacity, 
               (SELECT COUNT(*) FROM EventRegistrations WHERE event_id = @id) AS current_count
        FROM CampusEvents WHERE event_id = @id
      `);

    if (checkRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const { capacity, current_count } = checkRes.recordset[0];
    if (current_count >= capacity) {
      return res.status(400).json({ success: false, message: 'Event registration is full.' });
    }

    // Register
    await pool.request()
      .input('eid', sql.Int, id)
      .input('uid', sql.Int, req.user.user_id)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM EventRegistrations WHERE event_id = @eid AND user_id = @uid)
        BEGIN
          INSERT INTO EventRegistrations (event_id, user_id) VALUES (@eid, @uid);
        END
      `);

    return res.json({ success: true, message: 'Registered for event successfully.' });
  } catch (err) {
    console.error('registerEvent error:', err);
    return res.status(500).json({ success: false, message: 'Failed to register for event.', error: err.message });
  }
};

exports.unregisterEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request()
      .input('eid', sql.Int, id)
      .input('uid', sql.Int, req.user.user_id)
      .query('DELETE FROM EventRegistrations WHERE event_id = @eid AND user_id = @uid');

    return res.json({ success: true, message: 'Registration cancelled.' });
  } catch (err) {
    console.error('unregisterEvent error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel registration.', error: err.message });
  }
};
