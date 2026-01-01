export default {
  routes: [
    {
      method: 'GET',
      path: '/visit-cafe',
      handler: 'visit-cafe.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/visit-cafe',
      handler: 'visit-cafe.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/visit-cafe',
      handler: 'visit-cafe.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
