module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
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
