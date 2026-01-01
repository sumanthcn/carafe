export default {
  routes: [
    {
      method: 'GET',
      path: '/shop-setting',
      handler: 'shop-setting.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/shop-setting',
      handler: 'shop-setting.update',
    },
    {
      method: 'DELETE',
      path: '/shop-setting',
      handler: 'shop-setting.delete',
    },
  ],
};
