import Stripe from 'stripe';

// ---------------------------------------------------------------------------
// Interval helpers
// ---------------------------------------------------------------------------

const INTERVAL_DAYS: Record<string, number> = {
  '1_week':   7,
  '2_weeks':  14,
  '3_weeks':  21,
  '1_month':  28,
  '2_months': 56,
};

function calculateNextBillingDate(interval: string): Date {
  const d = new Date();
  if (interval === '5_minutes') {
    d.setMinutes(d.getMinutes() + 5);
    return d;
  }
  const days = INTERVAL_DAYS[interval] ?? 28;
  d.setDate(d.getDate() + days);
  return d;
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(secretKey, { apiVersion: '2026-03-25.dahlia' as const });
}

export default {
  async createCheckoutSession(ctx: any) {
    try {
      const { orderId } = ctx.request.body;
      if (!orderId) return ctx.badRequest('orderId is required');

      const order: any = await strapi.entityService.findOne(
        'api::order.order', orderId, { populate: ['items'] }
      );
      if (!order) return ctx.notFound('Order not found');
      if (order.paymentStatus === 'captured') return ctx.badRequest('Order already paid');

      const stripe = getStripeClient();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      // Check if any item is a subscription
      const hasSubscription = Array.isArray(order.items) && order.items.some((item: any) => item.isSubscription);

      const intervalLabel: Record<string, string> = {
        '1_week':  'every week',
        '2_weeks': 'every 2 weeks',
        '3_weeks': 'every 3 weeks',
        '1_month': 'every 4 weeks',
        '2_months': 'every 2 months',
      };

      const lineItems = order.items.map((item: any) => {
        const descriptionParts: string[] = [];
        if (item.weight) descriptionParts.push('Weight: ' + item.weight);
        if (item.isSubscription && item.subscriptionInterval) {
          descriptionParts.push('Subscription – ' + (intervalLabel[item.subscriptionInterval] || item.subscriptionInterval));
          if (item.subscriptionDiscountPercentage) {
            descriptionParts.push(item.subscriptionDiscountPercentage + '% subscriber discount applied');
          }
        }
        return {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: item.productName,
              ...(descriptionParts.length > 0 ? { description: descriptionParts.join(' · ') } : {}),
            },
            unit_amount: Math.round(item.unitPrice * 100),
          },
          quantity: item.quantity,
        };
      });

      if (order.shippingCost > 0) {
        lineItems.push({
          price_data: {
            currency: 'gbp',
            product_data: { name: 'Shipping - ' + (order.shippingMethod || 'Standard Delivery') },
            unit_amount: Math.round(order.shippingCost * 100),
          },
          quantity: 1,
        });
      }

      // Build session params — subscriptions need mandate acceptance + card saving
      // For subscriptions: create/find a Stripe Customer so the PaymentIntent gets
      // a proper cus_... attached (required for future off-session charges).
      let stripeCustomer: string | undefined;
      if (hasSubscription) {
        try {
          const existing = await stripe.customers.list({ email: order.customerEmail, limit: 1 });
          if (existing.data.length > 0) {
            stripeCustomer = existing.data[0].id;
          } else {
            const created = await stripe.customers.create({
              email: order.customerEmail,
              name: order.customerName || undefined,
              metadata: { orderNumber: order.orderNumber },
            });
            stripeCustomer = created.id;
          }
          strapi.log.info('[checkout] Stripe customer: ' + stripeCustomer + ' for ' + order.customerEmail);
        } catch (cusErr: any) {
          strapi.log.warn('[checkout] Could not create Stripe customer: ' + cusErr.message);
        }
      }

      const sessionParams = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        // Use customer ID for subscriptions (ensures PI has cus_... for off-session billing)
        // Fall back to customer_email for one-time orders
        ...(stripeCustomer ? { customer: stripeCustomer } : { customer_email: order.customerEmail }),
        success_url: frontendUrl + '/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=' + orderId,
        cancel_url: frontendUrl + '/payment/cancelled?order_id=' + orderId + '&session_id={CHECKOUT_SESSION_ID}',
        metadata: { orderId: String(orderId), orderNumber: order.orderNumber },
        payment_intent_data: {
          metadata: { orderId: String(orderId), orderNumber: order.orderNumber },
          ...(hasSubscription ? { setup_future_usage: 'off_session' } : {}),
        },
        ...(hasSubscription ? {
          consent_collection: {
            payment_method_reuse_agreement: { position: 'auto' as const },
            terms_of_service: 'required' as const,
          },
          custom_text: {
            terms_of_service_acceptance: {
              message: 'I authorise Carafe Coffee to save my payment method and charge it automatically for each subscription delivery at the selected interval. I understand I can cancel my subscription at any time from my account.',
            },
            submit: {
              message: 'By completing this purchase you agree to recurring automatic charges for your subscription order.',
            },
          },
        } : {}),
      };

      const session = await stripe.checkout.sessions.create(sessionParams as any);

      await strapi.entityService.update('api::order.order', orderId, {
        data: { stripeSessionId: session.id, paymentMethod: 'stripe' } as any,
      });

      strapi.log.info('Stripe session created: ' + session.id + ' for order ' + order.orderNumber);
      return ctx.send({ url: session.url });
    } catch (error: any) {
      strapi.log.error('Failed to create Stripe checkout session:', error);
      return ctx.internalServerError(error.message || 'Failed to create checkout session');
    }
  },

  /**
   * POST /api/stripe/cancel-order
   * Called by the frontend cancel page when the user abandons Stripe checkout.
   * Verifies the session is not paid before cancelling.
   */
  async cancelOrder(ctx: any) {
    const { orderId, sessionId } = ctx.request.body;

    if (!orderId) return ctx.badRequest('orderId is required');

    try {
      const order: any = await strapi.entityService.findOne(
        'api::order.order', Number(orderId), {}
      );

      if (!order) return ctx.notFound('Order not found');

      // Safety: never cancel a paid order
      if (order.paymentStatus === 'captured') {
        return ctx.send({ message: 'Order already paid — no action taken' });
      }

      // If sessionId provided, verify with Stripe that the session is truly unpaid
      if (sessionId && typeof sessionId === 'string' && sessionId.startsWith('cs_')) {
        try {
          const stripe = getStripeClient();
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session.payment_status === 'paid') {
            strapi.log.warn('cancelOrder: session ' + sessionId + ' is paid — refusing cancel for order ' + order.orderNumber);
            return ctx.badRequest('Payment has been captured — cannot cancel');
          }
        } catch (stripeErr: any) {
          strapi.log.warn('cancelOrder: could not verify session with Stripe:', stripeErr.message);
        }
      }

      await strapi.entityService.update('api::order.order', order.id, {
        data: { orderStatus: 'cancelled', paymentStatus: 'cancelled' } as any,
      });

      strapi.log.info('Order ' + order.orderNumber + ' cancelled by user (abandoned checkout)');
      return ctx.send({ message: 'Order cancelled successfully' });

    } catch (error: any) {
      strapi.log.error('cancelOrder error:', error);
      return ctx.internalServerError('Failed to cancel order');
    }
  },

  /**
   * GET /api/stripe/order-confirmation?session_id=cs_xxx
   *
   * Public endpoint used by the payment success page.
   * Looks up the order by stripeSessionId so no auth token is needed.
   * Only returns non-sensitive fields (order number, total, email, status).
   */
  async orderConfirmation(ctx: any) {
    const { session_id } = ctx.query;

    if (!session_id || typeof session_id !== 'string' || !session_id.startsWith('cs_')) {
      return ctx.badRequest('Valid session_id is required');
    }

    try {
      const orders: any[] = await strapi.entityService.findMany('api::order.order', {
        filters: { stripeSessionId: session_id } as any,
        limit: 1,
      }) as any[];

      if (!orders || orders.length === 0) {
        return ctx.notFound('Order not found for this session');
      }

      const order = orders[0];

      // If the order payment hasn't been confirmed yet, verify directly with Stripe
      // (catches cases where the webhook hasn't fired yet in development)
      if (order.paymentStatus !== 'captured') {
        try {
          const stripe = getStripeClient();
          const session = await stripe.checkout.sessions.retrieve(session_id);

          if (session.payment_status === 'paid') {
            const paymentId = typeof session.payment_intent === 'string' ? session.payment_intent : null;
            await strapi.entityService.update('api::order.order', order.id, {
              data: {
                paymentStatus: 'captured',
                orderStatus: 'order_received',
                stripeSessionId: session.id,
                paymentId,
              } as any,
            });

            // Deduct stock if not already done
            const freshOrder: any = await strapi.entityService.findOne('api::order.order', order.id, {
              populate: ['items', 'shippingAddress', 'user'],
            });
            if (freshOrder?.items?.length > 0) {
              await deductStock(freshOrder.items);
            }

            // Create subscription records (fallback for when webhook hasn't fired yet in dev)
            if (freshOrder) {
              const subCount = await createSubscriptionsForOrder(
                freshOrder,
                paymentId,
                typeof session.customer === 'string' ? session.customer : null
              );
              if (subCount > 0) {
                strapi.log.info('[orderConfirmation] Created ' + subCount + ' subscription(s) for ' + freshOrder.orderNumber);
              }
            }

            return ctx.send({
              data: {
                orderNumber: order.orderNumber,
                total: order.total,
                orderStatus: 'order_received',
                paymentStatus: 'captured',
                customerEmail: order.customerEmail,
                customerName: order.customerName,
                createdAt: order.createdAt,
              },
            });
          }
        } catch (stripeErr: any) {
          strapi.log.warn('Could not verify session with Stripe:', stripeErr.message);
        }
      } else {
        // Order already captured — still try to create subscriptions if they're missing
        // (handles the case where orderConfirmation ran before webhook created them)
        try {
          const existingSubs: any[] = await strapi.entityService.findMany(
            'api::customer-subscription.customer-subscription' as any,
            { filters: { parentOrderNumber: order.orderNumber } as any, limit: 1 }
          ) as any[];

          if (existingSubs.length === 0) {
            const fullOrder: any = await strapi.entityService.findOne('api::order.order', order.id, {
              populate: ['items', 'shippingAddress', 'user'],
            });
            if (fullOrder) {
              const stripe = getStripeClient();
              const session = await stripe.checkout.sessions.retrieve(session_id);
              await createSubscriptionsForOrder(
                fullOrder,
                typeof session.payment_intent === 'string' ? session.payment_intent : (fullOrder.paymentId || null),
                typeof session.customer === 'string' ? session.customer : null
              );
            }
          }
        } catch (subCheckErr: any) {
          strapi.log.warn('[orderConfirmation] Subscription check failed:', subCheckErr.message);
        }
      }

      // Return only safe, non-sensitive fields
      return ctx.send({
        data: {
          orderNumber: order.orderNumber,
          total: order.total,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          createdAt: order.createdAt,
        },
      });
    } catch (error: any) {
      strapi.log.error('orderConfirmation error:', error);
      return ctx.internalServerError('Failed to fetch order confirmation');
    }
  },

  async webhook(ctx: any) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      strapi.log.error('STRIPE_WEBHOOK_SECRET not set');
      return ctx.internalServerError('Webhook secret not configured');
    }

    const signature = ctx.request.headers['stripe-signature'];
    if (!signature) return ctx.badRequest('Missing stripe-signature header');

    const unparsed: string | undefined = (ctx.request.body as any)?.[Symbol.for('unparsedBody')];
    if (!unparsed) {
      strapi.log.error('Raw body unavailable for Stripe webhook verification');
      return ctx.badRequest('Raw body unavailable');
    }
    const rawBody = Buffer.from(unparsed);

    let event: any;
    try {
      const stripe = getStripeClient();
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      strapi.log.error('Stripe signature verification failed:', err.message);
      return ctx.badRequest('Webhook verification failed: ' + err.message);
    }

    strapi.log.info('Stripe webhook: ' + event.type + ' (' + event.id + ')');

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object);
          break;
        case 'checkout.session.expired':
          await handleCheckoutSessionExpired(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object);
          break;
        default:
          strapi.log.info('Unhandled Stripe event: ' + event.type);
      }
    } catch (processingError: any) {
      strapi.log.error('Error processing Stripe webhook:', processingError);
    }

    return ctx.send({ received: true });
  },

  /**
   * GET /api/auth/me
   * Returns the current authenticated user with role populated.
   * Used by the frontend to determine if the user is an admin.
   */
  async currentUser(ctx: any) {
    let userId: number | null = null;

    if (ctx.state.user?.id) {
      userId = ctx.state.user.id;
    } else {
      const authHeader = ctx.request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
          const jwtService = strapi.plugins['users-permissions'].services.jwt;
          const payload: any = await jwtService.verify(token);
          if (payload?.id) userId = payload.id;
        } catch {
          return ctx.unauthorized('Invalid token');
        }
      }
    }

    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    const user: any = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      userId,
      { populate: ['role'] }
    );

    if (!user) return ctx.notFound('User not found');

    const { password, resetPasswordToken, confirmationToken, ...safeUser } = user;
    return ctx.send(safeUser);
  },

  /**
   * POST /api/stripe/cancel-subscription
   * Body: { subscriptionId: number }
   * Admin or the subscription owner can cancel.
   */
  async cancelSubscription(ctx: any) {
    const { subscriptionId } = ctx.request.body;
    if (!subscriptionId) return ctx.badRequest('subscriptionId is required');

    try {
      const sub: any = await strapi.entityService.findOne(
        'api::customer-subscription.customer-subscription' as any,
        Number(subscriptionId),
        {}
      );

      if (!sub) return ctx.notFound('Subscription not found');
      if (sub.status === 'cancelled') return ctx.badRequest('Subscription already cancelled');

      await strapi.entityService.update(
        'api::customer-subscription.customer-subscription' as any,
        sub.id,
        { data: { status: 'cancelled', cancelledAt: new Date().toISOString() } as any }
      );

      strapi.log.info('Subscription ' + sub.id + ' cancelled for ' + sub.customerEmail);
      return ctx.send({ message: 'Subscription cancelled successfully' });
    } catch (err: any) {
      strapi.log.error('cancelSubscription error:', err);
      return ctx.internalServerError(err.message);
    }
  },

  /**
   * POST /api/stripe/process-subscriptions
   * Admin-only trigger to manually run the billing cycle.
   * The cron job calls the same logic automatically.
   */
  async processSubscriptions(ctx: any) {
    try {
      const result = await processDueSubscriptions();
      return ctx.send(result);
    } catch (err: any) {
      strapi.log.error('processSubscriptions error:', err);
      return ctx.internalServerError(err.message);
    }
  },

  /**
   * POST /api/stripe/retry-subscription-for-order
   * Recovers missed subscription records for an already-captured order.
   * Useful when webhook ran but subscription creation failed (e.g. schema error).
   * Body: { orderNumber: string }
   */
  async retrySubscriptionForOrder(ctx: any) {
    const { orderNumber } = ctx.request.body || {};
    if (!orderNumber) return ctx.badRequest('orderNumber is required');

    try {
      const orders: any[] = await strapi.entityService.findMany('api::order.order', {
        filters: { orderNumber } as any,
        populate: ['items', 'shippingAddress', 'user'],
        limit: 1,
      }) as any[];

      if (!orders.length) return ctx.notFound('Order not found: ' + orderNumber);
      const order = orders[0];

      if (order.paymentStatus !== 'captured') {
        return ctx.badRequest('Order ' + orderNumber + ' is not captured (status: ' + order.paymentStatus + ')');
      }

      // Check if subscriptions already exist for this order
      const existing: any[] = await strapi.entityService.findMany(
        'api::customer-subscription.customer-subscription' as any,
        { filters: { parentOrderNumber: orderNumber } as any, limit: 10 }
      ) as any[];

      if (existing.length > 0) {
        return ctx.send({
          message: 'Subscription records already exist for ' + orderNumber,
          existing: existing.length,
          subscriptionIds: existing.map((s: any) => s.id),
        });
      }

      const created = await createSubscriptionsForOrder(order, order.paymentId || null, null);

      if (created === 0) {
        return ctx.send({ message: 'No subscription items found in order ' + orderNumber, created: 0 });
      }

      strapi.log.info('[retry] Created ' + created + ' subscription(s) for order ' + orderNumber);
      return ctx.send({ message: 'Successfully created ' + created + ' subscription record(s) for ' + orderNumber, created });
    } catch (err: any) {
      strapi.log.error('retrySubscriptionForOrder error:', err);
      return ctx.internalServerError(err.message);
    }
  },

  /**
   * POST /api/stripe/attach-stripe-ids
   * Patches stripeCustomerId + stripePaymentMethodId onto an existing subscription.
   * Resolves them from a paymentIntentId or email lookup if not provided directly.
   * Body: { subscriptionId, paymentIntentId?, stripeCustomerId?, stripePaymentMethodId?, customerEmail? }
   */
  async attachStripeIds(ctx: any) {
    const { subscriptionId, paymentIntentId, stripeCustomerId: bodyCustomerId,
      stripePaymentMethodId: bodyPmId, customerEmail } = ctx.request.body || {};

    if (!subscriptionId) return ctx.badRequest('subscriptionId is required');

    try {
      const sub: any = await strapi.entityService.findOne(
        'api::customer-subscription.customer-subscription' as any, Number(subscriptionId), {}
      );
      if (!sub) return ctx.notFound('Subscription not found');

      const stripe = getStripeClient();
      let stripeCustomerId: string | null = bodyCustomerId || null;
      let stripePaymentMethodId: string | null = bodyPmId || null;
      const email = customerEmail || sub.customerEmail;

      if (paymentIntentId && (!stripeCustomerId || !stripePaymentMethodId)) {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        stripeCustomerId = stripeCustomerId || (typeof pi.customer === 'string' ? pi.customer : null);
        stripePaymentMethodId = stripePaymentMethodId || (typeof pi.payment_method === 'string' ? pi.payment_method : null);
      }

      if ((!stripeCustomerId || !stripePaymentMethodId) && email) {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) {
          const customer = customers.data[0];
          stripeCustomerId = stripeCustomerId || customer.id;
          if (!stripePaymentMethodId) {
            const pms = await stripe.paymentMethods.list({ customer: customer.id, type: 'card', limit: 1 });
            stripePaymentMethodId = pms.data.length > 0 ? pms.data[0].id : null;
          }
        }
      }

      if (!stripeCustomerId || !stripePaymentMethodId) {
        return ctx.badRequest('Could not resolve Stripe customer/payment method. Provide paymentIntentId or ensure a Stripe customer exists for ' + email);
      }

      await strapi.entityService.update(
        'api::customer-subscription.customer-subscription' as any, sub.id,
        { data: { stripeCustomerId, stripePaymentMethodId } as any }
      );

      strapi.log.info('[attach] Sub ' + sub.id + ' updated with Stripe IDs: ' + stripeCustomerId);
      return ctx.send({ message: 'Stripe IDs attached to subscription ' + sub.id, stripeCustomerId, stripePaymentMethodId });
    } catch (err: any) {
      strapi.log.error('attachStripeIds error:', err);
      return ctx.internalServerError(err.message);
    }
  },

  /**
   * POST /api/stripe/create-test-subscription
   * Dev/test helper – creates a subscription immediately due (nextBillingDate = now)
   * with a 5-minute repeat interval so billing runs can be quickly verified.
   *
   * Body:
   *   { paymentIntentId: string }         – auto-resolve Stripe customer + PM from existing PI
   *   OR
   *   { stripeCustomerId: string, stripePaymentMethodId: string }
   *
   * Optional:
   *   { productName, unitPrice, customerEmail, customerName }
   */
  async createTestSubscription(ctx: any) {
    try {
      const {
        paymentIntentId,
        stripeCustomerId: bodyCustomerId,
        stripePaymentMethodId: bodyPmId,
        productName = 'Test Coffee Subscription',
        unitPrice = 12.00,
        customerEmail = 'test@carafe.coffee',
        customerName = 'Test Customer',
      } = ctx.request.body || {};

      let stripeCustomerId: string | null = bodyCustomerId || null;
      let stripePaymentMethodId: string | null = bodyPmId || null;
      let stripeWarning: string | null = null;
      const stripe = getStripeClient();

      // 1. Try to resolve from a Payment Intent ID if provided
      if (paymentIntentId && (!stripeCustomerId || !stripePaymentMethodId)) {
        try {
          const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
          stripeCustomerId = stripeCustomerId || (typeof pi.customer === 'string' ? pi.customer : null);
          stripePaymentMethodId = stripePaymentMethodId || (typeof pi.payment_method === 'string' ? pi.payment_method : null);
        } catch (piErr: any) {
          stripeWarning = 'Could not retrieve Payment Intent: ' + piErr.message;
          strapi.log.warn('[test] ' + stripeWarning);
        }
      }

      // 2. Fall back to looking up the Stripe customer by email
      if ((!stripeCustomerId || !stripePaymentMethodId) && customerEmail) {
        try {
          const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
          if (customers.data.length > 0) {
            const customer = customers.data[0];
            stripeCustomerId = stripeCustomerId || customer.id;
            strapi.log.info('[test] Found Stripe customer by email: ' + customer.id);

            // Get the most recently used payment method for this customer
            if (!stripePaymentMethodId) {
              const pms = await stripe.paymentMethods.list({ customer: customer.id, type: 'card', limit: 1 });
              if (pms.data.length > 0) {
                stripePaymentMethodId = pms.data[0].id;
                strapi.log.info('[test] Found payment method: ' + stripePaymentMethodId);
              } else {
                // Try the default payment method or invoice default
                const fullCustomer = await stripe.customers.retrieve(customer.id) as any;
                stripePaymentMethodId = fullCustomer.invoice_settings?.default_payment_method ||
                  fullCustomer.default_source || null;
              }
            }
          }
        } catch (lookupErr: any) {
          strapi.log.warn('[test] Could not look up Stripe customer by email: ' + lookupErr.message);
        }
      }

      if (!stripeCustomerId || !stripePaymentMethodId) {
        stripeWarning =
          'No Stripe customer/payment method found for this email. ' +
          'Auto-billing will be skipped — subscription record will be created for order-flow testing only. ' +
          'To enable real charges, complete a new checkout with a subscription item first ' +
          '(the checkout now automatically creates and saves the Stripe customer).';
        strapi.log.warn('[test] Creating test subscription without Stripe IDs');
      }

      // Set nextBillingDate to 10 seconds ago so it fires on the next billing run
      const nextBillingDate = new Date(Date.now() - 10_000);

      const sub: any = await strapi.entityService.create(
        'api::customer-subscription.customer-subscription' as any,
        {
          data: {
            status: 'active',
            interval: '5_minutes',
            startDate: new Date().toISOString(),
            nextBillingDate: nextBillingDate.toISOString(),
            stripeCustomerId: stripeCustomerId || null,
            stripePaymentMethodId: stripePaymentMethodId || null,
            productId: null,
            productName,
            productSlug: null,
            variantId: null,
            variantDetails: { weight: '250g', sku: 'TEST-SKU' },
            quantity: 1,
            unitPrice: Number(unitPrice),
            originalUnitPrice: Number(unitPrice),
            discountPercentage: 0,
            currency: 'GBP',
            customerEmail,
            customerName,
            shippingMethod: 'Test Shipping',
            shippingCost: 0,
            orderNumbers: [],
            parentOrderNumber: null,
            totalOrdersGenerated: 0,
            totalRevenue: 0,
          } as any,
        }
      );

      strapi.log.info('[test] Created test subscription ID ' + sub.id + ' for ' + customerEmail);
      return ctx.send({
        message: 'Test subscription created — click "Run Billing Now" to trigger the first auto-order',
        subscriptionId: sub.id,
        nextBillingDate: nextBillingDate.toISOString(),
        stripeCustomerId,
        stripePaymentMethodId,
        warning: stripeWarning || undefined,
      });
    } catch (err: any) {
      strapi.log.error('createTestSubscription error:', err);
      return ctx.internalServerError(err.message);
    }
  },
};

