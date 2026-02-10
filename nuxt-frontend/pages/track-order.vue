<template>
  <div class="track-order-page">
    <div class="container">
      <h1 class="page-title">Track Your Order</h1>

      <!-- Tracking Form -->
      <div v-if="!order" class="tracking-form-section">
        <div class="tracking-form-card">
          <p class="form-description">
            Enter your order number and email address to track your order status.
            Guest customers can also use the tracking link from their order confirmation email.
          </p>

          <form @submit.prevent="() => handleTrackOrder()" class="tracking-form">
            <div class="form-group">
              <label for="orderNumber">Order Number <span class="required">*</span></label>
              <input
                id="orderNumber"
                v-model="orderNumber"
                type="text"
                placeholder="ORD-1704366123-ABC123"
                required
              />
              <small class="help-text">
                Format: ORD-XXXXXXXXXX-XXXXXX
              </small>
            </div>

            <div class="form-group">
              <label for="email">Email Address <span class="required">*</span></label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>

            <div v-if="error" class="alert alert-error">
              {{ error }}
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              :disabled="isLoading || !orderNumber || !email"
            >
              <span v-if="isLoading">Tracking Order...</span>
              <span v-else>Track Order</span>
            </button>
          </form>

          <div class="auth-notice">
            <p>
              Have an account? 
              <NuxtLink to="/login">Sign in</NuxtLink> 
              to view all your orders
            </p>
          </div>
        </div>
      </div>

      <!-- Order Tracking Results -->
      <div v-else class="tracking-results">
        <div class="tracking-header">
          <div class="order-info">
            <h2>Order {{ order.orderNumber }}</h2>
            <p class="order-date">
              Placed on {{ formatDate(order.createdAt) }}
            </p>
          </div>
          <button @click="resetTracking" class="btn btn-secondary">
            Track Another Order
          </button>
        </div>

        <!-- Status Timeline -->
        <div class="status-timeline">
          <h3>Order Status</h3>
          <div class="timeline">
            <div
              v-for="step in getStatusTimeline"
              :key="step.key"
              class="timeline-step"
              :class="{
                completed: step.completed,
                active: step.current,
                pending: !step.completed && !step.current
              }"
            >
              <div class="timeline-icon">
                <i v-if="step.completed" class="fas fa-check-circle"></i>
                <i v-else-if="step.current" class="fas fa-circle"></i>
                <i v-else class="far fa-circle"></i>
              </div>
              <div class="timeline-content">
                <h4>{{ step.label }}</h4>
                <p v-if="step.completed" class="timeline-status">Completed</p>
                <p v-else-if="step.current" class="timeline-status">In Progress</p>
              </div>
            </div>
          </div>

          <!-- Carrier Tracking Link -->
          <div v-if="getCarrierTrackingUrl" class="carrier-tracking">
            <a :href="getCarrierTrackingUrl" target="_blank" class="btn btn-outline">
              <i class="fas fa-external-link-alt"></i>
              Track with {{ order.carrier }}
            </a>
          </div>

          <!-- Estimated Delivery -->
          <div v-if="estimatedDeliveryDate && order.status !== 'delivered'" class="delivery-estimate">
            <i class="fas fa-calendar-alt"></i>
            Estimated delivery: <strong>{{ estimatedDeliveryDate }}</strong>
          </div>
        </div>

        <!-- Order Details -->
        <div class="order-details">
          <h3>Order Details</h3>

          <!-- Order Items -->
          <div class="order-items">
            <div v-for="(item, idx) in order.items" :key="idx" class="order-item">
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p class="item-quantity">Quantity: {{ item.quantity }}</p>
              </div>
            </div>
          </div>

          <!-- Order Totals -->
          <div class="order-totals">
            <div class="total-row total-row-final">
              <span>Total:</span>
              <span>{{ order.currency }}{{ order.total.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Shipping Address -->
          <div v-if="order.shippingAddress" class="shipping-address">
            <h4>Shipping Address</h4>
            <address>
              {{ order.shippingAddress.city }}<br>
              {{ order.shippingAddress.postcode }}
            </address>
          </div>

          <!-- Contact Support -->
          <div class="order-support">
            <p>
              Need help with your order? 
              <NuxtLink to="/contact">Contact our support team</NuxtLink>
            </p>
          </div>

          <!-- Review Product (if delivered) -->
          <div v-if="canReview" class="review-prompt">
            <div class="review-card">
              <i class="fas fa-star"></i>
              <div>
                <h4>Order Delivered!</h4>
                <p>How was your experience? Leave a review for the products you received.</p>
              </div>
              <NuxtLink to="/account/orders" class="btn btn-primary">
                Write Review
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderTracking } from '~/composables/useOrderTracking';

// Composables
const route = useRoute();
const {
  order,
  getStatusTimeline,
  getCarrierTrackingUrl,
  estimatedDeliveryDate,
  canReview,
  formatDate,
  trackOrder,
} = useOrderTracking();

// Local state
const orderNumber = ref('');
const email = ref('');
const error = ref('');
const isLoading = ref(false);

// Check URL params for auto-tracking (from email links)
onMounted(() => {
  const urlOrderNumber = route.query.order as string;
  const urlToken = route.query.token as string;
  const urlEmail = route.query.email as string;

  if (urlOrderNumber && (urlToken || urlEmail)) {
    orderNumber.value = urlOrderNumber;
    if (urlEmail) {
      email.value = urlEmail;
    }
    handleTrackOrder(urlToken);
  }
});

// Methods
const handleTrackOrder = async (token?: string) => {
  try {
    error.value = '';
    isLoading.value = true;

    const result = await trackOrder(
      orderNumber.value,
      token,
      email.value
    );

    if (!result) {
      error.value = 'Order not found. Please check your order number and email address.';
    }
  } catch (err: any) {
    console.error('Track order error:', err);
    error.value = err.message || 'Failed to track order. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const resetTracking = () => {
  order.value = null;
  orderNumber.value = '';
  email.value = '';
  error.value = '';
};

// SEO
useHead({
  title: 'Track Your Order - Carafe Coffee',
  meta: [
    { name: 'description', content: 'Track your Carafe Coffee order and view delivery status' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});
</script>

<style scoped lang="scss">
.track-order-page {
  padding: 4rem 0;
  min-height: 80vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 50%);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: #333;
}

// Tracking Form
.tracking-form-section {
  display: flex;
  justify-content: center;
}

.tracking-form-card {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.form-description {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.tracking-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;

    .required {
      color: #c33;
    }
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #8B4513;
    }
  }

  .help-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #999;
  }
}

.alert {
  padding: 1rem;
  border-radius: 6px;

  &.alert-error {
    background-color: #fee;
    border: 1px solid #fcc;
    color: #c33;
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  text-align: center;

  &.btn-primary {
    background: #8B4513;
    color: white;

    &:hover:not(:disabled) {
      background: #6d3410;
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }

  &.btn-secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #5a6268;
    }
  }

  &.btn-outline {
    background: white;
    border: 2px solid #8B4513;
    color: #8B4513;

    &:hover {
      background: #8B4513;
      color: white;
    }

    i {
      margin-right: 0.5rem;
    }
  }

  &.btn-block {
    width: 100%;
    display: block;
  }
}

.auth-notice {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;

  p {
    margin: 0;
    color: #666;
  }

  a {
    color: #8B4513;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

// Tracking Results
.tracking-results {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tracking-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 3rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #eee;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.order-info {
  h2 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .order-date {
    margin: 0;
    color: #666;
  }
}

// Status Timeline
.status-timeline {
  margin-bottom: 3rem;

  h3 {
    margin-bottom: 2rem;
    color: #333;
  }
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.timeline-step {
  display: flex;
  align-items: start;
  gap: 1rem;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 14px;
    top: 35px;
    width: 2px;
    height: calc(100% + 1.5rem);
    background: #ddd;
  }

  &.completed::after {
    background: #28a745;
  }

  &.active::after {
    background: linear-gradient(to bottom, #8B4513 0%, #ddd 100%);
  }
}

.timeline-icon {
  font-size: 1.75rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  .completed & {
    color: #28a745;
  }

  .active & {
    color: #8B4513;
  }

  .pending & {
    color: #ddd;
  }
}

.timeline-content {
  flex: 1;

  h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1.125rem;
  }

  .completed & h4 {
    color: #28a745;
  }

  .active & h4 {
    color: #8B4513;
  }

  .pending & h4 {
    color: #999;
  }
}

.timeline-date {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
}

.timeline-status {
  margin: 0;
  font-size: 0.875rem;
  color: #8B4513;
  font-weight: 600;
}

.carrier-tracking {
  margin: 2rem 0;
  text-align: center;
}

.delivery-estimate {
  background: #e7f5ff;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  color: #0c5896;

  i {
    margin-right: 0.5rem;
  }

  strong {
    color: #0a4275;
  }
}

// Order Details
.order-details {
  h3 {
    margin-bottom: 1.5rem;
    color: #333;
  }
}

.order-items {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

.item-info {
  h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    color: #333;
  }

  .item-variant {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
  }

  .item-quantity {
    margin: 0;
    font-size: 0.875rem;
    color: #999;
  }
}

.item-price {
  font-weight: 700;
  color: #8B4513;
  white-space: nowrap;
}

.order-totals {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }

  &.total-row-final {
    padding-top: 0.75rem;
    border-top: 2px solid #dee2e6;
    font-size: 1.25rem;
    font-weight: 700;
    color: #8B4513;
  }
}

.shipping-address {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;

  h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
  }

  address {
    font-style: normal;
    line-height: 1.6;
    color: #666;
  }
}

.order-support {
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid #eee;

  p {
    margin: 0;
    color: #666;
  }

  a {
    color: #8B4513;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.review-prompt {
  margin-top: 2rem;
}

.review-card {
  background: linear-gradient(135deg, #fef9f5 0%, #f8f4f0 100%);
  border: 2px solid #8B4513;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }

  > i {
    font-size: 3rem;
    color: #ffc107;
  }

  > div {
    flex: 1;

    h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
    }
  }
}
</style>
