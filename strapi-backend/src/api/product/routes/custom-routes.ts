export default {
  routes: [
    {
      method: "GET",
      path: "/products/slug/:slug",
      handler: "product.findBySlug",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
