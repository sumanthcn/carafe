import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    async findBySlug(ctx) {
      const { slug } = ctx.params;

      const entity = await strapi.db.query("api::product.product").findOne({
        where: { slug, publishedAt: { $notNull: true } },
        populate: {
          images: true,
          category: true,
          relatedProducts: {
            populate: ["images", "category"],
          },
          seo: {
            populate: ["ogImage"],
          },
          productSchema: true,
        },
      });

      if (!entity) {
        return ctx.notFound("Product not found");
      }

      return entity;
    },
  })
);