async function handleCheckoutSessionCompleted(session: any) {
  const orderId = session.metadata?.orderId;
  const orderNumber = session.metadata?.orderNumber;

  if (!orderId) {
    strapi.log.error('checkout.session.completed: missing orderId in metadata');
    return;
  }

  strapi.log.info('Processing checkout.session.completed for order ' + orderNumber + ' (ID: ' + orderId + ')');

  let order: any;
  try {
    const orders: any[] = await strapi.entityService.findMany('api::order.order', {
      filters: { stripeSessionId: session.id } as any,
      populate: ['items', 'shippingAddress', 'user'],
      limit: 1,
    }) as any[];
    order = orders.length > 0 ? orders[0] : await strapi.entityService.findOne(
      'api::order.order', Number(orderId), { populate: ['items', 'shippingAddress', 'user'] }
    );
  } catch (err) {
    strapi.log.error('Failed to find order for webhook:', err);
    return;
  }

  if (!order) {
    strapi.log.error('Order not found for Stripe session ' + session.id);
    return;
  }

  if (order.paymentStatus === 'captured') {
    strapi.log.info('Order ' + order.orderNumber + ' already captured - skipping');
    return;
  }

  await strapi.entityService.update('api::order.order', order.id, {
    data: {
      paymentStatus: 'captured',
      orderStatus: 'order_received',
      stripeSessionId: session.id,
      paymentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    } as any,
  });

  strapi.log.info('Order ' + order.orderNumber + ' payment confirmed (session: ' + session.id + ')');

  // Deduct stock for each purchased item
  if (order.items && order.items.length > 0) {
    await deductStock(order.items);
  }

  // Send order confirmation email with invoice PDF
  // (lifecycle skips order_received email when triggered by webhook update,
  //  so we send it explicitly here after confirming payment)
  try {
    const { generateInvoicePdf } = await import('../../order/services/invoiceService');
    const { sendOrderEmail } = await import('../../order/services/emailService');
    const fullOrder: any = await strapi.entityService.findOne('api::order.order', order.id, {
      populate: ['items', 'shippingAddress', 'billingAddress', 'user'],
    });
    if (fullOrder) {
      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await generateInvoicePdf(fullOrder);
      } catch (pdfErr: any) {
        strapi.log.error('[webhook] Invoice PDF generation failed:', pdfErr.message);
      }
      await sendOrderEmail('order_received', fullOrder, strapi, pdfBuffer);
    }
  } catch (emailErr: any) {
    strapi.log.error('[webhook] Failed to send order confirmation email:', emailErr.message);
  }

  // Create customer-subscription records for any subscription items
  try {
    const created = await createSubscriptionsForOrder(order, session.payment_intent as string | null, session.customer as string | null);
    if (created > 0) {
      strapi.log.info('[webhook] Created ' + created + ' subscription record(s) for order ' + order.orderNumber);
    }
  } catch (subErr: any) {
    strapi.log.error('[webhook] Failed to create customer subscription records:', subErr.message);
  }
}

