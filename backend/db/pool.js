const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon's SSL
  },
  // Set default schema explicitly
  searchPath: 'public'
});

module.exports = pool;
