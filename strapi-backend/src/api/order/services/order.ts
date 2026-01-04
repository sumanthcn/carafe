import { factories } from '@strapi/strapi';
import crypto from 'crypto';

export default factories.createCoreService('api::order.order', ({ strapi }) => ({
  /**
   * Generate unique order number
   */
  async generateOrderNumber() {
    const prefix = 'ORD';
    const timestamp = Date.now();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  },

  /**
   * Get shipping configuration
   */
  async getShippingConfig() {
    try {
      const config = await strapi.entityService.findMany('api::shipping-config.shipping-config', {
        populate: ['shippingOptions'],
      });
      return config;
    } catch (error) {
      strapi.log.error('Failed to fetch shipping config:', error);
      return null;
    }
  },

  /**
   * Calculate shipping cost based on subtotal and selected method
   */
  async calculateShippingCost(subtotal: number, shippingMethod: string) {
    const config = await this.getShippingConfig();
    
    if (!config || !config.shippingOptions) {
      throw new Error('Shipping configuration not found');
    }

    const selectedOption = config.shippingOptions.find(
      (option: any) => option.isActive && 
      `${option.carrierName} - ${option.serviceName}` === shippingMethod
    );

    if (!selectedOption) {
      throw new Error('Invalid shipping method');
    }

    // Check if order qualifies for free shipping
    if (selectedOption.freeEligible && subtotal >= config.freeShippingThreshold) {
      return 0;
    }

    return selectedOption.cost;
  },

  /**
   * Validate UK mainland address
   */
  validateUKAddress(address: any) {
    if (!address || !address.postcode) {
      return { valid: false, message: 'Postcode is required' };
    }

    // UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    if (!postcodeRegex.test(address.postcode.replace(/\s/g, ''))) {
      return { valid: false, message: 'Invalid UK postcode format' };
    }

    // Exclude non-mainland postcodes (Northern Ireland, Channel Islands, Isle of Man)
    const excludedPrefixes = ['BT', 'GY', 'JE', 'IM'];
    const postcodePrefix = address.postcode.substring(0, 2).toUpperCase();
    
    if (excludedPrefixes.includes(postcodePrefix)) {
      return { 
        valid: false, 
        message: 'Sorry, we only deliver to mainland UK addresses. Orders to Northern Ireland, Channel Islands, and Isle of Man are not currently supported.'
      };
    }

    return { valid: true };
  },

  /**
   * Calculate estimated delivery date
   */
  async calculateDeliveryEstimate(shippingMethod: string) {
    const config = await this.getShippingConfig();
    
    if (!config || !config.shippingOptions) {
      return null;
    }

    const selectedOption = config.shippingOptions.find(
      (option: any) => `${option.carrierName} - ${option.serviceName}` === shippingMethod
    );

    if (!selectedOption) {
      return null;
    }

    const today = new Date();
    let businessDays = config.processingDays + selectedOption.estimatedDays;
    let estimatedDate = new Date(today);

    while (businessDays > 0) {
      estimatedDate.setDate(estimatedDate.getDate() + 1);
      
      // Skip weekends if configured
      if (config.excludeWeekends && (estimatedDate.getDay() === 0 || estimatedDate.getDay() === 6)) {
        continue;
      }

      businessDays--;
    }

    return estimatedDate;
  },

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order: any) {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const trackingUrl = order.isGuestOrder 
        ? `${frontendUrl}/track-order?orderNumber=${order.orderNumber}&token=${order.orderTrackingToken}`
        : `${frontendUrl}/account/orders/${order.orderNumber}`;

      await strapi.plugins['email'].services.email.send({
        to: order.customerEmail,
        subject: `Order Confirmation - ${order.orderNumber}`,
        text: `Thank you for your order! Order Number: ${order.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .order-details { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmed!</h1>
              </div>
              <div class="content">
                <p>Dear ${order.customerName},</p>
                <p>Thank you for your order! We're excited to get your coffee delivered to you.</p>
                
                <div class="order-details">
                  <h2>Order Details</h2>
                  <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                  <p><strong>Total:</strong> £${order.total.toFixed(2)}</p>
                  <p><strong>Shipping Method:</strong> ${order.shippingMethod}</p>
                  <p><strong>Status:</strong> Order Received</p>
                </div>

                <p>Your order will be packed and dispatched within 1-2 working days (excluding weekends and UK bank holidays).</p>
                <p>You'll receive a tracking email once your order has been dispatched.</p>

                <center>
                  <a href="${trackingUrl}" class="button">Track Your Order</a>
                </center>
              </div>
              <div class="footer">
                <p>Carafe Coffee Roasters | www.carafecoffee.co.uk</p>
                <p>Need help? Contact us at support@carafecoffee.co.uk</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      strapi.log.info(`Order confirmation email sent to ${order.customerEmail}`);
    } catch (error) {
      strapi.log.error('Failed to send order confirmation:', error);
    }
  },

  /**
   * Send dispatch notification
   */
  async sendDispatchNotification(order: any) {
    try {
      await strapi.plugins['email'].services.email.send({
        to: order.customerEmail,
        subject: `Your order has been dispatched - ${order.orderNumber}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .tracking-box { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; border: 2px solid #27ae60; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📦 Order Dispatched!</h1>
              </div>
              <div class="content">
                <p>Good news, ${order.customerName}!</p>
                <p>Your order has been dispatched and is on its way to you.</p>
                
                <div class="tracking-box">
                  <h2>Tracking Information</h2>
                  <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                  <p><strong>Carrier:</strong> ${order.carrier}</p>
                  <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
                  <p><strong>Dispatched:</strong> ${new Date(order.dispatchedAt).toLocaleDateString('en-GB')}</p>
                </div>

                <p>Please note: Tracking information may take up to 24 hours to become active.</p>
              </div>
              <div class="footer">
                <p>Carafe Coffee Roasters | www.carafecoffee.co.uk</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      strapi.log.info(`Dispatch notification sent to ${order.customerEmail}`);
    } catch (error) {
      strapi.log.error('Failed to send dispatch notification:', error);
    }
  },

  /**
   * Validate order items and calculate totals
   */
  async validateOrderItems(items: any[]) {
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        throw new Error('Invalid item data');
      }

      if (item.quantity <= 0) {
        throw new Error('Item quantity must be positive');
      }

      calculatedSubtotal += item.price * item.quantity;
    }

    return {
      isValid: true,
      calculatedSubtotal,
    };
  },

  /**
   * Check if user can review a product (must have purchased and received it)
   */
  async canUserReviewProduct(userId: number, productId: number) {
    try {
      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: {
          user: userId,
          status: 'delivered',
        },
        populate: ['items'],
      });

      const hasPurchased = orders.some((order: any) =>
        order.items?.some((item: any) => item.productId === productId)
      );

      return hasPurchased;
    } catch (error) {
      strapi.log.error('Failed to check review eligibility:', error);
      return false;
    }
  },
}));