/**
 * Creates customer-subscription records for all subscription items in an order.
 * Resolves Stripe customer + payment method from the given paymentIntentId.
 * Returns the number of records created.
 */
async function createSubscriptionsForOrder(
  order: any,
  paymentIntentId: string | null,
  sessionCustomerId: string | null = null,
): Promise<number> {
  const subscriptionItems = (order.items || []).filter((item: any) => item.isSubscription);
  if (subscriptionItems.length === 0) return 0;

  // Idempotency check — don't create duplicates if both webhook and orderConfirmation fire
  const existing: any[] = await strapi.entityService.findMany(
    'api::customer-subscription.customer-subscription' as any,
    { filters: { parentOrderNumber: order.orderNumber } as any, limit: 1 }
  ) as any[];
  if (existing.length > 0) {
    strapi.log.info('[subscriptions] Subscriptions already exist for ' + order.orderNumber + ' — skipping');
    return 0;
  }

  const stripe = getStripeClient();
  let stripeCustomerId: string | null = sessionCustomerId;
  let stripePaymentMethodId: string | null = null;

  const piId = paymentIntentId || order.paymentId || null;
  if (piId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId);
      stripePaymentMethodId = typeof pi.payment_method === 'string' ? pi.payment_method : null;
      if (!stripeCustomerId && pi.customer) {
        stripeCustomerId = typeof pi.customer === 'string' ? pi.customer : null;
      }
    } catch (piErr: any) {
      strapi.log.warn('[subscriptions] Could not retrieve PaymentIntent ' + piId + ': ' + piErr.message);
    }
  }

  // Last-resort: look up Stripe customer by email
  if (!stripeCustomerId && order.customerEmail) {
    try {
      const customers = await stripe.customers.list({ email: order.customerEmail, limit: 1 });
      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        if (!stripePaymentMethodId) {
          const pms = await stripe.paymentMethods.list({ customer: stripeCustomerId, type: 'card', limit: 1 });
          if (pms.data.length > 0) stripePaymentMethodId = pms.data[0].id;
        }
      }
    } catch (lookupErr: any) {
      strapi.log.warn('[subscriptions] Email customer lookup failed: ' + lookupErr.message);
    }
  }

  let created = 0;
  for (const item of subscriptionItems) {
    const nextBillingDate = calculateNextBillingDate(item.subscriptionInterval);
    const lineRevenue = Number(item.unitPrice || 0) * Number(item.quantity || 1);

    const createdSub = await strapi.entityService.create(
      'api::customer-subscription.customer-subscription' as any,
      {
        data: {
          status: 'active',
          interval: item.subscriptionInterval,
          startDate: new Date().toISOString(),
          nextBillingDate: nextBillingDate.toISOString(),
          stripeCustomerId,
          stripePaymentMethodId,
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug || null,
          variantId: item.variantId || null,
          variantDetails: { weight: item.weight || null, sku: item.sku || null },
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice,
          originalUnitPrice: item.originalUnitPrice || null,
          discountPercentage: item.subscriptionDiscountPercentage || null,
          currency: order.currency || 'GBP',
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          shippingAddress: order.shippingAddress || null,
          shippingMethod: order.shippingMethod || null,
          shippingCost: order.shippingCost || 0,
          orderNumbers: [order.orderNumber],
          parentOrderNumber: order.orderNumber,
          totalOrdersGenerated: 1,
          totalRevenue: lineRevenue,
          user: order.user?.id || await resolveUserId({ customerEmail: order.customerEmail }) || undefined,
        } as any,
      }
    ) as any;

    strapi.log.info(
      '[subscriptions] Created subscription: ' + item.productName +
      ' every ' + item.subscriptionInterval + ' for ' + order.customerEmail
    );

    // Send subscription confirmation email (non-blocking)
    try {
      const { sendSubscriptionConfirmationEmail } = await import('../../order/services/emailService');
      await sendSubscriptionConfirmationEmail(createdSub, strapi);
    } catch (emailErr: any) {
      strapi.log.warn('[subscriptions] Confirmation email failed: ' + emailErr.message);
    }

    created++;
  }
  return created;
}

