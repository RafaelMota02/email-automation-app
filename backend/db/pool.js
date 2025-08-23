const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: 'localhost',
  user: 'rafael',
  password: 'your_password',
  database: 'email_automation',
  port: 5432
});

module.exports = pool;
