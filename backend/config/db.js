const { Sequelize } = require('sequelize');
require('dotenv').config();

// Optional: quick sanity check (don’t log the full URL in production)
console.log('DB_URL present:', !!process.env.DB_URL);

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,

  // Important for Supabase (pooler) on Render
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },

  // Prevent hanging forever during startup
  pool: {
    max: 5,
    min: 0,
    acquire: 20000, // 20s timeout to acquire a connection
    idle: 10000,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Database Connected...');
  } catch (error) {
    // 🔥 FULL ERROR (do not hide details)
    console.error('❌ DB FULL ERROR:', error);

    // Helpful, targeted hints
    if (error?.original) {
      console.error('🔎 DB ORIGINAL:', error.original);
    }
    if (error?.parent) {
      console.error('🔎 DB PARENT:', error.parent);
    }

    console.error('🧭 Hints:');
    console.error('- Check DB_URL format (must include @ before host)');
    console.error('- Ensure password is URL-encoded (Wasim%40369)');
    console.error('- Use pooler host + port 6543 (IPv4)');
    console.error('- Verify credentials in Supabase dashboard');

    process.exit(1); // fail fast so Render doesn’t keep a broken instance
  }
};

module.exports = { sequelize, connectDB };