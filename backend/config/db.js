const { Sequelize } = require('sequelize');
require('dotenv').config();

// ✅ Scoped TLS fix (only for this process)
if (process.env.NODE_ENV === 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

console.log('DB_URL present:', !!process.env.DB_URL);

// ✅ Clean SSL params (no warnings)
const rawUrl = process.env.DB_URL || '';
const DB_URL = rawUrl.includes('sslmode=')
  ? rawUrl
  : `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}uselibpqcompat=true&sslmode=require`;

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
});

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();

    isDBConnected = true;

    console.log('✅ PostgreSQL Database Connected...');
  } catch (error) {
    isDBConnected = false;

    console.error('❌ DB ERROR:', error.message);

    // 🔁 Retry (important)
    setTimeout(connectDB, 5000);
  }
};

module.exports = { sequelize, connectDB, isDBConnected };