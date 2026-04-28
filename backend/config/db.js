require('dotenv').config();

// 🔥 Fix self-signed cert issue (ONLY in production)
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const { Sequelize } = require('sequelize');

console.log('DB_URL present:', !!process.env.DB_URL);

// ✅ Ensure proper SSL params (removes warning)
const rawUrl = process.env.DB_URL || '';
const DB_URL = rawUrl.includes('sslmode=')
  ? rawUrl
  : `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}uselibpqcompat=true&sslmode=require`;

// ✅ Track DB state safely
let isDBConnected = false;

const sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
    connectTimeout: 30000,
    keepAlive: true,
  },

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
    evict: 10000,
  },

  retry: {
    max: 3,
  },
});

// ✅ Resilient DB connector (no crashes, auto-retry)
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();

    isDBConnected = true;

    console.log('✅ PostgreSQL Database Connected...');
  } catch (err) {
    isDBConnected = false;

    console.error('❌ DB ERROR:', err.message);

    // 🔁 retry after delay (keeps service alive)
    setTimeout(connectDB, 5000);
  }
};

module.exports = { sequelize, connectDB, isDBConnected };