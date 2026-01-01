import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::customer-review.customer-review', ({ strapi }) => ({
  /**
   * Custom create method to automatically check if purchase is verified
   */
  async create(ctx) {
    const { data } = ctx.request.body;

    // Check if user has purchased this product
    if (data.email && data.product) {
      try {
        const orders = await strapi.entityService.findMany('api::order.order', {
          filters: {
            customerEmail: data.email,
            status: {
              $in: ['order_received', 'packed', 'shipped', 'in_transit', 'delivered']
            }
          },
          populate: {
            items: {
              populate: ['product']
            }
          }
        });

        // Check if any order contains this product
        let isVerifiedPurchase = false;
        for (const order of orders) {
          const orderData = order as any;
          if (orderData.items && Array.isArray(orderData.items)) {
            const hasProduct = orderData.items.some((item: any) => {
              return item.product && item.product.id === data.product;
            });
            if (hasProduct) {
              isVerifiedPurchase = true;
              break;
            }
          }
        }

        // Set the isVerifiedPurchase flag
        data.isVerifiedPurchase = isVerifiedPurchase;
      } catch (error) {
        console.error('Error checking verified purchase:', error);
        // If there's an error, default to false
        data.isVerifiedPurchase = false;
      }
    }

    // Call the default create method with the modified data
    ctx.request.body.data = data;
    return super.create(ctx);
  },

  /**
   * Custom endpoint to check if a user has purchased a product
   */
  async checkVerifiedPurchase(ctx) {
    const { email, productId } = ctx.query;

    if (!email || !productId) {
      return ctx.badRequest('Email and productId are required');
    }

    try {
      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: {
          customerEmail: email,
          status: {
            $in: ['order_received', 'packed', 'shipped', 'in_transit', 'delivered']
          }
        },
        populate: {
          items: {
            populate: ['product']
          }
        }
      });

      // Check if any order contains this product
      let isVerifiedPurchase = false;
      for (const order of orders) {
        const orderData = order as any;
        if (orderData.items && Array.isArray(orderData.items)) {
          const hasProduct = orderData.items.some((item: any) => {
            return item.product && item.product.id === parseInt(productId as string);
          });
          if (hasProduct) {
            isVerifiedPurchase = true;
            break;
          }
        }
      }

      return ctx.send({ isVerifiedPurchase });
    } catch (error) {
      console.error('Error checking verified purchase:', error);
      return ctx.internalServerError('Error checking verified purchase');
    }
  }
}));
