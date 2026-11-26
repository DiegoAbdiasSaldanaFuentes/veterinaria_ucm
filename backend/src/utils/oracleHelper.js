const { oracledb, getConnection } = require('../config/db');

function normalizeRow(row) {
  if (!row || typeof row !== 'object') return row;
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeRow);
}

function mapOracleError(err) {
  const message = err && err.message ? err.message : 'Error inesperado en la base de datos';
  const oraMatch = message.match(/ORA-(\d{5}):\s*([^\n]+)/);
  const code = oraMatch ? Number(oraMatch[1]) : null;
  const cleanMsg = oraMatch ? oraMatch[2].trim() : message;

  let statusCode = 500;
  if (code >= 20000 && code <= 20999) {
    statusCode = 400;
  } else if (code === 1 || code === 2290) {
    statusCode = 409;
  } else if (code === 1403) {
    statusCode = 404;
  }

  return { statusCode, message: cleanMsg };
}

async function readCursor(cursor) {
  if (!cursor) return [];
  try {
    const rows = await cursor.getRows(500);
    return normalizeRows(rows || []);
  } finally {
    try {
      await cursor.close();
    } catch (_) {
      // Ignorar si ya estaba cerrado
    }
  }
}

async function executePlsql(plsqlBlock, binds = {}, options = {}) {
  const conn = await getConnection();
  try {
    const result = await conn.execute(plsqlBlock, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: options.autoCommit !== undefined ? options.autoCommit : true,
    });

    const outBinds = result.outBinds || {};
    const parsedData = {};

    for (const [key, val] of Object.entries(outBinds)) {
      if (val && typeof val.getRows === 'function') {
        parsedData[key] = await readCursor(val);
      } else if (Array.isArray(val)) {
        parsedData[key] = normalizeRows(val);
      } else if (val && typeof val === 'object' && !(val instanceof Date) && !Buffer.isBuffer(val)) {
        parsedData[key] = normalizeRow(val);
      } else {
        parsedData[key] = val;
      }
    }

    if (outBinds.o_mensaje && typeof outBinds.o_mensaje === 'string') {
      const msg = outBinds.o_mensaje.trim();
      if (msg.toUpperCase().startsWith('ERROR')) {
        const err = new Error(msg.replace(/^ERROR:\s*/i, ''));
        err.statusCode = 400;
        throw err;
      }
    }

    return parsedData;
  } catch (err) {
    if (err.statusCode) {
      throw err;
    }
    const mapped = mapOracleError(err);
    const wrapped = new Error(mapped.message);
    wrapped.statusCode = mapped.statusCode;
    throw wrapped;
  } finally {
    try {
      await conn.close();
    } catch (_) {
      // Ignorar si ya estaba cerrada
    }
  }
}

module.exports = {
  oracledb,
  executePlsql,
  normalizeRow,
  normalizeRows,
};