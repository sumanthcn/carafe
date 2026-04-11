<template>
  <div class="orders-page">
    <!-- Hero Section -->
    <div class="orders-hero">
      <div class="orders-hero__background"></div>
      <div class="container">
        <div class="orders-hero__content">
          <!-- Breadcrumb -->
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <NuxtLink to="/">Home</NuxtLink>
            <span class="breadcrumb__separator">/</span>
            <NuxtLink to="/account">Account</NuxtLink>
            <span class="breadcrumb__separator">/</span>
            <span class="breadcrumb__current">Orders</span>
          </nav>

          <!-- Hero Title -->
          <h1 class="orders-hero__title">My Orders</h1>
          <p class="orders-hero__subtitle">View and track all your coffee orders</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="orders-page__wrapper">
        <!-- Filters Bar -->
        <div class="filters-bar">
          <div class="filters-bar__left">
            <button class="filter-button" @click.stop="showFilters = !showFilters">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="18" x2="20" y2="18"/>
                <circle cx="7" cy="6" r="2" fill="currentColor"/>
                <circle cx="17" cy="12" r="2" fill="currentColor"/>
                <circle cx="11" cy="18" r="2" fill="currentColor"/>
              </svg>
              <span>Filters</span>
              <span v-if="activeFilterCount > 0" class="filter-badge">{{ activeFilterCount }}</span>
            </button>

            <!-- Active Filter Chips -->
            <div v-if="activeFilterChips.length > 0" class="filter-chips">
              <div
                v-for="chip in activeFilterChips"
                :key="chip.id"
                class="filter-chip"
              >
                <span>{{ chip.label }}</span>
                <button @click="removeFilter(chip.id)" class="filter-chip__remove">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <button v-if="activeFilterCount > 0" @click="clearAllFilters" class="clear-filters-btn">
                Clear all
              </button>
            </div>
          </div>

          <div class="filters-bar__right">
            <span class="results-count">{{ filteredOrders.length }} {{ filteredOrders.length === 1 ? 'order' : 'orders' }}</span>
          </div>
        </div>

        <!-- Filter Dropdown Menu -->
        <transition name="filter-dropdown">
          <div v-show="showFilters" class="filter-dropdown" v-click-outside="closeFilters">
            <div class="filter-dropdown__content">
              <!-- Status Filters -->
              <div class="filter-section">
                <h3 class="filter-section__title">Order Status</h3>
                <div class="filter-options">
                  <label class="filter-checkbox">
                    <input
                      type="checkbox"
                      value="delivered"
                      v-model="selectedStatuses"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">
                      <span class="status-icon">✓</span>
                      Delivered
                    </span>
                  </label>
                  <label class="filter-checkbox">
                    <input
                      type="checkbox"
                      value="shipped"
                      v-model="selectedStatuses"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">
                      <span class="status-icon">🚚</span>
                      In Transit
                    </span>
                  </label>
                  <label class="filter-checkbox">
                    <input
                      type="checkbox"
                      value="order_received"
                      v-model="selectedStatuses"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">
                      <span class="status-icon">⏳</span>
                      Order Received
                    </span>
                  </label>
                  <label class="filter-checkbox">
                    <input
                      type="checkbox"
                      value="pending"
                      v-model="selectedStatuses"
                    />
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-label">
                      <span class="status-icon">⏸</span>
                      Pending
                    </span>
                  </label>
                </div>
              </div>

              <div class="filter-divider"></div>

              <!-- Date Range Filters -->
              <div class="filter-section">
                <h3 class="filter-section__title">Date Range</h3>
                <div class="filter-options">
                  <label class="filter-radio">
                    <input
                      type="radio"
                      value="all"
                      v-model="dateFilter"
                    />
                    <span class="radio-custom"></span>
                    <span class="radio-label">All Time</span>
                  </label>
                  <label class="filter-radio">
                    <input
                      type="radio"
                      value="last3"
                      v-model="dateFilter"
                    />
                    <span class="radio-custom"></span>
                    <span class="radio-label">Last 3 Orders</span>
                  </label>
                  <label class="filter-radio">
                    <input
                      type="radio"
                      value="month"
                      v-model="dateFilter"
                    />
                    <span class="radio-custom"></span>
                    <span class="radio-label">Last Month</span>
                  </label>
                  <label class="filter-radio">
                    <input
                      type="radio"
                      value="year"
                      v-model="dateFilter"
                    />
                    <span class="radio-custom"></span>
                    <span class="radio-label">Last Year</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Filter Actions -->
            <div class="filter-dropdown__actions">
              <button @click="clearAllFilters" class="btn-text">
                Clear All
              </button>
              <button @click="applyFilters" class="btn btn--primary btn--sm">
                Apply Filters
              </button>
            </div>
          </div>
        </transition>

      <!-- Loading State -->
      <div v-if="orderManagement.loading.value" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your orders...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="orderManagement.error.value" class="error-state">
        <p>{{ orderManagement.error.value }}</p>
        <button @click="loadOrders" class="btn btn--primary">Try Again</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredOrders.length" class="empty-state">
        <div class="empty-state__icon">📦</div>
        <h2>{{ activeFilterCount === 0 ? 'No orders yet' : 'No orders match your filters' }}</h2>
        <p>{{ activeFilterCount === 0 ? 'Start shopping to see your orders here' : 'Try a different filter' }}</p>
        <NuxtLink v-if="activeFilterCount === 0" to="/shop-coffee" class="btn btn--primary">
          Browse Coffee
        </NuxtLink>
        <button v-else @click="clearAllFilters" class="btn btn--secondary">
          View All Orders
        </button>
      </div>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-card"
        >
          <div class="order-card__header" @click="toggleOrder(order.id)">
            <div class="order-card__collapsed-info">
              <div class="order-card__title">
                <h3>{{ order.orderNumber }}</h3>
                <span :class="`status status--${statusInfo(order.status).color}`">
                  {{ statusInfo(order.status).icon }} {{ statusInfo(order.status).label }}
                </span>
              </div>
              <div class="order-card__meta">
                <span class="date">📅 {{ orderManagement.formatDate(order.createdAt) }}</span>
                <span class="separator">•</span>
                <span class="items">📦 {{ order.items.length }} {{ order.items.length === 1 ? 'item' : 'items' }}</span>
                <span class="separator">•</span>
                <span class="total">💰 {{ orderManagement.formatPrice(order.total) }}</span>
              </div>
            </div>
            <button class="order-card__toggle" :aria-label="expandedOrders.has(order.id) ? 'Collapse order' : 'Expand order'">
              <span class="toggle-icon" :class="{ expanded: expandedOrders.has(order.id) }">▼</span>
            </button>
          </div>

          <template v-if="expandedOrders.has(order.id)">
            <!-- Progress Tracker -->
            <div v-if="getProgressSteps(order.status).length" class="progress-tracker">
              <div
                v-for="(step, index) in getProgressSteps(order.status)"
                :key="step.key"
                :class="['progress-step', { 'is-done': step.done, 'is-active': step.active && step.key !== 'delivered'  }]"
              >
                <div class="progress-step__dot">
                  <svg v-if="step.done" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span v-else-if="step.active" class="active-pulse"></span>
                </div>
                <div v-if="index < getProgressSteps(order.status).length - 1" :class="['progress-step__line', { 'is-done': step.done }]"></div>
                <span class="progress-step__label">{{ step.label }}</span>
              </div>
            </div>
            <div v-else class="status-banner" :class="`status-banner--${getStatusMeta(order.status).color}`">
              {{ getStatusMeta(order.status).icon }} This order has been {{ getStatusMeta(order.status).label.toLowerCase() }}
            </div>

            <!-- Two-column body -->
            <div class="order-expand-body">
              <div class="info-block">
                <h3 class="info-block__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  Shipping
                </h3>
                <div class="info-rows">
                  <div class="info-row">
                    <span class="info-row__label">Method</span>
                    <span class="info-row__value">{{ order.shippingMethod || '—' }}</span>
                  </div>
                  <div v-if="order.carrier" class="info-row">
                    <span class="info-row__label">Carrier</span>
                    <span class="info-row__value">{{ order.carrier }}</span>
                  </div>
                  <div v-if="order.trackingNumber" class="info-row">
                    <span class="info-row__label">Tracking No.</span>
                    <span class="info-row__value"><code class="tracking-code">{{ order.trackingNumber }}</code></span>
                  </div>
                  <div v-if="order.shippingAddress?.city" class="info-row">
                    <span class="info-row__label">Delivering to</span>
                    <span class="info-row__value">{{ order.shippingAddress.city }}{{ order.shippingAddress.postalCode ? ', ' + order.shippingAddress.postalCode : '' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-row__label">Subtotal</span>
                    <span class="info-row__value">{{ orderManagement.formatPrice(order.subtotal) }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-row__label">Shipping cost</span>
                    <span class="info-row__value">{{ order.shippingCost === 0 ? 'FREE' : orderManagement.formatPrice(order.shippingCost) }}</span>
                  </div>
                </div>
              </div>

              <div class="info-block">
                <h3 class="info-block__title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                  </svg>
                  Items ({{ order.items.length }})
                </h3>
                <div class="items-list">
                  <div v-for="(item, i) in order.items" :key="i" class="item-row">
                    <span class="item-name">{{ item.productName }}</span>
                    <span class="item-qty">x{{ item.quantity }}</span>
                  </div>
                </div>
                <div class="order-total-row">
                  <span>Total</span>
                  <span class="total-amount">{{ orderManagement.formatPrice(order.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="order-card__footer">
              <NuxtLink
                :to="`/account/orders/${order.id}`"
                class="btn btn--secondary btn--sm"
              >
                View Details
              </NuxtLink>
              <button
                v-if="order.status === 'delivered'"
                class="btn btn--primary btn--sm"
                @click.stop="reorder(order.id)"
              >
                Reorder
              </button>
            </div>
          </template>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
});

const orderManagement = useOrderManagement();
const router = useRouter();

// State
const showFilters = ref(false);
const selectedStatuses = ref<string[]>([]);
const dateFilter = ref<'all' | 'last3' | 'month' | 'year'>('all');
const expandedOrders = ref<Set<number>>(new Set());

// v-click-outside directive
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el: any) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};

// Load orders on mount
onMounted(async () => {
  console.log('Orders page mounted, loading orders...');
  await loadOrders();
  console.log('Orders loaded:', orderManagement.orders.value);
});

const loadOrders = async () => {
  console.log('Calling fetchUserOrders...');
  await orderManagement.fetchUserOrders();
  console.log('fetchUserOrders completed, orders:', orderManagement.orders.value.length);
};

// Computed
const allOrders = computed(() => orderManagement.orders.value);

const filteredOrders = computed(() => {
  let orders = orderManagement.orders.value;
  
  // Filter by status
  if (selectedStatuses.value.length > 0) {
    orders = orders.filter(order => selectedStatuses.value.includes(order.status));
  }
  
  // Filter by date
  if (dateFilter.value !== 'all') {
    const now = new Date();
    
    if (dateFilter.value === 'last3') {
      orders = orders.slice(0, 3);
    } else if (dateFilter.value === 'month') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      orders = orders.filter(order => new Date(order.createdAt) >= oneMonthAgo);
    } else if (dateFilter.value === 'year') {
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      orders = orders.filter(order => new Date(order.createdAt) >= oneYearAgo);
    }
  }
  
  return orders;
});

// Active filter count
const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedStatuses.value.length > 0) count += selectedStatuses.value.length;
  if (dateFilter.value !== 'all') count += 1;
  return count;
});

