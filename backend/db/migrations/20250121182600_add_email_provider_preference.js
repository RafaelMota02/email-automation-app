exports.up = function(knex) {
  return knex.schema.table('users', function(table) {
    // Add email provider preference (sendgrid or smtp)
    table.string('email_provider').defaultTo('sendgrid').notNullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('email_provider');
  });
};
