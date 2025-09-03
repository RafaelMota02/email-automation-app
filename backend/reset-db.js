const Knex = require('knex');
const knexConfig = require('./knexfile');
const knex = Knex(knexConfig.development);

async function resetDatabase() {
  try {
    // Drop all tables
    await knex.raw(`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN 
        FOR r IN 
          (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
        LOOP 
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; 
        END LOOP; 
      END $$;
    `);
    
    console.log('✅ Dropped all tables');
    
    // Recreate migrations tables
    await knex.raw(`CREATE TABLE IF NOT EXISTS knex_migrations (
      id serial PRIMARY KEY,
      name varchar(255),
      batch integer,
      migration_time timestamptz
    )`);
    
    await knex.raw(`CREATE TABLE IF NOT EXISTS knex_migrations_lock (
      index serial PRIMARY KEY,
      is_locked integer
    )`);
    
    console.log('✅ Recreated migrations tables');
    
    // Run all migrations
    await knex.migrate.latest();
    
    console.log('✅ Ran all migrations successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