// Active filter chips
const activeFilterChips = computed(() => {
  const chips: Array<{ id: string; label: string }> = [];
  
  // Status chips
  const statusLabels: Record<string, string> = {
    delivered: '✓ Delivered',
    shipped: '🚚 Shipped',
    in_transit: '🚚 In Transit',
    order_received: '⏳ Order Received',
    packed: '📦 Packed',
    cancelled: '❌ Cancelled',
    refunded: '💰 Refunded',
  };
  
  selectedStatuses.value.forEach(status => {
    chips.push({
      id: `status-${status}`,
      label: statusLabels[status] || status,
    });
  });
  
  // Date chip
  const dateLabels: Record<string, string> = {
    last3: 'Last 3 Orders',
    month: 'Last Month',
    year: 'Last Year',
  };
  
  if (dateFilter.value !== 'all') {
    chips.push({
      id: 'date',
      label: dateLabels[dateFilter.value],
    });
  }
  
  return chips;
});

// Methods
const statusInfo = (status: string) => {
  return orderManagement.getStatusInfo(status as any);
};

const toggleOrder = (orderId: number) => {
  if (expandedOrders.value.has(orderId)) {
    expandedOrders.value.delete(orderId);
  } else {
    expandedOrders.value.add(orderId);
  }
};

const closeFilters = () => {
  showFilters.value = false;
};

