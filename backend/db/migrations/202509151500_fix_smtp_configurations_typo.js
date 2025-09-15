exports.up = function(knex) {
  return knex.schema.alterTable('campaigns', function(table) {
    table.dropForeign('smtp_config_id');
    table.foreign('smtp_config_id')
      .references('id')
      .inTable('smtp_configurations')
      .onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('campaigns', function(table) {
    table.dropForeign('smtp_config_id');
    table.foreign('smtp_config_id')
      .references('id')
      .inTable('smtp_configurations') // This was misspelled as 'smtp_configurations' in production
      .onDelete('SET NULL');
  });
};
