exports.up = function(knex) {
  return knex.schema.createTable('saved_databases', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('email_column').notNullable();
    table.jsonb('data').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('saved_databases');
};