const applyFilters = () => {
  showFilters.value = false;
};

const removeFilter = (filterId: string) => {
  if (filterId.startsWith('status-')) {
    const status = filterId.replace('status-', '');
    selectedStatuses.value = selectedStatuses.value.filter(s => s !== status);
  } else if (filterId === 'date') {
    dateFilter.value = 'all';
  }
};

const clearAllFilters = () => {
  selectedStatuses.value = [];
  dateFilter.value = 'all';
  showFilters.value = false;
};

const reorder = (orderId: number) => {
  // TODO: Implement reorder functionality
  console.log('Reorder:', orderId);
  alert('Reorder functionality coming soon!');
};

const getStatusMeta = (status: string) => {
  const map: Record<string, { label: string; color: string; icon: string; step: number }> = {
    order_received: { label: 'Order Received', color: 'blue',   icon: '⏳', step: 0 },
    packed:         { label: 'Packed',         color: 'purple', icon: '📦', step: 1 },
    shipped:        { label: 'Shipped',        color: 'indigo', icon: '🚚', step: 2 },
    in_transit:     { label: 'In Transit',     color: 'indigo', icon: '🚚', step: 2 },
    delivered:      { label: 'Delivered',      color: 'green',  icon: '✅', step: 3 },
    cancelled:      { label: 'Cancelled',      color: 'red',    icon: '❌', step: -1 },
    refunded:       { label: 'Refunded',       color: 'orange', icon: '💰', step: -1 },
  };
  return map[status] ?? map['order_received'];
};

