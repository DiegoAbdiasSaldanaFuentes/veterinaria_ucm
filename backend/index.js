require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { oracledb, initPool, closePool } = require('./src/config/db');
const { executePlsql } = require('./src/utils/oracleHelper');

const authRoutes = require('./src/routes/authRoutes');
const mantenedoresRoutes = require('./src/routes/mantenedoresRoutes');
const gestoresRoutes = require('./src/routes/gestoresRoutes');
const reportesRoutes = require('./src/routes/reportesRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/mantenedores', mantenedoresRoutes);
app.use('/api/gestores', gestoresRoutes);
app.use('/api/reportes', reportesRoutes);

app.get('/health', async (req, res) => {
  try {
    await executePlsql('BEGIN SELECT 1 INTO :o_ok FROM DUAL; END;', {
      o_ok: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
    });
    return res.status(200).json({
      success: true,
      data: { status: 'ok' },
      message: 'Servidor y pool de Oracle operativos',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || 'Error conectando a Oracle',
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    data: null,
    message: err.message || 'Error interno del servidor',
  });
});

async function start() {
  try {
    await initPool();
    app.listen(PORT, () => {
      console.log(`Backend escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el pool de Oracle:', err.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

start();