export default {
  routes: [
    {
      method: 'GET',
      path: '/customer-subscriptions/mine',
      handler: 'customer-subscription.findMine',
      config: { auth: false, policies: [] },
    },
    {
      method: 'GET',
      path: '/customer-subscriptions',
      handler: 'customer-subscription.find',
      config: { auth: false, policies: [] },
    },
    {
      method: 'GET',
      path: '/customer-subscriptions/:id',
      handler: 'customer-subscription.findOne',
      config: { auth: false, policies: [] },
    },
    {
      method: 'PUT',
      path: '/customer-subscriptions/:id',
      handler: 'customer-subscription.update',
      config: { auth: false, policies: [] },
    },
  ],
};
