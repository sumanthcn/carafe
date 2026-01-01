/**
 * Set public permissions for Visit Cafe API
 * This migration ensures the visit-cafe endpoint is publicly accessible
 */

async function up() {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' }
  });

  if (!publicRole) {
    console.log('Public role not found');
    return;
  }

  // Get the visit-cafe API permissions
  const visitCafePermissions = await strapi.query('plugin::users-permissions.permission').findMany({
    where: {
      action: {
        $in: [
          'api::visit-cafe.visit-cafe.find',
          'api::visit-cafe.visit-cafe.findOne',
        ]
      }
    }
  });

  // Enable these permissions for the public role
  for (const permission of visitCafePermissions) {
    await strapi.query('plugin::users-permissions.permission').update({
      where: { id: permission.id },
      data: { role: publicRole.id }
    });
    console.log(`✓ Enabled permission: ${permission.action}`);
  }

  console.log('✓ Visit Cafe API permissions set successfully');
}

async function down() {
  console.log('Rollback: Remove Visit Cafe public permissions');
  
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' }
  });

  if (!publicRole) {
    return;
  }

  const visitCafePermissions = await strapi.query('plugin::users-permissions.permission').findMany({
    where: {
      action: {
        $in: [
          'api::visit-cafe.visit-cafe.find',
          'api::visit-cafe.visit-cafe.findOne',
        ]
      },
      role: publicRole.id
    }
  });

  for (const permission of visitCafePermissions) {
    await strapi.query('plugin::users-permissions.permission').update({
      where: { id: permission.id },
      data: { role: null }
    });
  }
}

module.exports = { up, down };
