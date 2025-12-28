<template>
  <div class="order-detail-page">
    <div class="container">
      <!-- Loading State -->
      <div v-if="isLoading" class="order-detail__loading">
        <div class="spinner"></div>
        <p>Loading order details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="order-detail__error">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h2>Order Not Found</h2>
        <p>{{ error }}</p>
        <NuxtLink to="/account/orders" class="btn btn--primary">
          Back to Orders
        </NuxtLink>
      </div>

      <!-- Order Details -->
      <div v-else-if="order" class="order-detail">
        <!-- Header -->
        <div class="order-detail__header">
          <div class="order-detail__header-left">
            <NuxtLink to="/account/orders" class="back-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Orders
            </NuxtLink>
            <h1>Order #{{ order.orderNumber }}</h1>
            <p class="order-date">Placed on {{ formatDate(order.createdAt) }}</p>
          </div>
          <div class="order-detail__header-right">
            <span :class="['status-badge', `status-badge--${getStatusColor(order.status)}`]">
              {{ getStatusLabel(order.status) }}
            </span>
            <span :class="['payment-badge', `payment-badge--${getPaymentColor(order.paymentStatus)}`]">
              {{ getPaymentStatusLabel(order.paymentStatus) }}
            </span>
          </div>
        </div>

        <!-- Order Timeline -->
        <div class="order-timeline">
          <h2>Order Status</h2>
          <div class="timeline">
            <div
              v-for="(step, index) in timelineSteps"
              :key="step.status"
              :class="[
                'timeline-step',
                { 'timeline-step--active': isStepActive(step.status) },
                { 'timeline-step--completed': isStepCompleted(step.status) }
              ]"
            >
              <div class="timeline-step__marker">
                <svg v-if="isStepCompleted(step.status)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span v-else class="timeline-step__number">{{ index + 1 }}</span>
              </div>
              <div class="timeline-step__content">
                <h3>{{ step.label }}</h3>
                <p v-if="step.status === order.status && order.updatedAt">
                  {{ formatDateTime(order.updatedAt) }}
                </p>
              </div>
              <div v-if="index < timelineSteps.length - 1" class="timeline-step__line"></div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="order-content">
          <!-- Items -->
          <div class="order-section order-items">
            <h2>Order Items</h2>
            <div class="order-items-list">
              <div
                v-for="(item, index) in order.items"
                :key="index"
                class="order-item"
              >
                <div class="order-item__image">
                  <div class="order-item__image-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>
                  </div>
                </div>
                <div class="order-item__details">
                  <h3>{{ item.productName }}</h3>
                  <p class="order-item__quantity">Quantity: {{ item.quantity }}</p>
                  <p class="order-item__price">{{ formatCurrency(item.unitPrice, order.currency) }} each</p>
                </div>
                <div class="order-item__total">
                  <strong>{{ formatCurrency(item.totalPrice, order.currency) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="order-sidebar">
            <!-- Pricing Summary -->
            <div class="order-section order-summary">
              <h2>Order Summary</h2>
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ formatCurrency(order.subtotal, order.currency) }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>{{ formatCurrency(order.shippingCost, order.currency) }}</span>
              </div>
              <div class="summary-row">
                <span>Tax</span>
                <span>{{ formatCurrency(order.tax, order.currency) }}</span>
              </div>
              <div class="summary-row summary-row--total">
                <span>Total</span>
                <strong>{{ formatCurrency(order.total, order.currency) }}</strong>
              </div>
            </div>

            <!-- Shipping Information -->
            <div class="order-section order-shipping">
              <h2>Shipping Address</h2>
              <div class="address-card">
                <p><strong>{{ order.customerName }}</strong></p>
                <p>{{ order.shippingAddress?.street }}</p>
                <p>{{ order.shippingAddress?.city }}, {{ order.shippingAddress?.postcode }}</p>
                <p>{{ order.shippingAddress?.country }}</p>
                <p v-if="order.customerPhone" class="address-card__phone">
                  📞 {{ order.customerPhone }}
                </p>
              </div>
            </div>

            <!-- Payment Information -->
            <div class="order-section order-payment">
              <h2>Payment</h2>
              <div class="payment-info">
                <div class="payment-info__row">
                  <span>Method</span>
                  <span>{{ order.paymentMethod || 'Card' }}</span>
                </div>
                <div class="payment-info__row">
                  <span>Status</span>
                  <span :class="['payment-status', `payment-status--${getPaymentColor(order.paymentStatus)}`]">
                    {{ getPaymentStatusLabel(order.paymentStatus) }}
                  </span>
                </div>
                <div v-if="order.worldpayOrderCode" class="payment-info__row">
                  <span>Reference</span>
                  <span class="payment-ref">{{ order.worldpayOrderCode }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="order.status === 'delivered'" class="order-actions">
              <button
                @click="navigateToReview"
                class="btn btn--primary btn--block"
              >
                Write a Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '~/composables/useOrders';

const route = useRoute();
const router = useRouter();
const { fetchOrder, getStatusLabel, getPaymentStatusLabel } = useOrders();

definePageMeta({
  middleware: ['auth'],
});

const orderId = computed(() => route.params.id as string);

const order = ref<Order | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const timelineSteps = [
  { status: 'order_received', label: 'Order Received' },
  { status: 'packed', label: 'Packed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'in_transit', label: 'In Transit' },
  { status: 'delivered', label: 'Delivered' },
];

const loadOrder = async () => {
  isLoading.value = true;
  error.value = null;

  const result = await fetchOrder(parseInt(orderId.value));

  if (result.success && result.order) {
    order.value = result.order;

    useHead({
      title: `Order #${result.order.orderNumber} | Carafe Coffee`,
      meta: [{ name: 'robots', content: 'noindex, nofollow' }],
    });
  } else {
    error.value = result.error || 'Order not found';
  }

  isLoading.value = false;
};

onMounted(() => {
  loadOrder();
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number, currency: string = 'EUR') => {
  const symbols: Record<string, string> = {
    EUR: '€',
    GBP: '£',
    USD: '$',
  };
  return `${symbols[currency] || currency}${amount.toFixed(2)}`;
};

const getStrapiMedia = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const config = useRuntimeConfig();
  return `${config.public.strapiBaseUrl}${url}`;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    order_received: 'info',
    packed: 'warning',
    shipped: 'warning',
    in_transit: 'warning',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'error',
  };
  return colors[status] || 'info';
};

const getPaymentColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'warning',
    authorized: 'info',
    captured: 'success',
    failed: 'error',
    refunded: 'error',
  };
  return colors[status] || 'info';
};

