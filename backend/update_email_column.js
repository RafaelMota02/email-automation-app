const pool = require('./db/pool');

async function updateEmailColumn() {
  try {
    const client = await pool.connect();
    await client.query('UPDATE saved_databases SET email_column = $1 WHERE id = $2', ['email', 1]);
    console.log('Successfully updated database 1 email_column to "email"');
    client.release();
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await pool.end();
  }
}

updateEmailColumn();
