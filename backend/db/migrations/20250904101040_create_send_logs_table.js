exports.up = function(knex) {
  return knex.schema.createTable('send_logs', function(table) {
    table.increments('id').primary();
    table.integer('campaign_id').notNullable().references('id').inTable('campaigns').onDelete('CASCADE');
    table.string('recipient_email').notNullable();
    table.timestamp('sent_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('success').notNullable();
    table.text('error_message').nullable();
    table.jsonb('metadata').nullable();
    table.index(['campaign_id']);
    table.index(['sent_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('send_logs');
};