async function handlePaymentFailed(paymentIntent: any) {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) {
    strapi.log.warn('payment_intent.payment_failed: missing orderId in metadata');
    return;
  }

  const order: any = await strapi.entityService.findOne(
    'api::order.order', Number(orderId), {}
  );

  if (!order) {
    strapi.log.error('Order not found for failed payment_intent ' + paymentIntent.id);
    return;
  }

  // Don't cancel an already-captured order
  if (order.paymentStatus === 'captured') {
    strapi.log.warn('Order ' + order.orderNumber + ' already captured — ignoring payment_failed');
    return;
  }

  await strapi.entityService.update('api::order.order', order.id, {
    data: { paymentStatus: 'failed', orderStatus: 'cancelled', paymentId: paymentIntent.id } as any,
  });

  strapi.log.warn('Order ' + order.orderNumber + ' payment failed — order cancelled (pi: ' + paymentIntent.id + ')');
}

async function handleCheckoutSessionExpired(session: any) {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    strapi.log.warn('checkout.session.expired: missing orderId in metadata');
    return;
  }

  const order: any = await strapi.entityService.findOne(
    'api::order.order', Number(orderId), {}
  );

  if (!order) {
    strapi.log.warn('checkout.session.expired: order ' + orderId + ' not found');
    return;
  }

  if (order.paymentStatus === 'captured') {
    strapi.log.info('Order ' + order.orderNumber + ' already captured — ignoring session expiry');
    return;
  }

  await strapi.entityService.update('api::order.order', order.id, {
    data: { paymentStatus: 'expired', orderStatus: 'cancelled' } as any,
  });

  strapi.log.info('Order ' + order.orderNumber + ' session expired — order cancelled');
}