const getProgressSteps = (status: string) => {
  const step = getStatusMeta(status).step;
  if (step === -1) return [];
  return [
    { key: 'received',  label: 'Received',  done: step > 0,  active: step === 0 },
    { key: 'packed',    label: 'Packed',    done: step > 1,  active: step === 1 },
    { key: 'shipped',   label: 'Shipped',   done: step > 2,  active: step === 2 },
    { key: 'delivered', label: 'Delivered', done: step >= 3, active: step === 3 },
  ];
};

// SEO
useHead({
  title: 'My Orders - Carafe Coffee',
  meta: [
    {
      name: 'description',
      content: 'View and track all your coffee orders',
    },
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

.orders-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
  padding-bottom: $spacing-16;
}

// Hero Section
.orders-hero {
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

  &__title {
    font-family: $font-family-heading;
    font-size: 3rem;
    font-weight: 700;
    color: white;
    margin: $spacing-4 0 $spacing-3;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  &__subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    max-width: 600px;

    @media (max-width: 768px) {
      font-size: 1rem;
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

// Wrapper
.orders-page__wrapper {
  max-width: 1200px;
  margin: -80px auto 0;
  padding: 0 $spacing-4;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    margin-top: -60px;
  }
}

.orders-page {
  // Page-specific styles
}

// Filters Bar
.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $spacing-4;
  margin-bottom: $spacing-6;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: $spacing-3;
    flex-wrap: wrap;
    flex: 1;
  }

  &__right {
    display: flex;
    align-items: center;
  }
}

.filter-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid $color-gray-300;
  border-radius: 12px;
  font-weight: 600;
  color: $color-text;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  svg {
    color: $color-gray-600;
    transition: color 0.2s ease;
  }

  &:hover {
    background: $color-gray-50;
    border-color: $color-primary;

    svg {
      color: $color-primary;
    }
  }

  &:active {
    transform: scale(0.98);
  }
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.4rem;
  background: $color-primary;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba($color-primary, 0.1);
  color: $color-primary;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  animation: slideIn 0.2s ease;

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    background: transparent;
    border: none;
    color: $color-primary;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background: rgba($color-primary, 0.2);
    }

    svg {
      width: 12px;
      height: 12px;
    }
  }
}

.clear-filters-btn {
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  color: $color-gray-600;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;

  &:hover {
    color: $color-text;
  }
}

.results-count {
  font-size: 0.875rem;
  color: $color-gray-600;
  font-weight: 500;
  white-space: nowrap;
}

