<template>
  <div class="order-detail-page">
    <!-- Loading State -->
    <div v-if="orderManagement.loading.value" class="loading-overlay">
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading order details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="orderManagement.error.value" class="error-overlay">
      <div class="error-state">
        <p>{{ orderManagement.error.value }}</p>
        <NuxtLink to="/account/orders" class="btn btn--primary">
          Back to Orders
        </NuxtLink>
      </div>
    </div>

    <!-- Order Details -->
    <template v-else-if="order">
      <!-- Hero Section -->
      <div class="order-hero">
        <div class="order-hero__background"></div>
        <div class="container">
          <div class="order-hero__content">
            <!-- Breadcrumb -->
            <nav class="breadcrumb" aria-label="Breadcrumb">
              <NuxtLink to="/">Home</NuxtLink>
              <span class="breadcrumb__separator">/</span>
              <NuxtLink to="/account">Account</NuxtLink>
              <span class="breadcrumb__separator">/</span>
              <NuxtLink to="/account/orders">Orders</NuxtLink>
              <span class="breadcrumb__separator">/</span>
              <span class="breadcrumb__current">{{ order.orderNumber }}</span>
            </nav>

            <!-- Hero Title -->
            <div class="order-hero__header">
              <div>
                <h1 class="order-hero__title">Order {{ order.orderNumber }}</h1>
                <p class="order-hero__subtitle">Placed on {{ orderManagement.formatDate(order.createdAt) }}</p>
              </div>
              <span :class="`status-hero status-hero--${statusInfo.color}`">
                {{ statusInfo.icon }} {{ statusInfo.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="container">
        <div class="order-detail__wrapper">
          <div class="order-detail">
            <div class="order-detail__grid">
          <!-- Order Progress / Tracking -->
          <div class="detail-card detail-card--wide">
            <h2>Order Status</h2>
            <div class="order-progress">
              <div
                v-for="(step, index) in orderSteps"
                :key="index"
                :class="['progress-step', { active: step.active, completed: step.completed }]"
              >
                <div class="step-icon">
                  <span v-if="step.completed">✓</span>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="step-content">
                  <div class="step-label">{{ step.label }}</div>
                  <div v-if="step.date" class="step-date">{{ step.date }}</div>
                </div>
                <div v-if="index < orderSteps.length - 1" class="step-line"></div>
              </div>
            </div>

            <!-- Tracking Info -->
            <div v-if="order.trackingNumber" class="tracking-box">
              <div class="tracking-box__header">
                <span class="icon">🚚</span>
                <div>
                  <strong>Tracking Number</strong>
                  <p class="tracking-number">{{ order.trackingNumber }}</p>
                </div>
              </div>
              <div class="tracking-box__actions">
                <a
                  :href="`https://track.royalmail.com/track/${order.trackingNumber}`"
                  target="_blank"
                  rel="noopener"
                  class="btn btn--primary btn--sm"
                >
                  Track Package →
                </a>
              </div>
              <div v-if="order.estimatedDelivery" class="estimated-delivery">
                <strong>Estimated Delivery:</strong>
                {{ orderManagement.formatDate(order.estimatedDelivery) }}
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="detail-card detail-card--wide">
            <h2>Order Items</h2>
            <div class="order-items">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="order-item"
              >
                <div class="order-item__image">
                  <img
                    v-if="item.imageUrl"
                    :src="item.imageUrl"
                    :alt="item.productName"
                  />
                  <div v-else class="placeholder">☕</div>
                </div>
                <div class="order-item__details">
                  <h3>{{ item.productName }}</h3>
                  <p v-if="item.variant" class="variant">{{ item.variant }}</p>
                  <p class="quantity">Quantity: {{ item.quantity }}</p>
                </div>
                <div class="order-item__price">
                  <div class="price">{{ orderManagement.formatPrice(item.price) }}</div>
                  <div class="subtotal">
                    Total: {{ orderManagement.formatPrice(item.price * item.quantity) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="order-summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>{{ orderManagement.formatPrice(order.subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping ({{ order.shippingMethod }}):</span>
                <span>{{ order.shippingCost === 0 ? 'FREE' : orderManagement.formatPrice(order.shippingCost) }}</span>
              </div>
              <div class="summary-row summary-row--total">
                <span>Total:</span>
                <span>{{ orderManagement.formatPrice(order.total) }}</span>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="detail-card">
            <h2>Shipping Address</h2>
            <address>
              <strong>{{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}</strong><br>
              {{ order.shippingAddress.line1 }}<br>
              <span v-if="order.shippingAddress.line2">{{ order.shippingAddress.line2 }}<br></span>
              {{ order.shippingAddress.city }}<br>
              {{ order.shippingAddress.postalCode }}<br>
              {{ order.shippingAddress.country }}
            </address>
          </div>

          <!-- Contact & Payment Info -->
          <div class="detail-card">
            <h2>Contact Information</h2>
            <div class="info-list">
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value">{{ order.customerEmail }}</span>
              </div>
              <div class="info-item">
                <span class="label">Phone:</span>
                <span class="value">{{ order.customerPhone }}</span>
              </div>
            </div>

            <h2 style="margin-top: 1.5rem">Payment Information</h2>
            <div class="info-list">
              <div class="info-item">
                <span class="label">Method:</span>
                <span class="value">{{ order.paymentMethod }}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span>
                <span :class="`payment-status payment-status--${order.paymentStatus}`">
                  {{ order.paymentStatus }}
                </span>
              </div>
              <div v-if="order.transactionReference" class="info-item">
                <span class="label">Reference:</span>
                <span class="value" style="font-family: 'Courier New', monospace; font-size: 0.875rem">
                  {{ order.transactionReference }}
                </span>
              </div>
            </div>
          </div>
          </div>
          </div>
        
          <!-- Actions -->
          <div class="order-actions">
            <button
              v-if="order.status === 'delivered'"
              class="btn btn--primary"
              @click="reorder"
            >
              Reorder
            </button>
            <NuxtLink to="/contact" class="btn btn--secondary">
              Contact Support
            </NuxtLink>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const route = useRoute();
const router = useRouter();
const orderManagement = useOrderManagement();

const orderId = computed(() => Number(route.params.id));

// Load order on mount
onMounted(async () => {
  await orderManagement.fetchOrder(orderId.value);
});

const order = computed(() => orderManagement.currentOrder.value);

const statusInfo = computed(() => {
  if (!order.value) return { label: '', color: 'gray', icon: '' };
  return orderManagement.getStatusInfo(order.value.status);
});

// Order progress steps
const orderSteps = computed(() => {
  if (!order.value) return [];
  
  const status = order.value.status;
  const steps = [
    {
      label: 'Order Placed',
      completed: true,
      active: status === 'pending',
      date: orderManagement.formatDate(order.value.createdAt),
    },
    {
      label: 'Processing',
      completed: ['shipped', 'delivered'].includes(status),
      active: status === 'processing',
      date: status === 'processing' ? orderManagement.formatDate(order.value.updatedAt) : null,
    },
    {
      label: 'Shipped',
      completed: status === 'delivered',
      active: status === 'shipped',
      date: status === 'shipped' || status === 'delivered' ? orderManagement.formatDate(order.value.updatedAt) : null,
    },
    {
      label: 'Delivered',
      completed: status === 'delivered',
      active: status === 'delivered',
      date: status === 'delivered' ? orderManagement.formatDate(order.value.updatedAt) : null,
    },
  ];
  
  // Handle cancelled/refunded status
  if (['cancelled', 'refunded'].includes(status)) {
    return [
      {
        label: 'Order Placed',
        completed: true,
        active: false,
        date: orderManagement.formatDate(order.value.createdAt),
      },
      {
        label: status === 'cancelled' ? 'Cancelled' : 'Refunded',
        completed: true,
        active: true,
        date: orderManagement.formatDate(order.value.updatedAt),
      },
    ];
  }
  
  return steps;
});

const reorder = () => {
  // TODO: Implement reorder
  alert('Reorder functionality coming soon!');
};

// SEO
useHead({
  title: () => `Order ${order.value?.orderNumber || ''} - Carafe Coffee`,
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
});
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";
@import "~/assets/scss/mixins";

.order-detail-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
  padding-bottom: $spacing-16;
}

// Hero Section
.order-hero {
  position: relative;
  padding: 140px 0 120px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%);
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 120px 0 100px;
  }

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    opacity: 0.6;
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: $spacing-4;
    gap: $spacing-4;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: $spacing-3;
    }
  }

  &__title {
    font-family: $font-family-heading;
    font-size: 2.5rem;
    font-weight: 700;
    color: white;
    margin: 0 0 $spacing-2;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }

  &__subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;

    @media (max-width: 768px) {
      font-size: 0.875rem;
    }
  }
}

