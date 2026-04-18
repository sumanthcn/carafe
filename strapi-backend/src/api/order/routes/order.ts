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
    // Authenticated user's own orders
    {
      method: 'GET',
      path: '/orders/my-orders',
      handler: 'order.myOrders',
      config: {
        auth: false,
        policies: [],
      },
    },
    // ── Email & Invoice endpoints ──────────────────────────────
    // Manually resend an email for an order (admin only)
    {
      method: 'POST',
      path: '/orders/:id/resend-email',
      handler: 'order.resendEmail',
      config: { auth: false, policies: [] },
    },
    // Download invoice PDF for an order
    {
      method: 'GET',
      path: '/orders/:id/invoice',
      handler: 'order.downloadInvoice',
      config: { auth: false, policies: [] },
    },
    // ── Standard CRUD routes ───────────────────────────────────
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
    // Update order status (admin)
    {
      method: 'PUT',
      path: '/orders/:id/status',
      handler: 'order.updateStatus',
      config: { policies: [] },
    },
    // Check if user has purchased a specific product
    {
      method: 'GET',
      path: '/orders/check-purchase/:productId',
      handler: 'order.checkPurchase',
      config: { policies: [] },
    },
  ],
};