// Filter Dropdown
.filter-dropdown {
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  margin-bottom: $spacing-6;
  overflow: hidden;
  animation: dropdownSlide 0.3s ease;

  &__content {
    padding: $spacing-5;
    max-height: 480px;
    overflow-y: auto;

    @media (max-width: 768px) {
      max-height: 60vh;
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-4 $spacing-5;
    border-top: 1px solid $color-gray-200;
    background: $color-gray-50;
  }
}

.filter-section {
  margin-bottom: $spacing-6;

  &:last-child {
    margin-bottom: 0;
  }

  &__title {
    font-size: 0.875rem;
    font-weight: 700;
    color: $color-text;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 $spacing-3;
  }
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.filter-checkbox,
.filter-radio {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;

  &:hover {
    background: $color-gray-50;
  }

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;

    &:checked ~ .checkbox-custom {
      background: $color-primary;
      border-color: $color-primary;

      &::after {
        opacity: 1;
        transform: scale(1);
      }
    }

    &:checked ~ .radio-custom {
      border-color: $color-primary;

      &::after {
        opacity: 1;
        transform: scale(1) translate(-50%, -50%);
      }
    }
  }

  .checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid $color-gray-400;
    border-radius: 6px;
    background: white;
    flex-shrink: 0;
    transition: all 0.2s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 2px;
      width: 6px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) scale(0);
      opacity: 0;
      transition: all 0.2s ease;
    }
  }

  .radio-custom {
    width: 20px;
    height: 20px;
    border: 2px solid $color-gray-400;
    border-radius: 50%;
    background: white;
    flex-shrink: 0;
    transition: all 0.2s ease;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 10px;
      height: 10px;
      background: $color-primary;
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      transition: all 0.2s ease;
    }
  }

  .checkbox-label,
  .radio-label {
    flex: 1;
    font-size: 0.9375rem;
    color: $color-text;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-icon {
    font-size: 1rem;
  }
}

.filter-divider {
  height: 1px;
  background: $color-gray-200;
  margin: $spacing-5 0;
}

.btn-text {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: $color-gray-600;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: $color-text;
  }
}

// Animations
@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// Transitions
.filter-dropdown-enter-active,
.filter-dropdown-leave-active {
  transition: all 0.3s ease;
}

.filter-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.filter-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
  margin-top: 40px;
}

.order-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-4;
    border-bottom: 1px solid $color-gray-200;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
      background: $color-gray-50;
    }
  }

  &__collapsed-info {
    flex: 1;
  }

  &__title {
    display: flex;
    align-items: center;
    margin-bottom: $spacing-2;
    flex-wrap: wrap;
    gap: $spacing-2;
    
    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: $color-dark;
      margin: 0;
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: $spacing-2;
    font-size: 0.875rem;
    color: $color-gray-600;

    .separator {
      color: $color-gray-400;
    }

    .date, .items, .total {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  &__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: $color-gray-100;
    color: $color-gray-600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-left: $spacing-3;

    &:hover {
      background: $color-primary;
      color: white;
    }

    .toggle-icon {
      display: inline-block;
      transition: transform 0.3s ease;
      font-size: 0.75rem;

      &.expanded {
        transform: rotate(180deg);
      }
    }
  }

  &__body {
    padding: $spacing-4;
  }

  &__footer {
    display: flex;
    gap: $spacing-3;
    padding: $spacing-4;
    border-top: 1px solid $color-gray-200;
    background: $color-gray-50;
  }
}

.order-items {
  margin-bottom: $spacing-3;
}

.order-item {
  display: grid;
  grid-template-columns: 50px 1fr auto;
  gap: $spacing-3;
  padding: $spacing-2 0;
  border-bottom: 1px solid $color-gray-100;
  
  &:last-child {
    border-bottom: none;
  }

  &__image {
    width: 50px;
    height: 50px;
    border-radius: 6px;
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
      font-size: $font-size-2xl;
    }
  }

  &__details {
    h4 {
      font-size: $font-size-base;
      font-weight: 600;
      color: $color-dark;
      margin-bottom: $spacing-1;
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
    font-weight: 600;
    color: $color-dark;
    display: flex;
    align-items: center;
  }
}

