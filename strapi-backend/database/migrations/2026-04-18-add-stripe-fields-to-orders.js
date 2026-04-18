'use strict';

/**
 * Migration: Add Stripe payment fields to orders table
 *
 * Adds the following columns if they do not already exist:
 *   - stripe_session_id  (varchar 255, nullable) – Stripe Checkout Session ID (cs_…)
 *   - payment_method     (varchar 255, nullable) – e.g. "stripe", "worldpay"
 *   - payment_id         (varchar 255, nullable) – Stripe PaymentIntent ID (pi_…)
 *
 * Note: Strapi 5 will auto-sync schema on startup, but explicit migrations
 * guarantee idempotency if the production DB was provisioned before these
 * fields were added to the content-type schema.
 */

module.exports = {
  async up(knex) {
    const hasStripeSessionId = await knex.schema.hasColumn('orders', 'stripe_session_id');
    if (!hasStripeSessionId) {
      await knex.schema.table('orders', (table) => {
        table.string('stripe_session_id', 255).nullable();
      });
      console.log('✓ Added orders.stripe_session_id');
    } else {
      console.log('→ orders.stripe_session_id already exists, skipping');
    }

    const hasPaymentMethod = await knex.schema.hasColumn('orders', 'payment_method');
    if (!hasPaymentMethod) {
      await knex.schema.table('orders', (table) => {
        table.string('payment_method', 255).nullable();
      });
      console.log('✓ Added orders.payment_method');
    } else {
      console.log('→ orders.payment_method already exists, skipping');
    }

    const hasPaymentId = await knex.schema.hasColumn('orders', 'payment_id');
    if (!hasPaymentId) {
      await knex.schema.table('orders', (table) => {
        table.string('payment_id', 255).nullable();
      });
      console.log('✓ Added orders.payment_id');
    } else {
      console.log('→ orders.payment_id already exists, skipping');
    }
  },

  async down(knex) {
    const hasStripeSessionId = await knex.schema.hasColumn('orders', 'stripe_session_id');
    if (hasStripeSessionId) {
      await knex.schema.table('orders', (table) => {
        table.dropColumn('stripe_session_id');
      });
      console.log('✓ Dropped orders.stripe_session_id');
    }

    const hasPaymentMethod = await knex.schema.hasColumn('orders', 'payment_method');
    if (hasPaymentMethod) {
      await knex.schema.table('orders', (table) => {
        table.dropColumn('payment_method');
      });
      console.log('✓ Dropped orders.payment_method');
    }

    const hasPaymentId = await knex.schema.hasColumn('orders', 'payment_id');
    if (hasPaymentId) {
      await knex.schema.table('orders', (table) => {
        table.dropColumn('payment_id');
      });
      console.log('✓ Dropped orders.payment_id');
    }
  },
};
