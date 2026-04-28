const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('DB_URL present:', !!process.env.DB_URL);

// ✅ Always enforce proper SSL mode (clean warning)
const rawUrl = process.env.DB_URL || '';
const DB_URL = rawUrl.includes('sslmode=')
  ? rawUrl
  : `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}uselibpqcompat=true&sslmode=require`;

// ✅ Track DB state
let isDBConnected = false;

const sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // 🔥 safe override ONLY for this connection
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

// 🔁 Resilient DB connection (no crash)
const connectDB = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();

    isDBConnected = true;

    console.log('✅ PostgreSQL Database Connected...');
  } catch (error) {
    isDBConnected = false;

    console.error('❌ DB ERROR:', error.message);

    // 🔁 Retry instead of killing server
    setTimeout(connectDB, 5000);
  }
};

module.exports = { sequelize, connectDB, isDBConnected };