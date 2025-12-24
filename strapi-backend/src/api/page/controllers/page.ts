import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::page.page",
  ({ strapi }) => ({
    async findBySlug(ctx) {
      const { slug } = ctx.params;

      const entity = await strapi.db.query("api::page.page").findOne({
        where: { slug, publishedAt: { $notNull: true } },
        populate: {
          content: {
            populate: "*",
          },
          featuredImage: true,
          seo: {
            populate: ["ogImage"],
          },
        },
      });

      if (!entity) {
        return ctx.notFound("Page not found");
      }

      return entity;
    },
  })
);
