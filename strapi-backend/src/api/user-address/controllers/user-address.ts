/**
 * user-address controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::user-address.user-address', ({ strapi }) => ({
  // Get all addresses for the authenticated user
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const addresses = await strapi.entityService.findMany('api::user-address.user-address', {
      filters: { user: user.id },
      sort: { isDefault: 'desc', createdAt: 'desc' },
    });

    return addresses;
  },

  // Get a single address for the authenticated user
  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const address = await strapi.entityService.findOne('api::user-address.user-address', id);

    if (!address || (address as any).user?.id !== user.id) {
      return ctx.notFound('Address not found');
    }

    return address;
  },

  // Create a new address for the authenticated user
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const { isDefault, ...addressData } = ctx.request.body.data || ctx.request.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await strapi.db.query('api::user-address.user-address').updateMany({
        where: { user: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await strapi.entityService.create('api::user-address.user-address', {
      data: {
        ...addressData,
        user: user.id,
        isDefault: isDefault || false,
      },
    });

    return address;
  },

  // Update an address for the authenticated user
  async update(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Check if address belongs to user
    const existingAddress = await strapi.entityService.findOne('api::user-address.user-address', id);

    if (!existingAddress || (existingAddress as any).user?.id !== user.id) {
      return ctx.notFound('Address not found');
    }

    const { isDefault, ...addressData } = ctx.request.body.data || ctx.request.body;

    // If this is set as default, unset other defaults
    if (isDefault) {
      await strapi.db.query('api::user-address.user-address').updateMany({
        where: { user: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await strapi.entityService.update('api::user-address.user-address', id, {
      data: {
        ...addressData,
        isDefault: isDefault !== undefined ? isDefault : (existingAddress as any).isDefault,
      },
    });

    return address;
  },

  // Delete an address for the authenticated user
  async delete(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Check if address belongs to user
    const existingAddress = await strapi.entityService.findOne('api::user-address.user-address', id);

    if (!existingAddress || (existingAddress as any).user?.id !== user.id) {
      return ctx.notFound('Address not found');
    }

    await strapi.entityService.delete('api::user-address.user-address', id);

    return { message: 'Address deleted successfully' };
  },
}));
