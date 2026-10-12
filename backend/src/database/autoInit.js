const fs = require('fs');
const path = require('path');
const { getPool, sql } = require('../config/db');

async function autoInitDatabase() {
  try {
    const pool = await getPool();
    
    // Check if tables already exist
    const checkRes = await pool.request().query("SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users'");
    if (checkRes.recordset[0].cnt > 0) {
      console.log(' Database tables already initialized.');
      return;
    }

    console.log(' New database detected! Initializing schema from schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    // Execute schema statements
    const batches = schemaSql.split(/;\s*[\r\n]+/);
    for (const batch of batches) {
      if (batch.trim()) {
        try {
          await pool.request().query(batch);
        } catch (batchErr) {
          // ignore existing object error
        }
      }
    }
    console.log(' Schema initialized successfully.');

    // Seed data
    console.log(' Seeding default demo users & courses...');
    require('./seedData');
  } catch (err) {
    console.error(' Auto-init warning (non-fatal):', err.message);
  }
}

module.exports = autoInitDatabase;
