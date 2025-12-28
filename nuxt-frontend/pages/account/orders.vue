<template>
  <div class="orders-page">
    <div class="container">
      <div class="orders-page__header">
        <h1>My Orders</h1>
        <p>View and track your order history</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="orders-page__loading">
        <div class="spinner"></div>
        <p>Loading your orders...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="orders-page__error">
        <p>{{ error }}</p>
        <button @click="loadOrders" class="btn btn--primary">
          Try Again
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!orders || orders.length === 0" class="orders-page__empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 12h6M9 16h6"/>
        </svg>
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders yet.</p>
        <NuxtLink to="/shop-coffee" class="btn btn--primary">
          Start Shopping
        </NuxtLink>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <div class="order-card__header">
            <div class="order-card__number">
              <strong>Order #{{ order.orderNumber }}</strong>
              <span class="order-card__date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-card__status">
              <span :class="['status-badge', `status-badge--${getStatusColor(order.status)}`]">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
          </div>

          <div class="order-card__body">
            <div class="order-card__items">
              <p class="order-card__items-count">
                {{ order.items?.length || 0 }} item{{ order.items?.length !== 1 ? 's' : '' }}
              </p>
            </div>

            <div class="order-card__details">
              <div class="order-detail">
                <span class="label">Subtotal:</span>
                <span class="value">{{ formatCurrency(order.subtotal, order.currency) }}</span>
              </div>
              <div class="order-detail">
                <span class="label">Shipping:</span>
                <span class="value">{{ formatCurrency(order.shippingCost, order.currency) }}</span>
              </div>
              <div class="order-detail">
                <span class="label">Tax:</span>
                <span class="value">{{ formatCurrency(order.tax, order.currency) }}</span>
              </div>
              <div class="order-detail order-detail--total">
                <span class="label">Total:</span>
                <span class="value">{{ formatCurrency(order.total, order.currency) }}</span>
              </div>
            </div>

            <div class="order-card__payment">
              <span :class="['payment-badge', `payment-badge--${order.paymentStatus}`]">
                {{ getPaymentStatusLabel(order.paymentStatus) }}
              </span>
            </div>
          </div>

          <div class="order-card__footer">
            <NuxtLink :to="`/account/orders/${order.id}`" class="btn btn--outline btn--sm">
              View Details
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { fetchOrders, orders, isLoading, error, getStatusLabel, getPaymentStatusLabel } = useOrders();

definePageMeta({
  middleware: ['auth'],
});

useHead({
  title: 'My Orders | Carafe Coffee',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

// Load orders on mount
const loadOrders = async () => {
  await fetchOrders();
};

onMounted(() => {
  loadOrders();
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number, currency: string) => {
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
  return `${symbol}${amount.toFixed(2)}`;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    order_received: 'blue',
    packed: 'purple',
    shipped: 'orange',
    in_transit: 'yellow',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'gray',
  };
  return colors[status] || 'gray';
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.orders-page {
  padding: $spacing-8 0 $spacing-16;
  min-height: calc(100vh - 200px);
  background: $color-gray-50;

  &__header {
    margin-bottom: $spacing-8;

    h1 {
      font-family: $font-family-heading;
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
      color: $color-text;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    p {
      color: $color-text-light;
      margin: 0;
    }
  }

  &__loading,
  &__error,
  &__empty {
    background: white;
    border-radius: 12px;
    padding: $spacing-8;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__loading {
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid $color-primary;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto $spacing-4;
    }

    p {
      color: $color-text-light;
      margin: 0;
    }
  }

  &__empty {
    svg {
      color: $color-text-light;
      margin-bottom: $spacing-4;
    }

    h2 {
      font-size: 1.5rem;
      margin: 0 0 $spacing-2 0;
      color: $color-text;
    }

    p {
      color: $color-text-light;
      margin: 0 0 $spacing-4 0;
    }
  }

  &__error {
    p {
      color: #dc2626;
      margin: 0 0 $spacing-4 0;
      font-weight: 500;
    }
  }
}

.orders-list {
  display: grid;
  gap: $spacing-4;
}

.order-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: $spacing-4 $spacing-5;
    border-bottom: 1px solid #f0f0f0;

    @media (max-width: 640px) {
      flex-direction: column;
      gap: $spacing-3;
    }
  }

  &__number {
    strong {
      display: block;
      font-size: 1.125rem;
      color: $color-text;
      margin-bottom: 0.25rem;
    }
  }

  &__date {
    font-size: 0.875rem;
    color: $color-text-light;
  }

  &__body {
    padding: $spacing-5;
  }

  &__items-count {
    margin: 0 0 $spacing-4 0;
    color: $color-text-light;
    font-size: 0.875rem;
  }

  &__details {
    margin-bottom: $spacing-4;
  }

  &__payment {
    margin-top: $spacing-3;
  }

  &__footer {
    padding: $spacing-4 $spacing-5;
    border-top: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
  }
}

.order-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;

  .label {
    color: $color-text-light;
  }

  .value {
    font-weight: 600;
    color: $color-text;
  }

  &--total {
    border-top: 2px solid #e5e5e5;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    font-size: 1rem;

    .value {
      color: $color-primary;
      font-size: 1.25rem;
    }
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &--blue {
    background: #dbeafe;
    color: #1e40af;
  }

  &--purple {
    background: #e0e7ff;
    color: #5b21b6;
  }

  &--orange {
    background: #fed7aa;
    color: #9a3412;
  }

  &--yellow {
    background: #fef3c7;
    color: #92400e;
  }

  &--green {
    background: #d1fae5;
    color: #065f46;
  }

  &--red {
    background: #fee2e2;
    color: #991b1b;
  }

  &--gray {
    background: #f3f4f6;
    color: #4b5563;
  }
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;

  &--pending {
    background: #fef3c7;
    color: #92400e;
  }

  &--authorized,
  &--captured {
    background: #d1fae5;
    color: #065f46;
  }

  &--failed {
    background: #fee2e2;
    color: #991b1b;
  }

  &--refunded {
    background: #f3f4f6;
    color: #4b5563;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