.order-summary {
  padding: $spacing-4;
  background: $color-gray-50;
  border-radius: 8px;
  margin-bottom: $spacing-4;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: $spacing-2 0;
  
  &--total {
    border-top: 2px solid $color-gray-300;
    margin-top: $spacing-2;
    padding-top: $spacing-3;
    font-size: $font-size-lg;
    font-weight: 700;
    color: $color-dark;
  }
}

.tracking-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  
  &__icon {
    font-size: $font-size-2xl;
  }
  
  &__details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-1;
    font-size: $font-size-sm;
    
    strong {
      color: $color-gray-700;
    }
    
    span {
      font-family: 'Courier New', monospace;
      color: $color-dark;
    }
  }
  
  &__link {
    color: #16a34a;
    text-decoration: none;
    font-weight: 600;
    white-space: nowrap;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: $font-size-xs;
  font-weight: 500;
  white-space: nowrap;
  
  &--gray { background: #f3f4f6; color: #6b7280; }
  &--blue { background: #dbeafe; color: #1e40af; }
  &--purple { background: #ede9fe; color: #6d28d9; }
  &--green { background: #d1fae5; color: #065f46; }
  &--red { background: #fee2e2; color: #991b1b; }
  &--orange { background: #ffedd5; color: #9a3412; }
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: $spacing-16;
  background: white;
  border-radius: 12px;
}

.empty-state {
  &__icon {
    font-size: 64px;
    margin-bottom: $spacing-4;
  }
  
  h2 {
    font-size: $font-size-2xl;
    margin-bottom: $spacing-2;
  }
  
  p {
    color: $color-gray-600;
    margin-bottom: $spacing-6;
  }
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

.btn {
  &--sm {
    padding: $spacing-2 $spacing-4;
    font-size: $font-size-sm;
  }
}

// Container
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-4;
}

// ── Track-order style expanded body ──────────────────────────

.progress-tracker {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1.75rem 2rem 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 60px;

  &__dot {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid #ddd;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
  }

  &__line {
    position: absolute;
    top: 15px;
    left: calc(50% + 16px);
    right: calc(-50% + 16px);
    height: 2px;
    background: #e0e0e0;
    &.is-done { background: $color-primary; }
  }

  &__label {
    font-size: 0.72rem;
    color: $color-text-light;
    margin-top: 0.45rem;
    text-align: center;
    white-space: nowrap;
  }

  &.is-done {
    .progress-step__dot { background: $color-primary; border-color: $color-primary; color: white; }
    .progress-step__label { color: $color-primary; font-weight: 600; }
  }

  &.is-active {
    .progress-step__dot { border-color: $color-primary; background: rgba($color-primary, 0.08); }
    .progress-step__label { color: $color-primary; font-weight: 700; }
  }
}

.active-pulse {
  width: 10px;
  height: 10px;
  background: $color-primary;
  border-radius: 50%;
  animation: expand-pulse 1.4s ease-in-out infinite;
}

@keyframes expand-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.55; }
}

.status-banner {
  padding: 1rem 2rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 1px solid #f0f0f0;
  &--red    { background: #fef2f2; color: #991b1b; }
  &--orange { background: #fff7ed; color: #9a3412; }
}

.order-expand-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #f0f0f0;

  @media (max-width: 580px) { grid-template-columns: 1fr; }
}

.info-block {
  padding: 1.5rem 1.75rem;

  &:first-child {
    border-right: 1px solid #f0f0f0;
    @media (max-width: 580px) { border-right: none; border-bottom: 1px solid #f0f0f0; }
  }

  &__title {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: $color-text-light;
    font-weight: 600;
    margin: 0 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
}

.info-rows { display: flex; flex-direction: column; gap: 0.8rem; }

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;

  &__label {
    font-size: 0.7rem;
    color: $color-text-light;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__value {
    font-size: 0.9rem;
    color: $color-text;
    font-weight: 500;
  }
}

.tracking-code {
  font-family: monospace;
  background: #f3f4f6;
  padding: 0.15rem 0.5rem;
  border-radius: 0.3rem;
  font-size: 0.82rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 0.88rem;
  &:last-child { border-bottom: none; }
}

.item-name { color: $color-text; font-weight: 500; }
.item-qty  { color: $color-text-light; }

.order-total-row {
  display: flex;
  justify-content: space-between;
  padding: 0.65rem 0 0;
  border-top: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: 0.95rem;
}

.total-amount { color: $color-primary; font-size: 1.05rem; }
</style>