// ---------------------------------------------------------------------------
// Stock deduction
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Resolve Strapi user ID from a subscription (for user relation on orders)
// ---------------------------------------------------------------------------
async function resolveUserId(sub: any): Promise<number | null> {
  // Subscription already has the user relation populated
  if (sub.user?.id) return sub.user.id;

  // Fall back to email lookup
  if (sub.customerEmail) {
    try {
      const users: any[] = await strapi.entityService.findMany(
        'plugin::users-permissions.user' as any,
        { filters: { email: sub.customerEmail } as any, limit: 1 }
      ) as any[];
      if (users.length > 0) return users[0].id;
    } catch {
      // silent — user relation is optional
    }
  }
  return null;
}

// Process due subscriptions — called by cron job and admin trigger
// ---------------------------------------------------------------------------

export async function processDueSubscriptions() {
  const now = new Date();
  const stripe = getStripeClient();

  const dueSubs: any[] = await strapi.entityService.findMany(
    'api::customer-subscription.customer-subscription' as any,
    {
      filters: {
        status: 'active',
        nextBillingDate: { $lte: now.toISOString() },
      } as any,
      populate: ['shippingAddress', 'user'],
      limit: 200,
    }
  ) as any[];

  strapi.log.info('[subscriptions] Found ' + dueSubs.length + ' subscription(s) due for billing');

  const results = { processed: 0, failed: 0, errors: [] as string[] };

  for (const sub of dueSubs) {
    try {
      if (!sub.stripeCustomerId || !sub.stripePaymentMethodId) {
        strapi.log.warn('[subscriptions] Sub ' + sub.id + ' missing Stripe IDs — skipping');
        results.failed++;
        results.errors.push('Sub ' + sub.id + ': missing Stripe customer/payment method');
        continue;
      }

      const lineTotal = Number(sub.unitPrice) * Number(sub.quantity);
      const total = lineTotal + Number(sub.shippingCost || 0);
      const amountCents = Math.round(total * 100);

      // Create off-session PaymentIntent
      const pi = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: (sub.currency || 'GBP').toLowerCase(),
        customer: sub.stripeCustomerId,
        payment_method: sub.stripePaymentMethodId,
        off_session: true,
        confirm: true,
        description: sub.productName + ' subscription – ' + sub.interval,
        metadata: {
          subscriptionId: String(sub.id),
          productName: sub.productName,
          interval: sub.interval,
          customerEmail: sub.customerEmail,
        },
      });

      // Generate order number
      const ts = Date.now().toString(36).toUpperCase();
      const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
      const newOrderNumber = 'ORD-SUB-' + ts + '-' + rand;

      // Build order items
      const orderItems: any[] = [{
        productId: sub.productId,
        productName: sub.productName,
        productSlug: sub.productSlug || null,
        variantId: sub.variantId || null,
        quantity: sub.quantity,
        unitPrice: sub.unitPrice,
        totalPrice: lineTotal,
        sku: sub.variantDetails?.sku || '',
        weight: sub.variantDetails?.weight || '',
        isSubscription: true,
        subscriptionInterval: sub.interval,
        subscriptionDiscountPercentage: sub.discountPercentage || null,
        originalUnitPrice: sub.originalUnitPrice || null,
      }];

      // Create the new order in Strapi (publishedAt required for Strapi 5 draft/publish)
      await strapi.entityService.create('api::order.order', {
        data: {
          orderNumber: newOrderNumber,
          orderStatus: 'order_received',
          paymentStatus: 'captured',
          paymentMethod: 'stripe_subscription',
          paymentId: pi.id,
          customerEmail: sub.customerEmail,
          customerName: sub.customerName,
          shippingAddress: sub.shippingAddress || null,
          items: orderItems,
          subtotal: lineTotal,
          shippingCost: sub.shippingCost || 0,
          shippingMethod: sub.shippingMethod || '',
          tax: 0,
          discount: 0,
          total: total,
          currency: sub.currency || 'GBP',
          publishedAt: new Date().toISOString(),
          user: await resolveUserId(sub),
        } as any,
      });

      // Update subscription: next billing date, order list, totals
      const nextDate = calculateNextBillingDate(sub.interval);
      const updatedOrderNumbers = [...(sub.orderNumbers || []), newOrderNumber];
      await strapi.entityService.update(
        'api::customer-subscription.customer-subscription' as any,
        sub.id,
        {
          data: {
            nextBillingDate: nextDate.toISOString(),
            orderNumbers: updatedOrderNumbers,
            totalOrdersGenerated: (sub.totalOrdersGenerated || 1) + 1,
            totalRevenue: Number(sub.totalRevenue || 0) + total,
            lastBillingError: null,
          } as any,
        }
      );

      strapi.log.info('[subscriptions] Auto-billed sub ' + sub.id + ' → order ' + newOrderNumber);
      results.processed++;
    } catch (err: any) {
      const errMsg = err.message || String(err);
      strapi.log.error('[subscriptions] Failed to bill sub ' + sub.id + ': ' + errMsg);

      // If payment declined, mark the subscription so admin can see it
      const isDecline = err.type === 'StripeCardError' || errMsg.toLowerCase().includes('declined');
      await strapi.entityService.update(
        'api::customer-subscription.customer-subscription' as any,
        sub.id,
        {
          data: {
            status: isDecline ? 'payment_failed' : 'active',
            lastBillingError: errMsg,
          } as any,
        }
      ).catch(() => null);

      results.failed++;
      results.errors.push('Sub ' + sub.id + ': ' + errMsg);
    }
  }

  strapi.log.info(
    '[subscriptions] Billing complete — processed: ' + results.processed +
    ', failed: ' + results.failed
  );
  return results;
}