const isStepActive = (status: string): boolean => {
  return order.value?.status === status;
};

const isStepCompleted = (status: string): boolean => {
  if (!order.value) return false;

  const currentIndex = timelineSteps.findIndex(s => s.status === order.value!.status);
  const stepIndex = timelineSteps.findIndex(s => s.status === status);

  return stepIndex < currentIndex;
};

const navigateToReview = () => {
  if (order.value && order.value.items && order.value.items.length > 0) {
    const firstProduct = order.value.items[0];
    router.push(`/products/${firstProduct.productSlug}`);
  }
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.order-detail-page {
  padding: $spacing-8 0 $spacing-16;
  min-height: calc(100vh - 200px);
  background: $color-gray-50;
}

.order-detail__loading,
.order-detail__error {
  text-align: center;
  padding: $spacing-12 $spacing-6;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  svg {
    color: $color-primary;
    margin-bottom: $spacing-4;
  }

  h2 {
    font-size: 1.5rem;
    margin: 0 0 $spacing-3 0;
    color: $color-text;
  }

  p {
    color: $color-text-light;
    margin: 0 0 $spacing-5 0;
  }
}

.order-detail__error svg {
  color: #dc2626;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid $color-gray-200;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto $spacing-4;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.order-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-8;
  flex-wrap: wrap;
  gap: $spacing-4;
}

.order-detail__header-left {
  flex: 1;
  min-width: 250px;

  h1 {
    font-family: $font-family-heading;
    font-size: 2rem;
    margin: $spacing-3 0 0.5rem 0;
    color: $color-text;
  }
}

.order-detail__header-right {
  display: flex;
  gap: $spacing-2;
  flex-wrap: wrap;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: $color-primary;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

  svg {
    flex-shrink: 0;
  }
}

.order-date {
  color: $color-text-light;
  margin: 0;
}

.status-badge,
.payment-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge--info,
.payment-badge--info {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge--warning,
.payment-badge--warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge--success,
.payment-badge--success {
  background: #d1fae5;
  color: #065f46;
}

.status-badge--error,
.payment-badge--error {
  background: #fee2e2;
  color: #991b1b;
}

.order-timeline {
  background: white;
  padding: $spacing-6;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: $spacing-6;

  h2 {
    font-size: 1.25rem;
    margin: 0 0 $spacing-5 0;
    color: $color-text;
  }
}

.timeline {
  display: flex;
  gap: $spacing-4;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: $spacing-3;
  }
}

.timeline-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }

  &__marker {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #6b7280;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    margin-bottom: $spacing-2;
    flex-shrink: 0;
    z-index: 1;

    @media (max-width: 768px) {
      margin-bottom: 0;
      margin-right: $spacing-3;
    }
  }

  &__content {
    text-align: center;

    @media (max-width: 768px) {
      text-align: left;
      flex: 1;
    }

    h3 {
      font-size: 0.875rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: #6b7280;
    }

    p {
      font-size: 0.75rem;
      color: #9ca3af;
      margin: 0;
    }
  }

  &__line {
    position: absolute;
    top: 20px;
    left: 50%;
    width: calc(100% + #{$spacing-4});
    height: 2px;
    background: #e5e7eb;
    z-index: 0;

    @media (max-width: 768px) {
      left: 20px;
      top: 50px;
      width: 2px;
      height: calc(100% + #{$spacing-3});
    }
  }

  &--completed {
    .timeline-step__marker {
      background: $color-primary;
      color: white;
    }

    .timeline-step__content h3 {
      color: $color-primary;
    }

    .timeline-step__line {
      background: $color-primary;
    }
  }

  &--active {
    .timeline-step__marker {
      background: $color-primary;
      color: white;
      box-shadow: 0 0 0 4px rgba($color-primary, 0.2);
    }

    .timeline-step__content {
      h3 {
        color: $color-text;
      }

      p {
        color: $color-text-light;
      }
    }
  }
}

.order-content {
  display: grid;
  gap: $spacing-6;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 400px;
  }
}

