require('dotenv').config();
const knex = require('knex');
const { v4: uuidv4 } = require('uuid');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD
  }
});

async function run() {
  // Step 1: Copy all Authenticated (role_id=1) permissions to Admin (role_id=3)
  const authPerms = await db('up_permissions_role_lnk').where('role_id', 1);
  const adminPerms = authPerms.map((p) => ({
    permission_id: p.permission_id,
    role_id: 3,
    permission_ord: p.permission_ord
  }));
  await db('up_permissions_role_lnk').insert(adminPerms);
  console.log('Copied', authPerms.length, 'Authenticated permissions to Admin role');

  // Step 2: Add extra admin-only permissions
  const extraActions = [
    'api::product.product.create',
    'api::product.product.delete',
    'api::product-category.product-category.create',
    'api::product-category.product-category.delete',
    'api::email-subscriber.email-subscriber.find',
    'api::email-subscriber.email-subscriber.findOne',
    'api::email-subscriber.email-subscriber.delete',
    'api::email-subscriber.email-subscriber.update',
    'api::order.order.delete',
    'plugin::users-permissions.user.find',
    'plugin::users-permissions.user.findOne',
    'plugin::users-permissions.user.update',
    'plugin::upload.content-api.upload',
    'api::shop-setting.shop-setting.find',
    'api::shop-setting.shop-setting.update',
    'api::global-setting.global-setting.update',
  ];

  for (const action of extraActions) {
    let perm = await db('up_permissions').where('action', action).first();
    if (!perm) {
      const rows = await db('up_permissions').insert({
        document_id: uuidv4(),
        action,
        created_at: new Date(),
        updated_at: new Date(),
        published_at: new Date()
      }).returning('id');
      perm = { id: rows[0].id !== undefined ? rows[0].id : rows[0] };
      console.log('Created permission:', action, 'id:', perm.id);
    } else {
      console.log('Found permission:', action, 'id:', perm.id);
    }
    const existing = await db('up_permissions_role_lnk')
      .where({ permission_id: perm.id, role_id: 3 })
      .first();
    if (!existing) {
      await db('up_permissions_role_lnk').insert({
        permission_id: perm.id,
        role_id: 3,
        permission_ord: perm.id
      });
      console.log('  -> Linked to Admin role');
    } else {
      console.log('  -> Already linked');
    }
  }

  console.log('Done!');
  db.destroy();
}

run().catch(e => { console.error(e.message); db.destroy(); process.exit(1); });
