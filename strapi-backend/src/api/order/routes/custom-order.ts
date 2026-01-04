export default {
  routes: [
    {
      method: 'POST',
      path: '/orders',
      handler: 'order.create',
      config: {
        auth: false, // Allow both guest and authenticated users
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/orders/track',
      handler: 'order.track',
      config: {
        auth: false, // Public endpoint for order tracking
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/orders/my-orders',
      handler: 'order.myOrders',
      config: {
        policies: [], // Requires authentication (handled in controller)
      },
    },
    {
      method: 'PUT',
      path: '/orders/:id/status',
      handler: 'order.updateStatus',
      config: {
        policies: ['admin::isAuthenticated'], // Admin only
      },
    },
    {
      method: 'GET',
      path: '/orders/check-purchase/:productId',
      handler: 'order.checkPurchase',
      config: {
        policies: [], // Requires authentication (handled in controller)
      },
    },
  ],
};