// Breadcrumb
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: $spacing-2;
  flex-wrap: wrap;

  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: white;
    }
  }

  &__separator {
    color: rgba(255, 255, 255, 0.5);
  }

  &__current {
    color: white;
    font-weight: 500;
  }
}

// Status badge in hero
.status-hero {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;

  &--success {
    background: rgba(209, 250, 229, 0.95);
    color: #065f46;
  }

  &--info {
    background: rgba(224, 242, 254, 0.95);
    color: #075985;
  }

  &--warning {
    background: rgba(254, 243, 199, 0.95);
    color: #92400e;
  }

  &--error {
    background: rgba(254, 226, 226, 0.95);
    color: #991b1b;
  }
}

// Wrapper
.order-detail__wrapper {
  max-width: 1200px;
  margin: -80px auto 0;
  padding: 0 $spacing-4;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    margin-top: -60px;
  }
}

// Loading and error overlays
.loading-overlay,
.error-overlay {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-8;
}

.loading-state,
.error-state {
  text-align: center;
  padding: $spacing-16 $spacing-8;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-width: 400px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid $color-gray-200;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto $spacing-4;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.order-detail {
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: $spacing-6;
    margin-bottom: $spacing-8;
    
    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

.status {
  padding: 8px 16px;
  border-radius: 16px;
  font-size: $font-size-sm;
  font-weight: 500;
  white-space: nowrap;
  
  &--gray { background: #f3f4f6; color: #6b7280; }
  &--blue { background: #dbeafe; color: #1e40af; }
  &--purple { background: #ede9fe; color: #6d28d9; }
  &--green { background: #d1fae5; color: #065f46; }
  &--red { background: #fee2e2; color: #991b1b; }
  &--orange { background: #ffedd5; color: #9a3412; }
}

.detail-card {
  background: white;
  border-radius: 16px;
  padding: $spacing-6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  &--wide {
    @media (min-width: 768px) {
      grid-column: span 2;
    }
  }
  
  h2 {
    font-size: $font-size-xl;
    font-weight: 600;
    color: $color-dark;
    margin-bottom: $spacing-5;
  }
}

// Container
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-4;
}

.order-progress {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  margin-bottom: $spacing-6;
}

.progress-step {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: $spacing-4;
  position: relative;
  
  .step-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $color-gray-200;
    color: $color-gray-600;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
    z-index: 1;
  }
  
  .step-content {
    padding-top: 8px;
  }
  
  .step-label {
    font-weight: 600;
    color: $color-gray-600;
    margin-bottom: $spacing-1;
  }
  
  .step-date {
    font-size: $font-size-sm;
    color: $color-gray-500;
  }
  
  .step-line {
    position: absolute;
    left: 19px;
    top: 50px;
    width: 2px;
    height: calc(100% + 16px);
    background: $color-gray-200;
  }
  
  &.completed {
    .step-icon {
      background: $color-primary;
      color: white;
    }
    
    .step-label {
      color: $color-dark;
    }
    
    .step-line {
      background: $color-primary;
    }
  }
  
  &.active {
    .step-icon {
      background: $color-primary;
      color: white;
      box-shadow: 0 0 0 4px rgba($color-primary, 0.2);
    }
    
    .step-label {
      color: $color-primary;
    }
  }
}

.tracking-box {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: $spacing-5;
  
  &__header {
    display: flex;
    gap: $spacing-4;
    margin-bottom: $spacing-4;
    
    .icon {
      font-size: $font-size-3xl;
    }
    
    strong {
      display: block;
      color: $color-gray-700;
      margin-bottom: $spacing-1;
    }
    
    .tracking-number {
      font-family: 'Courier New', monospace;
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-dark;
    }
  }
  
  &__actions {
    margin-bottom: $spacing-4;
  }
  
  .estimated-delivery {
    font-size: $font-size-sm;
    color: $color-gray-700;
    padding-top: $spacing-3;
    border-top: 1px solid #86efac;
    
    strong {
      color: $color-gray-800;
    }
  }
}

.order-items {
  margin-bottom: $spacing-5;
}

.order-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: $spacing-4;
  padding: $spacing-4 0;
  border-bottom: 1px solid $color-gray-100;
  
  &:last-child {
    border-bottom: none;
  }

  &__image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    background: $color-gray-100;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $font-size-3xl;
    }
  }

  &__details {
    h3 {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-dark;
      margin-bottom: $spacing-2;
    }
    
    .variant {
      font-size: $font-size-sm;
      color: $color-gray-600;
      margin-bottom: $spacing-1;
    }
    
    .quantity {
      font-size: $font-size-sm;
      color: $color-gray-500;
    }
  }

  &__price {
    text-align: right;
    
    .price {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-dark;
      margin-bottom: $spacing-1;
    }
    
    .subtotal {
      font-size: $font-size-sm;
      color: $color-gray-600;
    }
  }
}

.order-summary {
  padding: $spacing-5;
  background: $color-gray-50;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: $spacing-2 0;
  color: $color-gray-700;
  
  &--total {
    border-top: 2px solid $color-gray-300;
    margin-top: $spacing-3;
    padding-top: $spacing-3;
    font-size: $font-size-xl;
    font-weight: 700;
    color: $color-dark;
  }
}

address {
  font-style: normal;
  line-height: 1.8;
  color: $color-gray-700;
  
  strong {
    color: $color-dark;
    display: block;
    margin-bottom: $spacing-2;
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding-bottom: $spacing-2;
  border-bottom: 1px solid $color-gray-100;
  
  .label {
    font-weight: 500;
    color: $color-gray-600;
  }
  
  .value {
    color: $color-dark;
    text-align: right;
  }
}

.payment-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: $font-size-xs;
  font-weight: 600;
  text-transform: uppercase;
  
  &--pending { background: #fef3c7; color: #92400e; }
  &--paid { background: #d1fae5; color: #065f46; }
  &--failed { background: #fee2e2; color: #991b1b; }
  &--refunded { background: #ffedd5; color: #9a3412; }
}

.order-actions {
  display: flex;
  gap: $spacing-4;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  &--sm {
    padding: $spacing-2 $spacing-4;
    font-size: $font-size-sm;
  }
}
</style>
