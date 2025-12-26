export default {
  routes: [
    {
      method: "POST",
      path: "/email-subscribers/subscribe",
      handler: "email-subscriber.subscribe",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
