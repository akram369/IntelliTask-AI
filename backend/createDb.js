const { Client } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
  // Connect to the default 'postgres' database first
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL...');
    
    // Check if database exists
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = 'task_saas'`);
    
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE task_saas');
      console.log('✅ Database "task_saas" created successfully.');
    } else {
      console.log('ℹ️ Database "task_saas" already exists.');
    }
  } catch (err) {
    console.error('❌ Error creating database:', err.message);
  } finally {
    await client.end();
  }
};

createDatabase();
