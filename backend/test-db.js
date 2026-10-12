const sql = require('mssql');

const config = {
  user: 'campus_admin',
  password: 'CampusConnect2026!',
  server: '127.0.0.1',
  database: 'CampusConnectDB',
  options: {
    instanceName: 'KAJAL',
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  }
};

async function test() {
  try {
    console.log('Connecting to MS SQL Server...');
    const pool = await sql.connect(config);
    console.log('Connected successfully!');
    const result = await pool.request().query('SELECT @@VERSION AS version, DB_NAME() AS currentDb');
    console.log('Result:', result.recordset);
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

test();
