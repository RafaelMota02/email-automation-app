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
      disableMigrationsListValidation: true
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};
