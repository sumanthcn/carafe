import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::customer-subscription.customer-subscription',
  ({ strapi: strapiInstance }) => ({
    /**
     * GET /api/customer-subscriptions/mine
     * Returns only the authenticated user's subscriptions (filtered by email).
     */
    async findMine(ctx: any) {
      const authHeader = ctx.request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) return ctx.unauthorized('Authentication required');

      let userEmail: string;
      try {
        const token = authHeader.slice(7);
        const jwtService = strapiInstance.plugins['users-permissions'].services.jwt;
        const payload: any = await jwtService.verify(token);
        const user: any = await strapiInstance.entityService.findOne(
          'plugin::users-permissions.user', payload.id, {}
        );
        if (!user) return ctx.unauthorized('User not found');
        userEmail = user.email;
      } catch {
        return ctx.unauthorized('Invalid token');
      }

      const subs = await strapiInstance.entityService.findMany(
        'api::customer-subscription.customer-subscription' as any,
        {
          filters: { customerEmail: userEmail } as any,
          sort: { createdAt: 'desc' } as any,
          limit: 200,
        }
      );

      return ctx.send({ data: subs });
    },
  })
);
