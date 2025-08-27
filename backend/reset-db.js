const Knex = require('knex');
const knexConfig = require('./knexfile');
const knex = Knex(knexConfig.development);
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  try {
    // Get all migration files
    const migrationDir = path.join(__dirname, 'db', 'migrations');
    const migrationFiles = fs.readdirSync(migrationDir);
    
    // Drop all tables in reverse dependency order
    await knex.raw(`
      DROP TABLE IF EXISTS campaigns CASCADE;
      DROP TABLE IF EXISTS saved_databases CASCADE;
      DROP TABLE IF EXISTS smtp_configurations CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS knex_migrations CASCADE;
      DROP TABLE IF EXISTS knex_migrations_lock CASCADE;
    `);
    
    console.log('✅ Dropped all tables');
    
    // Recreate migrations tables
    await knex.migrate.forceFreeMigrationsLock();
    await knex.migrate.latest();
    
    console.log('✅ Recreated database schema');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
