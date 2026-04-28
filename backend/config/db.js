process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // 🔥 allow self-signed certs (Supabase pooler)

const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('DB_URL present:', !!process.env.DB_URL);

// Ensure sslmode=require is always present
const rawUrl = process.env.DB_URL || '';
const DB_URL = rawUrl.includes('sslmode=require')
  ? rawUrl
  : `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}sslmode=require`;

const sequelize = new Sequelize(DB_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // 🔥 fix self-signed cert issue
    },
    connectTimeout: 30000, // 🔥 prevent ETIMEDOUT
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
    max: 3, // retry transient failures
  },
});

const connectDB = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Database Connected...');
  } catch (error) {
    console.error('❌ DB FULL ERROR:', error);

    if (error?.original) console.error('🔎 DB ORIGINAL:', error.original);
    if (error?.parent) console.error('🔎 DB PARENT:', error.parent);

    console.error('🧭 Hints:');
    console.error('- Use pooler host (aws-...pooler.supabase.com) + port 6543');
    console.error('- Password must be URL-encoded (Wasim%40369)');
    console.error('- DB_URL must include ?sslmode=require');
    console.error('- Ensure no spaces or quotes in DB_URL');

    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };