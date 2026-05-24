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
      path: '/stripe/cancel-order',
      handler: 'stripe.cancelOrder',
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
    {
      // Cancel a customer subscription (admin or owner)
      method: 'POST',
      path: '/stripe/cancel-subscription',
      handler: 'stripe.cancelSubscription',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      // Admin-only: manually trigger subscription billing cycle
      method: 'POST',
      path: '/stripe/process-subscriptions',
      handler: 'stripe.processSubscriptions',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      // Dev/test: create a test subscription immediately due with 5-min interval
      method: 'POST',
      path: '/stripe/create-test-subscription',
      handler: 'stripe.createTestSubscription',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      // Recovery: recreate missed subscription records for a captured order
      method: 'POST',
      path: '/stripe/retry-subscription-for-order',
      handler: 'stripe.retrySubscriptionForOrder',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      // Attach Stripe customer/PM to an existing subscription that is missing them
      method: 'POST',
      path: '/stripe/attach-stripe-ids',
      handler: 'stripe.attachStripeIds',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
