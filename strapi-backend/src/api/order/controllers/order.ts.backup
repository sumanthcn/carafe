import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::order.order", ({ strapi }) => ({
  /**
   * Create a new order for the authenticated user
   */
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You must be logged in to create an order");
    }

    const {
      items,
      subtotal,
      shippingCost,
      tax,
      total,
      currency,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      shippingMethod,
      notes,
    } = ctx.request.body.data;

    // Validate required fields
    if (!items || items.length === 0) {
      return ctx.badRequest("Order must contain at least one item");
    }

    if (!customerEmail || !customerName || !shippingAddress) {
      return ctx.badRequest("Customer details and shipping address are required");
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    try {
      // Create the order
      const order = await strapi.entityService.create("api::order.order", {
        data: {
          user: user.id,
          orderNumber,
          status: "order_received",
          paymentStatus: "pending",
          customerEmail,
          customerName,
          customerPhone,
          shippingAddress,
          items,
          subtotal,
          shippingCost: shippingCost || 0,
          tax: tax || 0,
          total,
          currency: currency || "EUR",
          paymentMethod: shippingMethod,
          notes,
        },
        populate: ["items", "shippingAddress"],
      });

      return ctx.send({
        data: order,
        message: "Order created successfully",
      });
    } catch (error) {
      strapi.log.error("Error creating order:", error);
      return ctx.internalServerError("Failed to create order");
    }
  },

  /**
   * Get all orders for the authenticated user
   */
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You must be logged in to view orders");
    }

    try {
      const orders = await strapi.entityService.findMany("api::order.order", {
        filters: {
          user: {
            id: user.id,
          },
        },
        populate: ["items", "shippingAddress"],
        sort: { createdAt: "desc" },
      });

      return ctx.send({
        data: orders,
      });
    } catch (error) {
      strapi.log.error("Error fetching orders:", error);
      return ctx.internalServerError("Failed to fetch orders");
    }
  },

  /**
   * Get a single order by ID (only if it belongs to the authenticated user)
   */
  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;

    if (!user) {
      return ctx.unauthorized("You must be logged in to view an order");
    }

    try {
      const order = await strapi.entityService.findOne("api::order.order", id, {
        populate: ["items", "shippingAddress", "billingAddress", "user"],
      });

      if (!order) {
        return ctx.notFound("Order not found");
      }

      // Check if the order belongs to the user
      // @ts-ignore - user relation is populated
      if (order.user?.id !== user.id) {
        return ctx.forbidden("You don't have permission to access this order");
      }

      return ctx.send({
        data: order,
      });
    } catch (error) {
      strapi.log.error("Error fetching order:", error);
      return ctx.internalServerError("Failed to fetch order");
    }
  },

  /**
   * Check if user has purchased a specific product and it has been delivered
   */
  async checkPurchase(ctx) {
    const user = ctx.state.user;
    const { productId } = ctx.params;

    if (!user) {
      return ctx.unauthorized("You must be logged in");
    }

    try {
      const orders = await strapi.entityService.findMany("api::order.order", {
        filters: {
          user: {
            id: user.id,
          },
          status: "delivered",
        },
        populate: ["items"],
      });

      // Check if any delivered order contains the product
      // @ts-ignore - items is populated as component
      const hasPurchased = orders.some((order: any) =>
        order.items?.some((item: any) => item.productId === parseInt(productId))
      );

      return ctx.send({
        data: {
          hasPurchased,
          canReview: hasPurchased,
        },
      });
    } catch (error) {
      strapi.log.error("Error checking purchase:", error);
      return ctx.internalServerError("Failed to check purchase");
    }
  },
}));
