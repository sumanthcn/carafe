'use strict';

/**
 * Migration: rename orders.status → orders.order_status
 *
 * Required because Strapi 5 treats "status" as a reserved field name
 * for the document publication system (draft/published). Having a custom
 * field with the same name causes the Strapi admin to throw
 * "Validation error: Invalid status" when saving.
 */

module.exports = {
  async up(knex) {
    const hasColumn = await knex.schema.hasColumn('orders', 'status');
    if (hasColumn) {
      await knex.schema.table('orders', (table) => {
        table.renameColumn('status', 'order_status');
      });
    }
  },

  async down(knex) {
    const hasColumn = await knex.schema.hasColumn('orders', 'order_status');
    if (hasColumn) {
      await knex.schema.table('orders', (table) => {
        table.renameColumn('order_status', 'status');
      });
    }
  },
};
