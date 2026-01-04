import { factories } from '@strapi/strapi';
import crypto from 'crypto';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  /**
   * Create a new order (supports both authenticated and guest checkout)
   */
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      const user = ctx.state.user;

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
      const orderData = {
        orderNumber,
        status: 'order_received',
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
        paymentMethod: data.paymentMethod || 'worldpay',
        paymentStatus: 'pending',
        notes: data.notes || null,
        user: user ? user.id : null,
        orderTrackingToken,
        isGuestOrder,
      };

      // Create order
      const order = await strapi.entityService.create('api::order.order', {
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
      const { orderNumber, token, email } = ctx.query;

      if (!orderNumber) {
        return ctx.badRequest('Order number is required');
      }

      if (!token && !email) {
        return ctx.badRequest('Tracking token or email is required');
      }

      // Build filters
      const filters: any = {
        orderNumber: orderNumber,
      };

      if (token) {
        filters.orderTrackingToken = token;
      } else if (email) {
        filters.customerEmail = email;
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
          status: order.status,
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
      const user = ctx.state.user;

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
          documentId: order.documentId,
          orderNumber: order.orderNumber,
          status: order.status,
          items: order.items,
          total: order.total,
          currency: order.currency,
          createdAt: order.createdAt,
          shippingAddress: order.shippingAddress,
          carrier: order.carrier,
          trackingNumber: order.trackingNumber,
          dispatchedAt: order.dispatchedAt,
          deliveredAt: order.deliveredAt,
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
  async updateStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status, carrier, trackingNumber } = ctx.request.body;

      if (!status) {
        return ctx.badRequest('Status is required');
      }

      const validStatuses = ['order_received', 'packed', 'shipped', 'in_transit', 'delivered', 'cancelled', 'refunded'];
      if (!validStatuses.includes(status)) {
        return ctx.badRequest('Invalid status');
      }

      const updateData: any = {
        status,
      };

      // If status is shipped, require carrier and tracking number
      if (status === 'shipped' || status === 'in_transit') {
        if (!carrier || !trackingNumber) {
          return ctx.badRequest('Carrier and tracking number are required for shipped orders');
        }
        updateData.carrier = carrier;
        updateData.trackingNumber = trackingNumber;
        
        if (!updateData.dispatchedAt) {
          updateData.dispatchedAt = new Date();
        }
      }

      // If status is delivered, set deliveredAt
      if (status === 'delivered' && !updateData.deliveredAt) {
        updateData.deliveredAt = new Date();
      }

      const order = await strapi.entityService.update('api::order.order', id, {
        data: updateData,
        populate: ['items', 'shippingAddress', 'user'],
      });

      // Send dispatch notification if status changed to shipped
      if (status === 'shipped' || status === 'in_transit') {
        await strapi.service('api::order.order').sendDispatchNotification(order);
      }

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
      const order = await strapi.entityService.findOne('api::order.order', id, {
        populate: ['items', 'shippingAddress', 'billingAddress', 'user'],
      });

      if (!order) {
        return ctx.notFound('Order not found');
      }

      // Check if the order belongs to the user (unless admin)
      if (user.role?.type !== 'admin' && order.user?.id !== user.id) {
        return ctx.forbidden("You don't have permission to access this order");
      }

      return ctx.send({
        data: order,
      });
    } catch (error) {
      strapi.log.error('Error fetching order:', error);
      return ctx.internalServerError('Failed to fetch order');
    }
  },
}));
