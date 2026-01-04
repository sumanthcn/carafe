export default {
  routes: [
    {
      method: 'GET',
      path: '/shipping-config',
      handler: 'shipping-config.find',
      config: {
        auth: false, // Public endpoint for checkout page
        policies: [],
      },
    },
  ],
};
