# E-Commerce Order Management System - Implementation Guide

## Executive Summary

This document outlines the complete implementation for a production-grade e-commerce order management system with guest checkout, Worldpay payment integration, shipping management, and order tracking.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Nuxt 3)                        │
├─────────────────────────────────────────────────────────────────┤
│  Cart → Checkout → Payment → Order Confirmation → Tracking      │
│  (Guest + Auth)    (Worldpay)                                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ REST API
                     │
┌────────────────────┴────────────────────────────────────────────┐
│                      BACKEND (Strapi v5)                         │
├─────────────────────────────────────────────────────────────────┤
│  Orders  │  Shipping Config  │  Payment Gateway  │  Webhooks    │
│  (Collection)  (Single Type)     (Worldpay)        (Secure)     │
└─────────────────────────────────────────────────────────────────┘
```

## PHASE 1: BACKEND IMPLEMENTATION

### 1.1 Order Schema Extensions ✅ COMPLETED

**File**: `src/api/order/content-types/order/schema.json`

Added fields:
- `orderTrackingToken` - Secure token for guest order tracking
- `shippingMethod` - Selected shipping option
- `carrier` - Delivery carrier (Royal Mail, DPD)
- `trackingNumber` - Carrier tracking reference
- `dispatchedAt` - When order was shipped
- `deliveredAt` - When order was delivered
- `isGuestOrder` - Flag for guest vs authenticated orders

### 1.2 Shipping Configuration ✅ COMPLETED

**File**: `src/api/shipping-config/content-types/shipping-config/schema.json`

Single Type for admin-configurable shipping:
- `freeShippingThreshold` - Minimum order value for free shipping (£25)
- `shippingOptions` - Repeatable component with carrier options
- `allowedCountries` - Currently ["GB"] only
- `processingDays` - Business days for dispatch (1-2 days)
- `excludeWeekends` - No weekend dispatch
- `excludeBankHolidays` - No bank holiday dispatch

**Component**: `elements/shipping-option.json`
- carrierName (Royal Mail, DPD)
- serviceName (Tracked 24, Next Day)
- cost
- freeEligible
- estimatedDays
- isActive

### 1.3 Order Service Layer

**File**: `src/api/order/services/order.ts`

```typescript
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
    const config = await strapi.entityService.findMany('api::shipping-config.shipping-config', {
      populate: ['shippingOptions'],
    });
    return config;
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
      option => option.isActive && 
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

    // Exclude non-mainland postcodes (Northern Ireland, Channel Islands, etc.)
    const excludedPrefixes = ['BT', 'GY', 'JE', 'IM'];
    const postcodePrefix = address.postcode.substring(0, 2).toUpperCase();
    
    if (excludedPrefixes.includes(postcodePrefix)) {
      return { 
        valid: false, 
        message: 'Sorry, we only deliver to mainland UK addresses'
      };
    }

    return { valid: true };
  },

  /**
   * Calculate estimated delivery date
   */
  async calculateDeliveryEstimate(shippingMethod: string) {
    const config = await this.getShippingConfig();
    const selectedOption = config.shippingOptions.find(
      option => `${option.carrierName} - ${option.serviceName}` === shippingMethod
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
      await strapi.plugins['email'].services.email.send({
        to: order.customerEmail,
        subject: `Order Confirmation - ${order.orderNumber}`,
        text: `Thank you for your order! Order Number: ${order.orderNumber}`,
        html: `
          <h1>Order Confirmed</h1>
          <p>Thank you ${order.customerName} for your order!</p>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Total:</strong> £${order.total.toFixed(2)}</p>
          <p>We'll send you a tracking email once your order has been dispatched.</p>
          ${order.isGuestOrder ? `
            <p><strong>Track your order:</strong><br>
            <a href="${process.env.FRONTEND_URL}/track-order?orderNumber=${order.orderNumber}&token=${order.orderTrackingToken}">
              Click here to track
            </a></p>
          ` : ''}
        `,
      });
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
          <h1>Order Dispatched</h1>
          <p>Good news ${order.customerName}! Your order has been dispatched.</p>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Carrier:</strong> ${order.carrier}</p>
          <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
          <p>Tracking will be active within 24 hours.</p>
        `,
      });
    } catch (error) {
      strapi.log.error('Failed to send dispatch notification:', error);
    }
  },
}));
```

### 1.4 Enhanced Order Controller

**File**: `src/api/order/controllers/order.ts`

**Key Methods:**

1. **`create(ctx)`** - Enhanced to support:
   - Guest checkout (no authentication required)
   - Email and phone validation
   - UK address validation
   - Automatic shipping cost calculation
   - Secure tracking token generation
   - Order confirmation emails

2. **`track(ctx)`** - Public endpoint for order tracking:
   - Input: orderNumber + (token OR email)
   - Returns: Safe order status info (no sensitive data)
   - No authentication required

3. **`myOrders(ctx)`** - Authenticated user's order history

4. **`updateStatus(ctx)`** - Admin only:
   - Update order status
   - Add carrier and tracking info
   - Trigger dispatch notifications

### 1.5 Custom Routes

**File**: `src/api/order/routes/custom-order.ts`

```typescript
export default {
  routes: [
    {
      method: 'POST',
      path: '/orders',
      handler: 'order.create',
      config: {
        policies: [],
        middlewares: ['plugin::users-permissions.rateLimit'],
      },
    },
    {
      method: 'GET',
      path: '/orders/track',
      handler: 'order.track',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/orders/my-orders',
      handler: 'order.myOrders',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/orders/:id/status',
      handler: 'order.updateStatus',
      config: {
        policies: ['admin::isAdmin'],
      },
    },
  ],
};
```

## PHASE 2: PAYMENT GATEWAY INTEGRATION (WORLDPAY)

### 2.1 Payment Service

**File**: `src/api/payment/services/worldpay.ts`

```typescript
import crypto from 'crypto';

export default () => ({
  /**
   * Initialize Worldpay payment
   */
  async initiatePayment(order: any) {
    const worldpayConfig = {
      merchantCode: process.env.WORLDPAY_MERCHANT_CODE,
      apiKey: process.env.WORLDPAY_API_KEY,
      environment: process.env.WORLDPAY_ENV || 'test',
    };

    const orderCode = `WP-${order.orderNumber}-${Date.now()}`;

    const paymentData = {
      orderCode,
      amount: Math.round(order.total * 100), // Convert to pence
      currency: order.currency || 'GBP',
      description: `Order ${order.orderNumber} - ${order.shippingMethod}`,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      billingAddress: order.billingAddress,
      successUrl: `${process.env.FRONTEND_URL}/checkout/success?orderNumber=${order.orderNumber}`,
      failureUrl: `${process.env.FRONTEND_URL}/checkout/failure`,
      cancelUrl: `${process.env.FRONTEND_URL}/checkout`,
      callbackUrl: `${process.env.STRAPI_URL}/api/webhooks/worldpay`,
    };

    // Update order with Worldpay order code
    await strapi.entityService.update('api::order.order', order.id, {
      data: {
        worldpayOrderCode: orderCode,
      },
    });

    return {
      orderCode,
      paymentUrl: `https://secure${worldpayConfig.environment === 'test' ? '-test' : ''}.worldpay.com/jsp/merchant/xml/paymentService.jsp`,
      paymentData,
    };
  },

  /**
   * Verify Worldpay webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string) {
    const secret = process.env.WORLDPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  },

  /**
   * Handle payment success
   */
  async handlePaymentSuccess(worldpayOrderCode: string, transactionId: string) {
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: {
        worldpayOrderCode,
      },
    });

    if (!orders || orders.length === 0) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    await strapi.entityService.update('api::order.order', order.id, {
      data: {
        paymentStatus: 'captured',
        paymentId: transactionId,
        status: 'order_received',
      },
    });

    // Send order confirmation
    await strapi.service('api::order.order').sendOrderConfirmation(order);

    return order;
  },

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(worldpayOrderCode: string, reason: string) {
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: {
        worldpayOrderCode,
      },
    });

    if (orders && orders.length > 0) {
      await strapi.entityService.update('api::order.order', orders[0].id, {
        data: {
          paymentStatus: 'failed',
          notes: `Payment failed: ${reason}`,
        },
      });
    }
  },
});
```

### 2.2 Webhook Controller

**File**: `src/api/webhook/controllers/worldpay.ts`

```typescript
export default {
  async worldpay(ctx) {
    try {
      const signature = ctx.request.headers['x-worldpay-signature'];
      const payload = JSON.stringify(ctx.request.body);

      // Verify webhook signature
      const isValid = strapi.service('api::payment.worldpay').verifyWebhookSignature(
        payload,
        signature
      );

      if (!isValid) {
        return ctx.unauthorized('Invalid webhook signature');
      }

      const { event, orderCode, transactionId, reason } = ctx.request.body;

      switch (event) {
        case 'payment_success':
        case 'payment_authorized':
          await strapi.service('api::payment.worldpay').handlePaymentSuccess(
            orderCode,
            transactionId
          );
          break;

        case 'payment_failed':
        case 'payment_cancelled':
          await strapi.service('api::payment.worldpay').handlePaymentFailure(
            orderCode,
            reason
          );
          break;

        default:
          strapi.log.warn(`Unhandled webhook event: ${event}`);
      }

      return ctx.send({ received: true });

    } catch (error) {
      strapi.log.error('Webhook processing failed:', error);
      return ctx.internalServerError('Webhook processing failed');
    }
  },
};
```

## PHASE 3: FRONTEND IMPLEMENTATION (NUXT 3)

### 3.1 Composables

#### `useCheckout.ts`

```typescript
export const useCheckout = () => {
  const cart = useCartStore();
  const auth = useAuthStore();
  const config = useRuntimeConfig();

  const checkoutData = ref({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      city: '',
      postcode: '',
      country: 'GB',
    },
    billingAddress: null,
    sameAsBilling: true,
    shippingMethod: '',
    createAccount: false,
  });

  const shippingOptions = ref([]);
  const selectedShipping = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Fetch shipping options
  const fetchShippingOptions = async () => {
    try {
      const response = await $fetch(`${config.public.strapiUrl}/api/shipping-config`, {
        params: {
          populate: 'shippingOptions',
        },
      });

      shippingOptions.value = response.data.shippingOptions.filter(opt => opt.isActive);
    } catch (err) {
      error.value = 'Failed to load shipping options';
    }
  };

  // Calculate shipping cost
  const calculateShipping = computed(() => {
    if (!selectedShipping.value) return 0;

    const option = shippingOptions.value.find(
      opt => opt.id === selectedShipping.value
    );

    if (!option) return 0;

    // Check for free shipping eligibility
    if (option.freeEligible && cart.subtotal >= 25) {
      return 0;
    }

    return option.cost;
  });

  // Calculate totals
  const orderSummary = computed(() => {
    const subtotal = cart.subtotal;
    const shipping = calculateShipping.value;
    const tax = 0; // UK VAT already included in product prices
    const total = subtotal + shipping;

    return {
      subtotal,
      shipping,
      tax,
      total,
    };
  });

  // Create order
  const createOrder = async () => {
    loading.value = true;
    error.value = null;

    try {
      const orderData = {
        data: {
          customerEmail: checkoutData.value.customerEmail,
          customerName: checkoutData.value.customerName,
          customerPhone: checkoutData.value.customerPhone,
          shippingAddress: checkoutData.value.shippingAddress,
          billingAddress: checkoutData.value.sameAsBilling 
            ? checkoutData.value.shippingAddress 
            : checkoutData.value.billingAddress,
          items: cart.items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            variantId: item.variant?.id,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,
          })),
          subtotal: orderSummary.value.subtotal,
          shippingCost: orderSummary.value.shipping,
          shippingMethod: selectedShipping.value,
          tax: orderSummary.value.tax,
          total: orderSummary.value.total,
          currency: 'GBP',
        },
      };

      const headers = {};
      if (auth.isAuthenticated) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      const response = await $fetch(`${config.public.strapiUrl}/api/orders`, {
        method: 'POST',
        headers,
        body: orderData,
      });

      // Store tracking token for guest orders
      if (response.trackingToken) {
        localStorage.setItem('orderTrackingToken', response.trackingToken);
      }

      // Clear cart
      cart.clearCart();

      return response.data;

    } catch (err) {
      error.value = err.message || 'Failed to create order';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Initialize payment
  const initiatePayment = async (orderId) => {
    try {
      const response = await $fetch(`${config.public.strapiUrl}/api/payments/initiate`, {
        method: 'POST',
        body: {
          orderId,
        },
      });

      return response;
    } catch (err) {
      error.value = 'Failed to initialize payment';
      throw err;
    }
  };

  return {
    checkoutData,
    shippingOptions,
    selectedShipping,
    orderSummary,
    loading,
    error,
    fetchShippingOptions,
    createOrder,
    initiatePayment,
  };
};
```

#### `useOrderTracking.ts`

```typescript
export const useOrderTracking = () => {
  const config = useRuntimeConfig();
  const order = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const trackOrder = async (orderNumber: string, token?: string, email?: string) => {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        orderNumber,
        ...(token && { token }),
        ...(email && { email }),
      });

      const response = await $fetch(
        `${config.public.strapiUrl}/api/orders/track?${params.toString()}`
      );

      order.value = response.data;
      return response.data;

    } catch (err) {
      error.value = 'Order not found. Please check your order number and email/tracking link.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getStatusTimeline = computed(() => {
    if (!order.value) return [];

    const statuses = [
      { key: 'order_received', label: 'Order Received', completed: true },
      { key: 'packed', label: 'Packed', completed: false },
      { key: 'shipped', label: 'Shipped', completed: false },
      { key: 'in_transit', label: 'In Transit', completed: false },
      { key: 'delivered', label: 'Delivered', completed: false },
    ];

    const currentIndex = statuses.findIndex(s => s.key === order.value.status);
    
    return statuses.map((status, index) => ({
      ...status,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  });

  return {
    order,
    loading,
    error,
    trackOrder,
    getStatusTimeline,
  };
};
```

### 3.2 Checkout Page

**File**: `pages/checkout/index.vue`

```vue
<template>
  <div class="checkout-page">
    <div class="container">
      <h1>Checkout</h1>

      <!-- Guest/Auth Toggle -->
      <div v-if="!auth.isAuthenticated" class="auth-prompt">
        <p>Already have an account? <NuxtLink to="/login?redirect=/checkout">Login</NuxtLink></p>
      </div>

      <!-- Customer Details -->
      <section class="checkout-section">
        <h2>Customer Details</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Email *</label>
            <input 
              v-model="checkoutData.customerEmail" 
              type="email" 
              required 
              placeholder="your@email.com"
            />
          </div>

          <div class="form-group">
            <label>Full Name *</label>
            <input 
              v-model="checkoutData.customerName" 
              type="text" 
              required 
              placeholder="John Smith"
            />
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input 
              v-model="checkoutData.customerPhone" 
              type="tel" 
              placeholder="07XXX XXXXXX"
            />
          </div>
        </form>
      </section>

      <!-- Shipping Address -->
      <section class="checkout-section">
        <h2>Shipping Address</h2>
        <div class="form-group">
          <label>Street Address *</label>
          <input 
            v-model="checkoutData.shippingAddress.street" 
            required 
            placeholder="123 High Street"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>City *</label>
            <input 
              v-model="checkoutData.shippingAddress.city" 
              required 
              placeholder="London"
            />
          </div>

          <div class="form-group">
            <label>Postcode *</label>
            <input 
              v-model="checkoutData.shippingAddress.postcode" 
              required 
              placeholder="SW1A 1AA"
            />
          </div>
        </div>

        <p class="notice">🇬🇧 Delivery available to mainland UK only</p>
      </section>

      <!-- Shipping Options -->
      <section class="checkout-section">
        <h2>Shipping Method</h2>
        <div class="shipping-options">
          <div 
            v-for="option in shippingOptions" 
            :key="option.id"
            class="shipping-option"
            :class="{ selected: selectedShipping === option.id }"
            @click="selectedShipping = option.id"
          >
            <div class="option-details">
              <strong>{{ option.carrierName }} - {{ option.serviceName }}</strong>
              <p>{{ option.description }}</p>
              <span class="estimate">Estimated {{ option.estimatedDays }} day(s)</span>
            </div>
            <div class="option-price">
              <span v-if="option.freeEligible && orderSummary.subtotal >= 25">
                FREE
              </span>
              <span v-else>£{{ option.cost.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Order Summary -->
      <section class="checkout-section order-summary">
        <h2>Order Summary</h2>
        <div class="summary-line">
          <span>Subtotal</span>
          <span>£{{ orderSummary.subtotal.toFixed(2) }}</span>
        </div>
        <div class="summary-line">
          <span>Shipping</span>
          <span>£{{ orderSummary.shipping.toFixed(2) }}</span>
        </div>
        <div class="summary-line total">
          <span>Total</span>
          <span>£{{ orderSummary.total.toFixed(2) }}</span>
        </div>

        <button 
          @click="handleCheckout" 
          :disabled="loading || !selectedShipping"
          class="btn btn-primary btn-lg"
        >
          {{ loading ? 'Processing...' : 'Proceed to Payment' }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const { 
  checkoutData, 
  shippingOptions, 
  selectedShipping, 
  orderSummary,
  loading,
  error,
  fetchShippingOptions,
  createOrder,
  initiatePayment,
} = useCheckout();

onMounted(async () => {
  await fetchShippingOptions();
  
  // Pre-fill for authenticated users
  if (auth.isAuthenticated && auth.user) {
    checkoutData.value.customerEmail = auth.user.email;
    checkoutData.value.customerName = auth.user.username;
  }
});

const handleCheckout = async () => {
  try {
    // Validate
    if (!selectedShipping.value) {
      error.value = 'Please select a shipping method';
      return;
    }

    // Create order
    const order = await createOrder();

    // Initiate payment
    const payment = await initiatePayment(order.id);

    // Redirect to Worldpay
    window.location.href = payment.paymentUrl;

  } catch (err) {
    console.error('Checkout failed:', err);
  }
};
</script>
```

### 3.3 Order Tracking Page

**File**: `pages/track-order.vue`

```vue
<template>
  <div class="track-order-page">
    <div class="container">
      <h1>Track Your Order</h1>

      <div v-if="!order" class="tracking-form">
        <form @submit.prevent="handleTrack">
          <div class="form-group">
            <label>Order Number *</label>
            <input 
              v-model="orderNumber" 
              required 
              placeholder="ORD-1234567890-ABC"
            />
          </div>

          <div class="form-group">
            <label>Email Address *</label>
            <input 
              v-model="email" 
              type="email" 
              required 
              placeholder="your@email.com"
            />
          </div>

          <button type="submit" :disabled="loading" class="btn btn-primary">
            {{ loading ? 'Searching...' : 'Track Order' }}
          </button>

          <p v-if="error" class="error">{{ error }}</p>
        </form>
      </div>

      <div v-else class="order-details">
        <div class="order-header">
          <h2>Order {{ order.orderNumber }}</h2>
          <span :class="`status status-${order.status}`">
            {{ order.status.replace('_', ' ').toUpperCase() }}
          </span>
        </div>

        <!-- Status Timeline -->
        <div class="status-timeline">
          <div 
            v-for="(step, index) in getStatusTimeline" 
            :key="step.key"
            class="timeline-step"
            :class="{ 
              completed: step.completed, 
              current: step.current 
            }"
          >
            <div class="step-marker">
              <span v-if="step.completed">✓</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-label">{{ step.label }}</div>
          </div>
        </div>

        <!-- Shipping Details -->
        <div v-if="order.carrier" class="shipping-details">
          <h3>Shipping Information</h3>
          <p><strong>Carrier:</strong> {{ order.carrier }}</p>
          <p><strong>Tracking Number:</strong> {{ order.trackingNumber }}</p>
          <p v-if="order.dispatchedAt">
            <strong>Dispatched:</strong> {{ formatDate(order.dispatchedAt) }}
          </p>
        </div>

        <!-- Order Items -->
        <div class="order-items">
          <h3>Items</h3>
          <ul>
            <li v-for="item in order.items" :key="item.id">
              {{ item.name }} × {{ item.quantity }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { order, loading, error, trackOrder, getStatusTimeline } = useOrderTracking();

const orderNumber = ref(route.query.orderNumber as string || '');
const email = ref('');
const token = ref(route.query.token as string || '');

// Auto-track if token is in URL
onMounted(async () => {
  if (orderNumber.value && token.value) {
    await trackOrder(orderNumber.value, token.value);
  }
});

const handleTrack = async () => {
  await trackOrder(orderNumber.value, undefined, email.value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
</script>
```

## PHASE 4: SECURITY & SESSION MANAGEMENT

### 4.1 Auto-Logout Middleware

**File**: `middleware/auth-timeout.global.ts`

```typescript
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const auth = useAuthStore();
    const TIMEOUT_DURATION = 60 * 60 * 1000; // 1 hour

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      
      if (auth.isAuthenticated) {
        inactivityTimer = setTimeout(() => {
          auth.logout();
          navigateTo('/');
        }, TIMEOUT_DURATION);
      }
    };

    // Track user activity
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();
  }
});
```

### 4.2 Rate Limiting (Backend)

**File**: `src/middlewares/rateLimit.ts`

```typescript
import rateLimit from 'express-rate-limit';

export default () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for authenticated admin users
      return req.state?.user?.role?.type === 'admin';
    },
  });
};
```

## ENVIRONMENT VARIABLES

### Backend `.env`

```bash
# Worldpay Configuration
WORLDPAY_MERCHANT_CODE=your_merchant_code
WORLDPAY_API_KEY=your_api_key
WORLDPAY_ENV=test  # or 'production'
WORLDPAY_WEBHOOK_SECRET=your_webhook_secret

