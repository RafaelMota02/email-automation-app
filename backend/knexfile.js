module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'email_automation'
    },
    migrations: {
      directory: './db/migrations',
      loadExtensions: ['.js'],
      sortDirsSeparately: true,
      disableMigrationsListValidation: true,
      migrationSource: new (require('knex/lib/migrations/migration-source'))({
        getMigrations() {
          return Promise.resolve([
            '20250827155300_create_users_table',
            '20250821170000_add_resend_count_to_campaigns_fix',
            '20250827162000_reset_database'
          ]);
        }
      })
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};
