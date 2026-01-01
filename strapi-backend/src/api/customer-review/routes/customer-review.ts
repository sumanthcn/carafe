export default {
  routes: [
    {
      method: 'GET',
      path: '/customer-reviews/check-verified-purchase',
      handler: 'customer-review.checkVerifiedPurchase',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/customer-reviews',
      handler: 'customer-review.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/customer-reviews/:id',
      handler: 'customer-review.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/customer-reviews',
      handler: 'customer-review.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/customer-reviews/:id',
      handler: 'customer-review.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/customer-reviews/:id',
      handler: 'customer-review.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
