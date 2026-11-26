const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER || 'ES3',
  password: process.env.DB_PASSWORD || 'Admin1234',
  connectString: process.env.DB_CONNECT_STRING || '192.168.56.1:1522/XEPDB1',
};

let pool;

async function initPool() {
  if (!pool) {
    pool = await oracledb.createPool(dbConfig);
  }
  return pool;
}

async function getConnection() {
  const activePool = await initPool();
  return activePool.getConnection();
}

async function closePool() {
  if (pool) {
    try {
      await pool.close(10);
    } finally {
      pool = null;
    }
  }
}

module.exports = {
  oracledb,
  initPool,
  getConnection,
  closePool,
};


