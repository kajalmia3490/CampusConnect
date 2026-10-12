const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { getPool } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const routineRoutes = require('./routes/routineRoutes');
const courseRoutes = require('./routes/courseRoutes');
const materialRoutes = require('./routes/materialRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const lostFoundRoutes = require('./routes/lostFoundRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT DB_NAME() AS db, GETDATE() AS serverTime');
    return res.json({
      status: 'UP',
      app: 'CampusConnect API',
      database: 'Connected to MS SQL Server',
      dbName: result.recordset[0].db,
      serverTime: result.recordset[0].serverTime
    });
  } catch (err) {
    return res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/lostfound', lostFoundRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Root fallback
app.get('/', (req, res) => {
  res.send('CampusConnect Backend API (Node.js + MS SQL Server) is running.');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(` CampusConnect Server running on port ${PORT}`);
  console.log(` Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(` Connected to MS SQL Server on instance: ${process.env.DB_INSTANCE || 'KAJAL'}`);
  console.log(`====================================================`);
  try {
    await getPool();
    const autoInitDatabase = require('./database/autoInit');
    await autoInitDatabase();
  } catch (err) {
    console.error('Initial DB connection attempt failed:', err.message);
  }
});
