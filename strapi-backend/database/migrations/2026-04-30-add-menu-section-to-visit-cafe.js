'use strict';

/**
 * Migration: Add Menu Section + Menu Item components to Visit Cafe content type
 *
 * Strapi 5 automatically syncs JSON schema files to the database on startup,
 * creating:
 *   - `components_sections_menu_sections`  (title, description)
 *   - `components_elements_menu_items`     (title, file – single media via upload-morph)
 *   - Component link tables joining visit_cafe → menu_section, and menu_section → menu_item
 *
 * This migration acts as an idempotency guard and deployment audit record.
 */

module.exports = {
  async up(knex) {
    // ── Menu Section table ──────────────────────────────────────────────────
    const sectionTableExists = await knex.schema.hasTable('components_sections_menu_sections');

    if (sectionTableExists) {
      console.log('✓ components_sections_menu_sections table exists (Strapi schema sync)');

      const hasTitle = await knex.schema.hasColumn('components_sections_menu_sections', 'title');
      if (!hasTitle) {
        await knex.schema.table('components_sections_menu_sections', (table) => {
          table.string('title', 255).nullable();
        });
        console.log('✓ Added title column to components_sections_menu_sections');
      }

      const hasDescription = await knex.schema.hasColumn('components_sections_menu_sections', 'description');
      if (!hasDescription) {
        await knex.schema.table('components_sections_menu_sections', (table) => {
          table.text('description').nullable();
        });
        console.log('✓ Added description column to components_sections_menu_sections');
      }
    } else {
      await knex.schema.createTable('components_sections_menu_sections', (table) => {
        table.increments('id').primary();
        table.string('title', 255).nullable();
        table.text('description').nullable();
        table.timestamps(true, true);
      });
      console.log('✓ Created components_sections_menu_sections table (manual fallback)');
    }

    // ── Menu Item table ─────────────────────────────────────────────────────
    const itemTableExists = await knex.schema.hasTable('components_elements_menu_items');

    if (itemTableExists) {
      console.log('✓ components_elements_menu_items table exists (Strapi schema sync)');

      const hasTitle = await knex.schema.hasColumn('components_elements_menu_items', 'title');
      if (!hasTitle) {
        await knex.schema.table('components_elements_menu_items', (table) => {
          table.string('title', 255).nullable();
        });
        console.log('✓ Added title column to components_elements_menu_items');
      }
    } else {
      await knex.schema.createTable('components_elements_menu_items', (table) => {
        table.increments('id').primary();
        table.string('title', 255).nullable();
        table.timestamps(true, true);
      });
      console.log('✓ Created components_elements_menu_items table (manual fallback)');
    }

    console.log('✓ Menu Section + Menu Item migration complete');
  },

  async down(knex) {
    console.log('Rollback: Revert schema JSON files to remove menuSection from visit-cafe');
    console.log('Tables are managed by Strapi schema sync – no destructive drops performed.');
  },
};
