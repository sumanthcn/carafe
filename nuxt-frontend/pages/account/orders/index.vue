<template>
  <div class="orders-page">
    <div class="container">
      <h1 class="page-title">My Orders</h1>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading your orders...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-shopping-bag"></i>
        </div>
        <h2>No Orders Yet</h2>
        <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <NuxtLink to="/shop-coffee" class="btn btn-primary">
          Browse Coffee
        </NuxtLink>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <!-- Filter Tabs -->
        <div class="filter-tabs">
          <button
            v-for="status in filterOptions"
            :key="status.value"
            class="filter-tab"
            :class="{ active: selectedFilter === status.value }"
            @click="selectedFilter = status.value"
          >
            {{ status.label }}
            <span v-if="getFilterCount(status.value)" class="badge">
              {{ getFilterCount(status.value) }}
            </span>
          </button>
        </div>

        <!-- Orders -->
        <div class="orders">
          <div
            v-for="order in filteredOrders"
            :key="order.id"
            class="order-card"
          >
            <div class="order-header">
              <div class="order-info">
                <h3>Order {{ order.orderNumber }}</h3>
                <p class="order-date">{{ formatDate(order.createdAt) }}</p>
              </div>
              <div class="order-status">
                <span class="status-badge" :class="`status-${order.status}`">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
            </div>

            <div class="order-body">
              <!-- Order Items -->
              <div class="order-items">
                <div
                  v-for="(item, idx) in order.items.slice(0, 3)"
                  :key="idx"
                  class="order-item"
                >
                  <span class="item-name">{{ item.productName }}</span>
                  <span class="item-quantity">x{{ item.quantity }}</span>
                </div>
                <p v-if="order.items.length > 3" class="more-items">
                  +{{ order.items.length - 3 }} more items
                </p>
              </div>

              <!-- Order Summary -->
              <div class="order-summary">
                <div class="summary-row">
                  <span>Total:</span>
                  <span class="total-amount">£{{ order.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div class="order-footer">
              <NuxtLink
                :to="`/account/orders/${order.id}`"
                class="btn btn-outline"
              >
                View Details
              </NuxtLink>
              <NuxtLink
                v-if="order.status === 'shipped' || order.status === 'in_transit'"
                :to="`/track-order?order=${order.orderNumber}&email=${order.customerEmail}`"
                class="btn btn-primary"
              >
                <i class="fas fa-shipping-fast"></i>
                Track Order
              </NuxtLink>
              <button
                v-if="order.status === 'delivered' && canReviewOrder(order)"
                class="btn btn-primary"
                @click="navigateToReview(order)"
              >
                <i class="fas fa-star"></i>
                Write Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrders } from '~/composables/useOrders';
import { useAuth } from '~/composables/useAuth';

// Composables
const { user } = useAuth();
const router = useRouter();

// Check authentication
if (!user.value) {
  navigateTo('/login?redirect=/account/orders');
}

// Local state
const orders = ref<any[]>([]);
const loading = ref(true);
const error = ref('');
const selectedFilter = ref('all');

const filterOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'order_received', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Fetch orders on mount
onMounted(async () => {
  await fetchOrders();
});

// Methods
const fetchOrders = async () => {
  loading.value = true;
  error.value = '';

  try {
    const config = useRuntimeConfig();
    const auth = useAuth();
    
    if (!auth.user.value) {
      error.value = 'Please log in to view your orders';
      return;
    }

    const response: any = await $fetch(`${config.public.strapiUrl}/api/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${auth.token.value}`,
      },
    });

    if (response && response.data) {
      orders.value = Array.isArray(response.data) ? response.data : [response.data];
    }
  } catch (err: any) {
    console.error('Failed to fetch orders:', err);
    error.value = 'Failed to load orders. Please try again.';
  } finally {
    loading.value = false;
  }
};

// Computed
const filteredOrders = computed(() => {
  if (selectedFilter.value === 'all') {
    return orders.value;
  }
  return orders.value.filter(order => order.status === selectedFilter.value);
});

const getFilterCount = (status: string) => {
  if (status === 'all') {
    return orders.value.length;
  }
  return orders.value.filter(order => order.status === status).length;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    order_received: 'Processing',
    packed: 'Packed',
    shipped: 'Shipped',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return labels[status] || status;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const canReviewOrder = (order: any) => {
  // Check if order was delivered and hasn't been reviewed yet
  // You can add more logic here like checking if review already exists
  return order.status === 'delivered';
};

const navigateToReview = (order: any) => {
  // Navigate to the first product in the order for review
  if (order.items && order.items.length > 0) {
    const firstItem = order.items[0];
    router.push(`/shop-coffee/${firstItem.productSlug || firstItem.productId}?review=true`);
  }
};

// SEO
useHead({
  title: 'My Orders - Carafe Coffee',
  meta: [
    { name: 'description', content: 'View your order history and track deliveries' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});
</script>

<style scoped lang="scss">
.orders-page {
  padding: 4rem 0;
  min-height: 80vh;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.loading-state {
  text-align: center;
  padding: 4rem 0;
  color: #666;
}

.alert {
  padding: 1rem;
  margin-bottom: 2rem;
  border-radius: 8px;
  
  &.alert-error {
    background-color: #fee;
    border: 1px solid #fcc;
    color: #c33;
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  
  .empty-icon {
    font-size: 4rem;
    color: #ccc;
    margin-bottom: 1.5rem;
  }
  
  h2 {
    margin-bottom: 1rem;
    color: #333;
  }
  
  p {
    color: #666;
    margin-bottom: 2rem;
  }
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.75rem 1.5rem;
  border: 2px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    border-color: #8B4513;
  }
  
  &.active {
    background: #8B4513;
    border-color: #8B4513;
    color: white;
    
    .badge {
      background: white;
      color: #8B4513;
    }
  }
  
  .badge {
    background: #8B4513;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.875rem;
    min-width: 1.5rem;
    text-align: center;
  }
}

.orders {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.order-info {
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    color: #333;
  }
  
  .order-date {
    margin: 0;
    color: #666;
    font-size: 0.875rem;
  }
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  
  &.status-order_received {
    background: #fff4e6;
    color: #e67700;
  }
  
  &.status-packed {
    background: #e6f2ff;
    color: #0066cc;
  }
  
  &.status-shipped,
  &.status-in_transit {
    background: #e6f7ff;
    color: #0080ff;
  }
  
  &.status-delivered {
    background: #e6f7ee;
    color: #00a854;
  }
  
  &.status-cancelled,
  &.status-refunded {
    background: #fee;
    color: #cc0000;
  }
}

.order-body {
  padding: 1.5rem;
}

.order-items {
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  
  .item-name {
    color: #333;
  }
  
  .item-quantity {
    color: #666;
    font-size: 0.875rem;
  }
}

.more-items {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.order-summary {
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.125rem;
  font-weight: 600;
  
  .total-amount {
    color: #8B4513;
  }
}

.order-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  
  @media (max-width: 768px) {
    flex-direction: column;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  
  &.btn-primary {
    background: #8B4513;
    color: white;
    
    &:hover {
      background: #6d3410;
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
  }
}
</style>