async function deductStock(orderItems: any[]) {
  for (const item of orderItems) {
    if (!item.productId || !item.quantity) continue;

    try {
      // Fetch the product with all variants
      const product: any = await strapi.entityService.findOne(
        'api::product.product',
        item.productId,
        { populate: ['variants'] }
      );

      if (!product || !product.variants || product.variants.length === 0) {
        strapi.log.warn('deductStock: product ' + item.productId + ' not found or has no variants');
        continue;
      }

      // Match variant by SKU (preferred) or by weight as fallback
      const variantIndex = product.variants.findIndex((v: any) =>
        (item.sku && v.sku === item.sku) ||
        (!item.sku && item.weight && v.weight === item.weight)
      );

      if (variantIndex === -1) {
        strapi.log.warn('deductStock: no matching variant for product ' + item.productId + ' sku=' + item.sku);
        continue;
      }

      const variant = product.variants[variantIndex];
      const currentStock = typeof variant.stockQuantity === 'number' ? variant.stockQuantity : 0;
      const newStock = Math.max(0, currentStock - item.quantity);

      // Build the updated variants array – Strapi replaces components on update
      const updatedVariants = product.variants.map((v: any, idx: number) => {
        if (idx !== variantIndex) return v;
        return {
          ...v,
          stockQuantity: newStock,
          inStock: newStock > 0,
        };
      });

      await strapi.entityService.update('api::product.product', item.productId, {
        data: { variants: updatedVariants } as any,
      });

      strapi.log.info(
        'Stock updated: product ' + item.productId +
        ' sku=' + (item.sku || item.weight) +
        ' ' + currentStock + ' → ' + newStock
      );
    } catch (err) {
      // Log but don't fail the webhook – stock can be corrected manually
      strapi.log.error('deductStock error for product ' + item.productId + ':', err);
    }
  }
}