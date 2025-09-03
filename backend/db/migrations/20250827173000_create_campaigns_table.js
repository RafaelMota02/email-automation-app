exports.up = function(knex) {
  return knex.schema.createTableIfNotExists('campaigns', function(table) {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('subject').notNullable();
    table.text('template').notNullable();
    table.jsonb('recipients').notNullable();
    table.jsonb('variables').notNullable();
    table.timestamp('sent_at').nullable();
    table.jsonb('send_results').nullable();
    table.integer('database_id').nullable().references('id').inTable('saved_databases').onDelete('SET NULL');
    table.string('file_name').nullable();
    table.integer('resend_count').defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('campaigns');
};
