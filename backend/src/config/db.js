const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER || 'ES3',
  password: process.env.DB_PASSWORD || 'Admin1234',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1522/XEPDB1',
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

module.exports = {
  oracledb,
  initPool,
  getConnection,
};