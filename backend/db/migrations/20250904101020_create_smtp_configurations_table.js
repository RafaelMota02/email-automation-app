exports.up = function(knex) {
  return knex.schema.createTable('smtp_configurations', function(table) {
    table.increments('id').primary();
    table.integer('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.string('host').notNullable();
    table.integer('port').notNullable();
    table.string('username').notNullable();
    table.string('password').notNullable();
    table.string('encryption').notNullable();
    table.string('from_email').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('smtp_configurations');
};
