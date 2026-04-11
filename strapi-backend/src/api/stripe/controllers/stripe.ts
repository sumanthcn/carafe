import Stripe from 'stripe';

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

      const lineItems = order.items.map((item: any) => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.productName,
            ...(item.weight ? { description: 'Weight: ' + item.weight } : {}),
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      }));

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

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: order.customerEmail,
        success_url: frontendUrl + '/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=' + orderId,
        cancel_url: frontendUrl + '/payment/cancelled?order_id=' + orderId,
        metadata: { orderId: String(orderId), orderNumber: order.orderNumber },
        payment_intent_data: { metadata: { orderId: String(orderId), orderNumber: order.orderNumber } },
      });

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
            const updateData: any = {
              paymentStatus: 'captured',
              orderStatus: 'order_received',
              stripeSessionId: session.id,
              paymentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
            };

            await strapi.entityService.update('api::order.order', order.id, { data: updateData });

            // Deduct stock if not already done
            const freshOrder: any = await strapi.entityService.findOne('api::order.order', order.id, { populate: ['items'] });
            if (freshOrder?.items?.length > 0) {
              await deductStock(freshOrder.items);
            }

            // Return updated values
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
          // Fall through and return current DB state
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

    const rawBody: Buffer = (ctx.request as any).rawBody;
    if (!rawBody) {
      strapi.log.error('Raw body unavailable for Stripe webhook verification');
      return ctx.badRequest('Raw body unavailable');
    }

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
      populate: ['items'],
      limit: 1,
    }) as any[];
    order = orders.length > 0 ? orders[0] : await strapi.entityService.findOne(
      'api::order.order', Number(orderId), { populate: ['items'] }
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

  await strapi.entityService.update('api::order.order', order.id, {
    data: { paymentStatus: 'failed', paymentId: paymentIntent.id } as any,
  });

  strapi.log.warn('Order ' + order.orderNumber + ' payment failed (pi: ' + paymentIntent.id + ')');
}

// ---------------------------------------------------------------------------
// Stock deduction
// ---------------------------------------------------------------------------

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