# Frontend URL
FRONTEND_URL=https://www.carafecoffee.co.uk

# Email Configuration
EMAIL_PROVIDER=sendgrid
EMAIL_PROVIDER_API_KEY=your_sendgrid_api_key
EMAIL_DEFAULT_FROM=orders@carafecoffee.co.uk
EMAIL_DEFAULT_REPLY_TO=support@carafecoffee.co.uk
```

### Frontend `.env`

```bash
NUXT_PUBLIC_STRAPI_URL=https://admin.carafecoffee.co.uk
NUXT_PUBLIC_WORLDPAY_ENV=test
```

## IMPLEMENTATION CHECKLIST

### Backend (Strapi)
- [x] Extend Order schema with tracking fields
- [x] Create Shipping Configuration single type
- [x] Create Shipping Option component
- [ ] Implement Order Service layer
- [ ] Enhance Order Controller for guest checkout
- [ ] Create Payment Service (Worldpay)
- [ ] Create Webhook Controller
- [ ] Add custom routes
- [ ] Configure email templates
- [ ] Set up rate limiting
- [ ] Add validation middleware
- [ ] Configure CORS for Worldpay
- [ ] Test with Worldpay sandbox

### Frontend (Nuxt)
- [ ] Create useCheckout composable
- [ ] Create useOrderTracking composable
- [ ] Build Checkout page
- [ ] Build Track Order page
- [ ] Build Order Success page
- [ ] Build Order History page (authenticated)
- [ ] Implement auto-logout
- [ ] Add form validation
- [ ] Handle payment redirects
- [ ] Test guest checkout flow
- [ ] Test authenticated checkout flow
- [ ] Test order tracking

### Admin Panel
- [ ] Configure Shipping Config in Strapi admin
- [ ] Add Royal Mail Tracked 24 option
- [ ] Add DPD Next Day option
- [ ] Set free shipping threshold (£25)
- [ ] Test order management interface
- [ ] Test status updates
- [ ] Test email notifications

### Testing & Security
- [ ] Validate UK postcode format
- [ ] Block non-mainland postcodes
- [ ] Test rate limiting
- [ ] Test webhook signature verification
- [ ] Test guest order creation
- [ ] Test tracking token security
- [ ] Verify email/phone validation
- [ ] Test auto-logout timing
- [ ] Load test checkout endpoint
- [ ] Security audit

### Documentation
- [ ] API documentation
- [ ] Webhook integration guide
- [ ] Admin user guide
- [ ] Customer support guide
- [ ] Deployment checklist

## NEXT STEPS

1. **Immediate**: Create the Order Service file with all helper methods
2. **Priority 1**: Complete the enhanced Order Controller
3. **Priority 2**: Implement Payment Gateway integration
4. **Priority 3**: Build Frontend checkout flow
5. **Priority 4**: Configure email notifications
6. **Priority 5**: Testing and security hardening

Would you like me to proceed with implementing any specific section?
