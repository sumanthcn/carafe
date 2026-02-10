import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::shipping-config.shipping-config', ({ strapi }) => ({
  /**
   * Get shipping configuration (public endpoint)
   */
  async find(ctx) {
    try {
      const config: any = await strapi.entityService.findMany('api::shipping-config.shipping-config', {
        populate: ['shippingOptions'],
      });

      // Filter only active shipping options for public endpoint
      if (config && config.shippingOptions) {
        config.shippingOptions = config.shippingOptions.filter((option: any) => option.isActive);
      }

      return {
        data: config,
      };
    } catch (error) {
      strapi.log.error('Failed to fetch shipping config:', error);
      return ctx.internalServerError('Failed to fetch shipping configuration');
    }
  },
}));
