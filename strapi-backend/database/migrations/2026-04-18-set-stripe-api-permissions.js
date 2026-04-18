'use strict';

/**
 * Migration: Set public API permissions for Stripe payment endpoints
 *
 * The following routes are intentionally public (no auth token required):
 *
 *   POST /api/stripe/create-checkout-session  – creates a Stripe Checkout session
 *   POST /api/stripe/webhook                  – receives Stripe webhook events
 *   GET  /api/stripe/order-confirmation       – polled by the success page
 *   GET  /api/auth/me                         – current user (used for admin detection)
 *
 * This migration uses direct knex queries (same approach as setup-admin-permissions.js)
 * to ensure it runs reliably inside the Strapi migration runner.
 */

const { v4: uuidv4 } = require('uuid');

const STRIPE_ACTIONS = [
  'api::stripe.stripe.createCheckoutSession',
  'api::stripe.stripe.webhook',
  'api::stripe.stripe.orderConfirmation',
  'api::stripe.stripe.currentUser',
];

module.exports = {
  async up(knex) {
    // ── Find the Public role ──────────────────────────────────────────────────
    const publicRole = await knex('up_roles').where({ type: 'public' }).first();
    if (!publicRole) {
      console.warn('⚠ Public role not found – skipping Stripe permission migration');
      return;
    }

    for (const action of STRIPE_ACTIONS) {
      // Check whether the permission row already exists
      let permission = await knex('up_permissions').where({ action }).first();

      if (!permission) {
        // Create the permission row
        const [inserted] = await knex('up_permissions')
          .insert({
            document_id: uuidv4(),
            action,
            created_at: new Date(),
            updated_at: new Date(),
            published_at: new Date(),
          })
          .returning('id');

        const permissionId = typeof inserted === 'object' ? inserted.id : inserted;

        // Link it to the Public role
        await knex('up_permissions_role_lnk').insert({
          permission_id: permissionId,
          role_id: publicRole.id,
          permission_ord: 1,
        });

        console.log(`✓ Created & enabled public permission: ${action}`);
      } else {
        // Permission row exists – make sure it is linked to Public role
        const link = await knex('up_permissions_role_lnk')
          .where({ permission_id: permission.id, role_id: publicRole.id })
          .first();

        if (!link) {
          await knex('up_permissions_role_lnk').insert({
            permission_id: permission.id,
            role_id: publicRole.id,
            permission_ord: 1,
          });
          console.log(`✓ Linked existing permission to Public role: ${action}`);
        } else {
          console.log(`→ Already public: ${action}`);
        }
      }
    }
  },

  async down(knex) {
    const publicRole = await knex('up_roles').where({ type: 'public' }).first();
    if (!publicRole) return;

    for (const action of STRIPE_ACTIONS) {
      const permission = await knex('up_permissions').where({ action }).first();
      if (permission) {
        await knex('up_permissions_role_lnk')
          .where({ permission_id: permission.id, role_id: publicRole.id })
          .delete();
        console.log(`✓ Removed public access for: ${action}`);
      }
    }
  },
};
