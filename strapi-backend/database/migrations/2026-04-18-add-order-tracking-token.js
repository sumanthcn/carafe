'use strict';

/**
 * Migration: Add order_tracking_token column to orders table
 *
 * orderTrackingToken is used by the track-order page so guests can look up
 * their order without a login.  The field is marked `private` in the
 * content-type schema (never returned in API responses) but must exist in
 * the DB so Strapi can query against it.
 */

module.exports = {
  async up(knex) {
    const hasColumn = await knex.schema.hasColumn('orders', 'order_tracking_token');
    if (!hasColumn) {
      await knex.schema.table('orders', (table) => {
        table.string('order_tracking_token', 255).nullable().unique();
      });
      console.log('✓ Added orders.order_tracking_token');
    } else {
      console.log('→ orders.order_tracking_token already exists, skipping');
    }
  },

  async down(knex) {
    const hasColumn = await knex.schema.hasColumn('orders', 'order_tracking_token');
    if (hasColumn) {
      await knex.schema.table('orders', (table) => {
        table.dropColumn('order_tracking_token');
      });
      console.log('✓ Dropped orders.order_tracking_token');
    }
  },
};
