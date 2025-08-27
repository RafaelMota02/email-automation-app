exports.up = function(knex) {
  return knex.schema.table('campaigns', function(table) {
    table.integer('resend_count').defaultTo(0);
  });
};

exports.down = function(knex) {
  return knex.schema.table('campaigns', function(table) {
    table.dropColumn('resend_count');
  });
};
