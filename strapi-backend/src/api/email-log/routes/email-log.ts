export default {
  routes: [
    {
      method: 'GET',
      path: '/email-logs',
      handler: 'email-log.find',
      config: { policies: [] },
    },
    {
      method: 'GET',
      path: '/email-logs/:id',
      handler: 'email-log.findOne',
      config: { policies: [] },
    },
    {
      method: 'DELETE',
      path: '/email-logs/:id',
      handler: 'email-log.delete',
      config: { policies: [] },
    },
  ],
};
