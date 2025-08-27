exports.up = function(knex) {
  return knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('campaigns')
    .then(() => {
      return knex.schema.createTable('users', function(table) {
        table.increments('id').primary();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();
        table.timestamps(true, true);
      });
    })
    .then(() => {
      return knex.schema.createTable('campaigns', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.text('content').notNullable();
        table.integer('resend_count').defaultTo(0);
        table.timestamps(true, true);
      });
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('campaigns')
    .dropTableIfExists('users');
};
