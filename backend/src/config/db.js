const sql = require('mssql');
require('dotenv').config();

const options = {
  encrypt: process.env.DB_ENCRYPT === 'true',
  trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
  enableArithAbort: true,
};

// If DB_INSTANCE is explicitly provided and non-empty, use instanceName
if (process.env.DB_INSTANCE && process.env.DB_INSTANCE.trim().length > 0) {
  options.instanceName = process.env.DB_INSTANCE.trim();
}

const dbConfig = {
  user: process.env.DB_USER || 'campus_admin',
  password: process.env.DB_PASSWORD || 'CampusConnect2026!',
  server: process.env.DB_SERVER || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'CampusConnectDB',
  options,
  pool: {
    max: 15,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const { mockPool } = require('./mockDb');

let poolPromise = null;

const getPool = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then(pool => {
        console.log(` Connected to MS SQL Server at ${dbConfig.server}:${dbConfig.port} (DB: ${dbConfig.database})`);
        return pool;
      })
      .catch(err => {
        console.warn('⚠️ MS SQL Server connection not available:', err.message);
        console.log('🔄 Activating Cloud In-Memory Database Fallback for seamless online hosting.');
        return mockPool;
      });
  }
  return poolPromise;
};

module.exports = {
  sql,
  getPool
};
