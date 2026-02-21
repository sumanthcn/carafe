<template>
  <div class="admin-orders-page">
    <div class="container-fluid">
      <div class="admin-header">
        <div>
          <h1>Order Management</h1>
          <p>Manage and track all customer orders</p>
        </div>
        <div class="admin-header__actions">
          <button @click="refreshOrders" class="btn btn--secondary">
            <span>🔄</span>
            Refresh
          </button>
          <NuxtLink to="/admin" class="btn btn--secondary">
            Dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon">📦</div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ stats.total }}</div>
            <div class="stat-card__label">Total Orders</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon">⚙️</div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ stats.processing }}</div>
            <div class="stat-card__label">Processing</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon">🚚</div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ stats.shipped }}</div>
            <div class="stat-card__label">Shipped</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon">💰</div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ formatPrice(stats.revenue) }}</div>
            <div class="stat-card__label">Revenue</div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="filter-group">
          <button
            v-for="filter in filterOptions"
            :key="filter.value"
            :class="['filter-btn', { active: activeFilter === filter.value }]"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <span v-if="getFilterCount(filter.value)" class="badge">
              {{ getFilterCount(filter.value) }}
            </span>
          </button>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search orders..."
          class="search-input"
        />
      </div>

      <!-- Orders Table -->
      <div class="orders-table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td>
                <strong>{{ order.orderNumber }}</strong>
              </td>
              <td>
                <div class="customer-info">
                  <strong>{{ order.customerName }}</strong>
                  <small>{{ order.customerEmail }}</small>
                </div>
              </td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>{{ order.items.length }}</td>
              <td><strong>{{ formatPrice(order.total) }}</strong></td>
              <td>
                <select
                  v-model="order.status"
                  :class="['status-select', `status-select--${getStatusColor(order.status)}`]"
                  @change="updateStatus(order.id, order.status)"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </td>
              <td>
                <span :class="`payment-badge payment-badge--${order.paymentStatus}`">
                  {{ order.paymentStatus }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <NuxtLink :to="`/admin/orders/${order.id}`" class="btn-icon" title="View Details">
                    👁️
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!filteredOrders.length" class="empty-table">
          <p>No orders found</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Admin access only
definePageMeta({
  middleware: 'auth',
  // TODO: Add admin role check
});

const orderManagement = useOrderManagement();

const activeFilter = ref('all');
const searchQuery = ref('');

const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
];

onMounted(async () => {
  await refreshOrders();
});

const refreshOrders = async () => {
  await orderManagement.fetchAllOrders();
};

const filteredOrders = computed(() => {
  let orders = orderManagement.orders.value;
  
  // Filter by status
  if (activeFilter.value !== 'all') {
    orders = orders.filter(o => o.status === activeFilter.value);
  }
  
  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    orders = orders.filter(o =>
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.customerEmail.toLowerCase().includes(query)
    );
  }
  
  return orders;
});

const stats = computed(() => {
  const allOrders = orderManagement.orders.value;
  return {
    total: allOrders.length,
    processing: allOrders.filter(o => o.status === 'processing').length,
    shipped: allOrders.filter(o => o.status === 'shipped').length,
    revenue: allOrders.reduce((sum, o) => sum + o.total, 0),
  };
});

const getFilterCount = (status: string) => {
  if (status === 'all') return orderManagement.orders.value.length;
  return orderManagement.orders.value.filter(o => o.status === status).length;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'gray',
    processing: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'orange',
  };
  return colors[status] || 'gray';
};

const updateStatus = async (orderId: number, newStatus: any) => {
  const success = await orderManagement.updateOrderStatus(orderId, newStatus);
  if (success) {
    // Show success notification
    console.log('Order status updated');
  }
};

const formatDate = (date: string) => orderManagement.formatDate(date);
const formatPrice = (amount: number) => orderManagement.formatPrice(amount);

// SEO
useHead({
  title: 'Order Management - Admin - Carafe Coffee',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.admin-orders-page {
  padding: $spacing-8;
  background: $color-gray-50;
  min-height: 100vh;
}

.container-fluid {
  max-width: 1400px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-8;
  flex-wrap: wrap;
  gap: $spacing-4;
  
  h1 {
    font-size: $font-size-3xl;
    font-weight: 700;
    margin-bottom: $spacing-2;
  }
  
  p {
    color: $color-gray-600;
  }
  
  &__actions {
    display: flex;
    gap: $spacing-3;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-4;
  margin-bottom: $spacing-8;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: $spacing-5;
  display: flex;
  gap: $spacing-4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &__icon {
    font-size: 32px;
  }
  
  &__value {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $color-dark;
    margin-bottom: $spacing-1;
  }
  
  &__label {
    font-size: $font-size-sm;
    color: $color-gray-600;
  }
}

.filters-bar {
  background: white;
  border-radius: 12px;
  padding: $spacing-4;
  margin-bottom: $spacing-6;
  display: flex;
  gap: $spacing-4;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  display: flex;
  gap: $spacing-2;
  flex-wrap: wrap;
  flex: 1;
}

.filter-btn {
  padding: $spacing-2 $spacing-4;
  border: 2px solid $color-gray-300;
  background: white;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: $spacing-2;
  
  &:hover {
    border-color: $color-primary;
  }
  
  &.active {
    background: $color-primary;
    border-color: $color-primary;
    color: white;
  }
}

.badge {
  background: $color-gray-200;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: $font-size-xs;
  
  .active & {
    background: rgba(255, 255, 255, 0.3);
  }
}

.search-input {
  padding: $spacing-2 $spacing-4;
  border: 2px solid $color-gray-300;
  border-radius: 8px;
  min-width: 250px;
  
  &:focus {
    outline: none;
    border-color: $color-primary;
  }
}

.orders-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  
  thead {
    background: $color-gray-50;
    
    th {
      text-align: left;
      padding: $spacing-4;
      font-weight: 600;
      color: $color-gray-700;
      border-bottom: 2px solid $color-gray-200;
    }
  }
  
  tbody {
    tr {
      border-bottom: 1px solid $color-gray-100;
      
      &:hover {
        background: $color-gray-50;
      }
    }
    
    td {
      padding: $spacing-4;
      vertical-align: middle;
    }
  }
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  small {
    color: $color-gray-600;
    font-size: $font-size-xs;
  }
}

.status-select {
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  font-size: $font-size-sm;
  font-weight: 600;
  cursor: pointer;
  
  &--gray { background: #f3f4f6; color: #6b7280; }
  &--blue { background: #dbeafe; color: #1e40af; }
  &--purple { background: #ede9fe; color: #6d28d9; }
  &--green { background: #d1fae5; color: #065f46; }
  &--red { background: #fee2e2; color: #991b1b; }
  &--orange { background: #ffedd5; color: #9a3412; }
}

.payment-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: $font-size-xs;
  font-weight: 600;
  text-transform: uppercase;
  
  &--pending { background: #fef3c7; color: #92400e; }
  &--paid { background: #d1fae5; color: #065f46; }
  &--failed { background: #fee2e2; color: #991b1b; }
  &--refunded { background: #ffedd5; color: #9a3412; }
}

.action-buttons {
  display: flex;
  gap: $spacing-2;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: $color-gray-100;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background: $color-primary;
    transform: scale(1.1);
  }
}

.empty-table {
  padding: $spacing-16;
  text-align: center;
  color: $color-gray-500;
}
</style>
