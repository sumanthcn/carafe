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
      
      // For Single Type, findMany returns array with one item or the object directly
      if (Array.isArray(config) && config.length > 0) {
        return config[0];
      }
      
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
    const config: any = await this.getShippingConfig();
    
    if (!config || !config.shippingOptions) {
      strapi.log.error('Shipping configuration not found or has no options');
      throw new Error('Shipping configuration not found');
    }

    // Log available options for debugging
    strapi.log.info('Available shipping options:', config.shippingOptions.map((opt: any) => 
      `${opt.carrierName} - ${opt.serviceName}`
    ));
    strapi.log.info('Requested shipping method:', shippingMethod);

    const selectedOption = config.shippingOptions.find(
      (option: any) => option.isActive && 
      `${option.carrierName} - ${option.serviceName}` === shippingMethod
    );

    if (!selectedOption) {
      strapi.log.error(`Invalid shipping method: "${shippingMethod}". Available: ${config.shippingOptions.map((opt: any) => `"${opt.carrierName} - ${opt.serviceName}"`).join(', ')}`);
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
    const config: any = await this.getShippingConfig();
    
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
   * Send order confirmation email (delegates to emailService).
   * Kept for backwards-compatibility – called from order create flow.
   */
  async sendOrderConfirmation(order: any) {
    const { sendOrderEmail } = await import('./emailService');
    const { generateInvoicePdf } = await import('./invoiceService');

    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateInvoicePdf(order);
    } catch (err: any) {
      strapi.log.error('PDF generation failed in sendOrderConfirmation:', err.message);
    }

    await sendOrderEmail('order_received', order, strapi, pdfBuffer);
  },

  /**
   * Send dispatch notification email (delegates to emailService).
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
      const orders: any = await strapi.entityService.findMany('api::order.order', {
        filters: {
          user: { id: userId },
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