.order-section {
  background: white;
  padding: $spacing-6;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h2 {
    font-size: 1.125rem;
    margin: 0 0 $spacing-4 0;
    color: $color-text;
  }
}

.order-sidebar {
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.order-item {
  display: flex;
  gap: $spacing-4;
  padding-bottom: $spacing-4;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &__image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
    background: $color-gray-100;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-text-light;
  }

  &__details {
    flex: 1;

    h3 {
      font-size: 1rem;
      margin: 0 0 0.5rem 0;
      color: $color-text;
    }

    p {
      font-size: 0.875rem;
      margin: 0.25rem 0;
      color: $color-text-light;
    }
  }

  &__total {
    text-align: right;

    strong {
      font-size: 1.125rem;
      color: $color-text;
    }
  }
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: $spacing-3 0;
  font-size: 0.9375rem;
  color: $color-text-light;

  &--total {
    border-top: 2px solid #e5e7eb;
    padding-top: $spacing-4;
    margin-top: $spacing-2;
    font-size: 1.125rem;
    color: $color-text;
  }
}

.address-card {
  p {
    margin: 0.5rem 0;
    color: $color-text;
    line-height: 1.6;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__phone {
    margin-top: $spacing-3;
    padding-top: $spacing-3;
    border-top: 1px solid #e5e7eb;
  }
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9375rem;

    span:first-child {
      color: $color-text-light;
    }

    span:last-child {
      color: $color-text;
      font-weight: 500;
    }
  }
}

.payment-status {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  &--success {
    background: #d1fae5;
    color: #065f46;
  }

  &--warning {
    background: #fef3c7;
    color: #92400e;
  }

  &--info {
    background: #dbeafe;
    color: #1e40af;
  }

  &--error {
    background: #fee2e2;
    color: #991b1b;
  }
}

.payment-ref {
  font-family: monospace;
  font-size: 0.8125rem;
  color: $color-text-light;
}

.order-actions {
  margin-top: auto;
}
</style>
