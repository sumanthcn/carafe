export default {
  routes: [
    {
      method: "GET",
      path: "/orders/check-purchase/:productId",
      handler: "order.checkPurchase",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
