export default {
  routes: [
    {
      method: 'POST',
      path: '/stripe/create-checkout-session',
      handler: 'stripe.createCheckoutSession',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/stripe/webhook',
      handler: 'stripe.webhook',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      // Public endpoint used by the payment success page.
      // Validates via Stripe session_id so no auth token is needed.
      method: 'GET',
      path: '/stripe/order-confirmation',
      handler: 'stripe.orderConfirmation',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      // Returns the current user with role populated (used by frontend admin detection)
      method: 'GET',
      path: '/auth/me',
      handler: 'stripe.currentUser',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
