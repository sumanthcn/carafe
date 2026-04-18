import { factories } from '@strapi/strapi';
import crypto from 'crypto';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  /**
   * Create a new order (supports both authenticated and guest checkout)
   */
  async create(ctx) {
    try {
      // Accept data from body directly or from body.data
      const data = ctx.request.body.data || ctx.request.body;

      // The POST /orders route has auth: false so guests can checkout.
      // But if a JWT is present we still want to link the order to the user.
      // ctx.state.user is only populated by Strapi when auth is required,
      // so we decode the token manually here.
      let user = ctx.state.user;
      if (!user) {
        const authHeader = ctx.request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const jwtService = strapi.plugins['users-permissions'].services.jwt;
            const payload: any = await jwtService.verify(token);
            if (payload?.id) {
              user = await strapi.entityService.findOne(
                'plugin::users-permissions.user',
                payload.id,
                {}
              );
            }
          } catch {
            // Invalid token – treat as guest
          }
        }
      }

      // Validate required fields
      if (!data.customerEmail || !data.customerName) {
        return ctx.badRequest('Customer email and name are required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.customerEmail)) {
        return ctx.badRequest('Invalid email format');
      }

      // Validate phone number if provided
      if (data.customerPhone) {
        const phoneRegex = /^(?:(?:\+|00)44|0)?\s?(?:\d\s?){9,10}$/;
        if (!phoneRegex.test(data.customerPhone.replace(/\s/g, ''))) {
          return ctx.badRequest('Invalid UK phone number format');
        }
      }

      // Validate shipping address
      if (!data.shippingAddress || !data.shippingAddress.country) {
        return ctx.badRequest('Shipping address is required');
      }

      // Validate UK mainland delivery only
      const addressValidation = strapi.service('api::order.order').validateUKAddress(data.shippingAddress);
      if (!addressValidation.valid) {
        return ctx.badRequest(addressValidation.message);
      }

      // Validate items
      if (!data.items || data.items.length === 0) {
        return ctx.badRequest('Order must contain at least one item');
      }

      // Generate unique order number
      const orderNumber = await strapi.service('api::order.order').generateOrderNumber();

      // Generate tracking token for guest orders
      let orderTrackingToken = null;
      let isGuestOrder = false;

      if (!user) {
        orderTrackingToken = crypto.randomBytes(32).toString('hex');
        isGuestOrder = true;
      }

      // Calculate shipping cost
      const shippingCost = await strapi.service('api::order.order').calculateShippingCost(
        data.subtotal,
        data.shippingMethod
      );

      // Calculate total
      const subtotal = parseFloat(data.subtotal) || 0;
      const tax = parseFloat(data.tax) || 0;
      const discount = parseFloat(data.discount) || 0;
      const total = subtotal + shippingCost + tax - discount;

      // Prepare order data
      const orderData: any = {
        orderNumber,
        orderStatus: 'order_received' as const,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone || null,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress || data.shippingAddress,
        items: data.items,
        subtotal,
        shippingCost,
        shippingMethod: data.shippingMethod,
        tax,
        discount,
        total,
        currency: data.currency || 'GBP',
        paymentMethod: data.paymentMethod || 'stripe',
        paymentStatus: 'pending',
        notes: data.notes || null,
        user: user ? { connect: [{ id: user.id }] } : null,
        orderTrackingToken,
        isGuestOrder,
      };

      // Create order
      const order: any = await strapi.entityService.create('api::order.order', {
        data: orderData,
        populate: ['items', 'shippingAddress', 'billingAddress', 'user'],
      });

      // Return order (excluding sensitive token for response)
      const { orderTrackingToken: _, ...safeOrder } = order;

      return {
        data: safeOrder,
        trackingToken: isGuestOrder ? orderTrackingToken : null,
        message: 'Order created successfully',
      };

    } catch (error) {
      strapi.log.error('Order creation failed:', error);
      return ctx.internalServerError(error.message || 'Failed to create order');
    }
  },

  /**
   * Track order by order number and token/email (public endpoint)
   */
  async track(ctx) {
    try {
      const { orderNumber, token, email, trackingNumber } = ctx.query;

      if (!orderNumber && !trackingNumber) {
        return ctx.badRequest('Order number or tracking number is required');
      }

      if (orderNumber && !token && !email) {
        return ctx.badRequest('Tracking token or email is required when looking up by order number');
      }

      // Build filters
      const filters: any = {};

      if (trackingNumber) {
        // Lookup by carrier tracking number (no auth required)
        filters.trackingNumber = trackingNumber;
      } else {
        filters.orderNumber = orderNumber;
        if (token) {
          filters.orderTrackingToken = token;
        } else if (email) {
          filters.customerEmail = email;
        }
      }

      // Find order
      const orders = await strapi.entityService.findMany('api::order.order', {
        filters,
        populate: ['items', 'shippingAddress'],
      });

      if (!orders || orders.length === 0) {
        return ctx.notFound('Order not found. Please check your order number and email/tracking link.');
      }

      const order: any = orders[0];

      // Return safe tracking information (no sensitive data)
      return {
        data: {
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          customerName: order.customerName,
          items: order.items.map((item: any) => ({
            name: item.productName,
            quantity: item.quantity,
          })),
          shippingAddress: {
            city: order.shippingAddress?.city,
            postcode: order.shippingAddress?.postcode,
          },
          shippingMethod: order.shippingMethod,
          carrier: order.carrier,
          trackingNumber: order.trackingNumber,
          dispatchedAt: order.dispatchedAt,
          deliveredAt: order.deliveredAt,
          total: order.total,
          currency: order.currency,
          createdAt: order.createdAt,
        },
      };

    } catch (error) {
      strapi.log.error('Order tracking failed:', error);
      return ctx.internalServerError('Failed to track order');
    }
  },

  /**
   * Get user's order history (authenticated only)
   */
  async myOrders(ctx) {
    try {
      let user = ctx.state.user;

      if (!user) {
        const authHeader = ctx.request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const jwtService = strapi.plugins['users-permissions'].services.jwt;
            const payload: any = await jwtService.verify(token);
            if (payload?.id) {
              user = await strapi.entityService.findOne('plugin::users-permissions.user', payload.id, {});
            }
          } catch { /* invalid token */ }
        }
      }

      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: {
          user: {
            id: user.id,
          },
        },
        populate: ['items', 'shippingAddress'],
        sort: { createdAt: 'desc' },
      });

      return {
        data: orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          items: order.items,
          subtotal: order.subtotal,
          shippingCost: order.shippingCost,
          total: order.total,
          currency: order.currency,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          shippingAddress: order.shippingAddress,
          shippingMethod: order.shippingMethod,
          carrier: order.carrier,
          trackingNumber: order.trackingNumber,
          stripeSessionId: order.stripeSessionId,
          paymentId: order.paymentId,
          notes: order.notes,
          dispatchedAt: order.dispatchedAt,
          deliveredAt: order.deliveredAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        })),
      };

    } catch (error) {
      strapi.log.error('Failed to fetch user orders:', error);
      return ctx.internalServerError('Failed to fetch orders');
    }
  },

  /**
   * Update order status (admin only)
   */
  /**
   * Update order status (admin only)
   */
  async updateStatus(ctx) {
    try {
      let user = ctx.state.user;

      if (!user) {
        const authHeader = ctx.request.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.slice(7);
          try {
            const jwtService = strapi.plugins['users-permissions'].services.jwt;
            const payload: any = await jwtService.verify(token);
            if (payload?.id) {
              user = await strapi.entityService.findOne(
                'plugin::users-permissions.user', payload.id,
                { populate: ['role'] }
              );
            }
          } catch { /* invalid token */ }
        }
      }

      if (!user) {
        return ctx.unauthorized('Authentication required');
      }

      const { id } = ctx.params;
      const { status, carrier, trackingNumber, notes } = ctx.request.body;

      const validStatuses = ['order_received', 'packed', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refunded'];
      if (status && !validStatuses.includes(status)) {
        return ctx.badRequest('Invalid status');
      }

      const updateData: any = {};

      if (status) updateData.orderStatus = status;
      if (notes) updateData.notes = notes;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (carrier !== undefined) updateData.carrier = carrier;

      // If status is shipped, require carrier and tracking number
      if (status === 'shipped' || status === 'in_transit') {
        if (!carrier || !trackingNumber) {
          return ctx.badRequest('Carrier and tracking number are required for shipped orders');
        }
        if (!updateData.dispatchedAt) {
          updateData.dispatchedAt = new Date();
        }
      }

      // If status is delivered, set deliveredAt
      if (status === 'delivered' && !updateData.deliveredAt) {
        updateData.deliveredAt = new Date();
      }

      if (Object.keys(updateData).length === 0) {
        return ctx.badRequest('Nothing to update');
      }

      // id may be a numeric database id OR a Strapi v5 documentId (string)
      const isDocumentId = isNaN(Number(id));
      let order: any;
      if (isDocumentId) {
        order = await (strapi.db as any).query('api::order.order').update({
          where: { documentId: id },
          data: updateData,
          populate: { items: true, shippingAddress: true, user: true },
        });
      } else {
        order = await strapi.entityService.update('api::order.order', Number(id), {
          data: updateData,
          populate: ['items', 'shippingAddress', 'user'],
        });
      }

      // Email is sent by the lifecycle afterUpdate hook (triggered by the update above).

      return {
        data: order,
        message: 'Order status updated successfully',
      };

    } catch (error) {
      strapi.log.error('Failed to update order status:', error);
      return ctx.internalServerError('Failed to update order status');
    }
  },

  /**
   * Check if user has purchased a specific product and it has been delivered
   */
  async checkPurchase(ctx) {
    const user = ctx.state.user;
    const { productId } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    try {
      const canReview = await strapi.service('api::order.order').canUserReviewProduct(
        user.id,
        parseInt(productId)
      );

      return ctx.send({
        data: {
          hasPurchased: canReview,
          canReview,
        },
      });
    } catch (error) {
      strapi.log.error('Error checking purchase:', error);
      return ctx.internalServerError('Failed to check purchase');
    }
  },

  /**
   * Get all orders (authenticated users only - their own orders)
   * Admins can see all orders
   */
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view orders');
    }

    try {
      const filters: any = {};

      // Non-admin users can only see their own orders
      if (user.role?.type !== 'admin') {
        filters.user = {
          id: user.id,
        };
      }

      const orders = await strapi.entityService.findMany('api::order.order', {
        filters,
        populate: ['items', 'shippingAddress'],
        sort: { createdAt: 'desc' },
      });

      return ctx.send({
        data: orders,
      });
    } catch (error) {
      strapi.log.error('Error fetching orders:', error);
      return ctx.internalServerError('Failed to fetch orders');
    }
  },

  /**
   * Get a single order by ID (only if it belongs to the authenticated user or user is admin)
   */
  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view an order');
    }

    try {
      // Populate user with role so we can check admin status
      const userWithRole: any = await strapi.entityService.findOne(
        'plugin::users-permissions.user', user.id, { populate: ['role'] }
      );
      const isAdmin = ['admin', 'superadmin', 'administrator'].includes(userWithRole?.role?.type);

      // id may be a numeric database id OR a Strapi v5 documentId (string)
      const isDocumentId = isNaN(Number(id));
      let order: any;
      if (isDocumentId) {
        order = await (strapi.db as any).query('api::order.order').findOne({
          where: { documentId: id },
          populate: { items: true, shippingAddress: true, billingAddress: true, user: { populate: ['role'] } },
        });
      } else {
        order = await strapi.entityService.findOne('api::order.order', Number(id), {
          populate: ['items', 'shippingAddress', 'billingAddress', 'user'],
        });
      }

      if (!order) {
        return ctx.notFound('Order not found');
      }

      // Non-admin users may only view their own orders
      if (!isAdmin && order.user?.id !== user.id) {
        return ctx.forbidden("You don't have permission to access this order");
      }

      return ctx.send({ data: order });
    } catch (error) {
      strapi.log.error('Error fetching order:', error);
      return ctx.internalServerError('Failed to fetch order');
    }
  },

  // ─────────────────────────────────────────────────────────────
  // Email & Invoice endpoints
  // ─────────────────────────────────────────────────────────────

  /**
   * POST /api/orders/:id/resend-email
   * Admin: manually re-send an email for any order status.
   *
   * Body: { emailType?: string }
   *   emailType defaults to the current order status, but can be
   *   overridden to any valid template type (e.g. "shipped").
   */
  async resendEmail(ctx) {
    // Route has auth:false – manually verify the Bearer JWT
    const authHeader = (ctx.request.headers.authorization || '') as string;
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return ctx.unauthorized('Authentication required');
    let userWithRole: any;
    try {
      const jwtService = strapi.plugins['users-permissions'].services.jwt;
      const payload: any = await jwtService.verify(token);
      if (!payload?.id) return ctx.unauthorized('Invalid token');
      userWithRole = await strapi.entityService.findOne(
        'plugin::users-permissions.user', payload.id, { populate: ['role'] }
      );
    } catch {
      return ctx.unauthorized('Invalid or expired token');
    }
    if (!userWithRole) return ctx.unauthorized('User not found');
    const isAdmin = ['admin', 'superadmin', 'administrator'].includes(userWithRole?.role?.type);
    if (!isAdmin) return ctx.forbidden('Admin access required');

    try {

      const { id } = ctx.params;
      const { emailType } = ctx.request.body ?? {};

      // Resolve order
      const isDocumentId = isNaN(Number(id));
      let order: any;
      if (isDocumentId) {
        order = await (strapi.db as any).query('api::order.order').findOne({
          where: { documentId: id },
          populate: { items: true, shippingAddress: true, billingAddress: true },
        });
      } else {
        order = await strapi.entityService.findOne('api::order.order', Number(id), {
          populate: ['items', 'shippingAddress', 'billingAddress'],
        });
      }

      if (!order) return ctx.notFound('Order not found');

      const type = emailType ?? order.orderStatus ?? order.status;

      // Generate PDF for order_received / delivered
      const { generateInvoicePdf } = await import('../services/invoiceService');
      const { sendOrderEmail } = await import('../services/emailService');

      let pdfBuffer: Buffer | undefined;
      if (type === 'order_received' || type === 'delivered') {
        pdfBuffer = await generateInvoicePdf(order);
      }

      await sendOrderEmail(type, order, strapi, pdfBuffer);

      return ctx.send({ message: `Email (${type}) resent to ${order.customerEmail}` });

    } catch (error: any) {
      strapi.log.error('resendEmail failed:', error.message);
      return ctx.internalServerError('Failed to resend email');
    }
  },

  /**
   * GET /api/orders/:id/invoice
   * Download a PDF invoice for an order.
   * Accessible by the order owner or an admin.
   */
  async downloadInvoice(ctx) {
    // Route has auth:false – manually verify the Bearer JWT
    const authHeader = (ctx.request.headers.authorization || '') as string;
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return ctx.unauthorized('Authentication required');
    let user: any;
    try {
      const jwtService = strapi.plugins['users-permissions'].services.jwt;
      const payload: any = await jwtService.verify(token);
      if (!payload?.id) return ctx.unauthorized('Invalid token');
      user = await strapi.entityService.findOne(
        'plugin::users-permissions.user', payload.id, { populate: ['role'] }
      );
    } catch {
      return ctx.unauthorized('Invalid or expired token');
    }
    if (!user) return ctx.unauthorized('User not found');
    const isAdmin = ['admin', 'superadmin', 'administrator'].includes(user?.role?.type);

    try {
      const { id } = ctx.params;

      // Resolve order
      const isDocumentId = isNaN(Number(id));
      let order: any;
      if (isDocumentId) {
        order = await (strapi.db as any).query('api::order.order').findOne({
          where: { documentId: id },
          populate: { items: true, shippingAddress: true, billingAddress: true, user: true },
        });
      } else {
        order = await strapi.entityService.findOne('api::order.order', Number(id), {
          populate: ['items', 'shippingAddress', 'billingAddress', 'user'],
        });
      }

      if (!order) return ctx.notFound('Order not found');

      // Permission: owner or admin
      if (!isAdmin && order.user?.id !== user.id) {
        return ctx.forbidden("You don't have permission to access this invoice");
      }

      const { generateInvoicePdf } = await import('../services/invoiceService');
      const pdfBuffer = await generateInvoicePdf(order);

      ctx.set('Content-Type', 'application/pdf');
      ctx.set('Content-Disposition', `attachment; filename="invoice-${order.orderNumber}.pdf"`);
      ctx.set('Content-Length', String(pdfBuffer.length));
      ctx.body = pdfBuffer;

    } catch (error: any) {
      strapi.log.error('downloadInvoice failed:', error.message);
      return ctx.internalServerError('Failed to generate invoice');
    }
  },
}));
