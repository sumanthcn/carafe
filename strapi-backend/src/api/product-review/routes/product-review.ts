export default {
  routes: [
    {
      method: 'GET',
      path: '/product-reviews',
      handler: 'product-review.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/product-reviews/:id',
      handler: 'product-review.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/product-reviews/product/:productId',
      handler: 'product-review.findByProduct',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/product-reviews',
      handler: 'product-review.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/product-reviews/:id',
      handler: 'product-review.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/product-reviews/:id',
      handler: 'product-review.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
