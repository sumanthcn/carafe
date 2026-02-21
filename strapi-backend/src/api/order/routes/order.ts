export default {
  routes: [
    // Custom track endpoint (public - no auth required)
    {
      method: 'GET',
      path: '/orders/track',
      handler: 'order.track',
      config: {
        auth: false,
        policies: [],
      },
    },
    // Standard CRUD routes
    {
      method: 'GET',
      path: '/orders',
      handler: 'order.find',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/orders/:id',
      handler: 'order.findOne',
      config: { policies: [] },
    },
    {
      method: 'POST',
      path: '/orders',
      handler: 'order.create',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/orders/:id',
      handler: 'order.update',
      config: { policies: [] },
    },
    {
      method: 'DELETE',
      path: '/orders/:id',
      handler: 'order.delete',
      config: { policies: [] },
    },
  ],
};
