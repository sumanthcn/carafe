<template>
  <div class="account-dashboard">
    <!-- Hero Section -->
    <div class="account-hero">
      <div class="account-hero__background"></div>
      <div class="container">
        <div class="account-hero__content">
          <!-- Breadcrumb -->
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <NuxtLink to="/">Home</NuxtLink>
            <span class="breadcrumb__separator">/</span>
            <span class="breadcrumb__current">Account</span>
          </nav>

          <!-- Hero Title -->
          <h1 class="account-hero__title">My Account</h1>
          <p class="account-hero__subtitle">Welcome back, {{ user?.username }}! Manage your orders, profile, and preferences</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="account-dashboard__wrapper">
        <div class="account-dashboard__grid">
        <!-- Profile Card -->
        <div class="dashboard-card dashboard-card--profile">
          <div class="profile-card__header">
            <div class="profile-card__avatar">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              </svg>
            </div>
            <div class="profile-card__info">
              <h2>{{ user?.username }}</h2>
              <p>{{ user?.email }}</p>
            </div>
          </div>

          <div class="profile-card__body">
            <div class="profile-field">
              <label>Username</label>
              <p>{{ user?.username }}</p>
            </div>

            <div class="profile-field">
              <label>Email Address</label>
              <p>{{ user?.email }}</p>
            </div>

            <div class="profile-field">
              <label>Account Status</label>
              <p>
                <span v-if="user?.confirmed" class="status-badge status-badge--success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Verified
                </span>
                <span v-else class="status-badge status-badge--warning">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Pending Verification
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="dashboard-card dashboard-card--wide">
          <div class="dashboard-card__header">
            <h2>Recent Orders</h2>
            <NuxtLink to="/account/orders" class="dashboard-card__link">
              View All
            </NuxtLink>
          </div>
          <div class="dashboard-card__content">
            <div v-if="orderManagement.loading.value" class="loading-state">
              <div class="spinner"></div>
              <p>Loading orders...</p>
            </div>
            
            <div v-else-if="orderManagement.error.value" class="error-state">
              <p>{{ orderManagement.error.value }}</p>
            </div>
            
            <div v-else-if="!recentOrders.length" class="empty-state">
              <p>No orders yet</p>
              <NuxtLink to="/shop-coffee" class="btn btn--primary">
                Start Shopping
              </NuxtLink>
            </div>
            
            <div v-else class="orders-list">
              <div 
                v-for="order in recentOrders" 
                :key="order.id"
                class="order-item"
              >
                <div class="order-item__header">
                  <span class="order-number">{{ order.orderNumber }}</span>
                  <span :class="`status status--${statusInfo(order.status).color}`">
                    {{ statusInfo(order.status).icon }} {{ statusInfo(order.status).label }}
                  </span>
                </div>
                <div class="order-item__details">
                  <span class="date">{{ orderManagement.formatDate(order.createdAt) }}</span>
                  <span class="total">{{ orderManagement.formatPrice(order.total) }}</span>
                </div>
                <div class="order-item__items">
                  {{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}
                </div>
                <NuxtLink 
                  :to="`/account/orders/${order.id}`"
                  class="order-item__link"
                >
                  View Details →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="dashboard-card">
          <div class="dashboard-card__header">
            <h2>Quick Actions</h2>
          </div>
          <div class="dashboard-card__content">
            <nav class="quick-actions">
              <NuxtLink to="/account/orders" class="quick-action">
                <span class="icon">📦</span>
                <span>My Orders</span>
              </NuxtLink>
              <NuxtLink to="/account/profile" class="quick-action">
                <span class="icon">👤</span>
                <span>Edit Profile</span>
              </NuxtLink>
              <NuxtLink to="/shop-coffee" class="quick-action">
                <span class="icon">☕</span>
                <span>Shop Coffee</span>
              </NuxtLink>
              <button @click="handleLogout" class="quick-action">
                <span class="icon">🚪</span>
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Order Statistics -->
        <div class="dashboard-card">
          <div class="dashboard-card__header">
            <h2>Statistics</h2>
          </div>
          <div class="dashboard-card__content">
            <div class="stats">
              <div class="stat">
                <span class="stat__value">{{ totalOrders }}</span>
                <span class="stat__label">Total Orders</span>
              </div>
              <div class="stat">
                <span class="stat__value">{{ orderManagement.formatPrice(totalSpent) }}</span>
                <span class="stat__label">Total Spent</span>
              </div>
            </div>
          </div>
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

const { user, logout } = useAuth();
const orderManagement = useOrderManagement();
const router = useRouter();

// Fetch user orders on mount
onMounted(async () => {
  await orderManagement.fetchUserOrders();
});

// Computed properties
const recentOrders = computed(() => {
  return orderManagement.orders.value.slice(0, 3);
});

const totalOrders = computed(() => {
  return orderManagement.orders.value.length;
});

const totalSpent = computed(() => {
  return orderManagement.orders.value.reduce((sum, order) => sum + order.total, 0);
});

// Member since computation removed as createdAt is not available in user type

// Methods
const statusInfo = (status: string) => {
  return orderManagement.getStatusInfo(status as any);
};

const handleLogout = async () => {
  await logout();
  router.push('/');
};

// SEO
useHead({
  title: 'My Account - Carafe Coffee',
  meta: [
    {
      name: 'description',
      content: 'Manage your account, view orders, and track shipments',
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

.account-dashboard {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
  padding-bottom: $spacing-16;
}

// Hero Section
.account-hero {
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
    max-width: 700px;

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

// Wrapper for content
.account-dashboard__wrapper {
  max-width: 1200px;
  margin: -80px auto 0;
  padding: 0 $spacing-4;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    margin-top: -60px;
  }
}

.account-dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-6;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  
  &--wide {
    @media (min-width: 768px) {
      grid-column: span 2;
    }
  }

  &--profile {
    @media (min-width: 768px) {
      grid-column: span 1;
      grid-row: span 2;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-6;
    border-bottom: 1px solid $color-gray-200;
    
    h2 {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-dark;
    }
  }

  &__link {
    font-size: $font-size-sm;
    color: $color-primary;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }

  &__content {
    padding: $spacing-6;
  }
}

// Profile Card Styles
.profile-card__header {
  background: linear-gradient(135deg, $color-primary 0%, adjust-hue($color-primary, 20) 100%);
  color: white;
  padding: $spacing-8 $spacing-6;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-card__avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  border: 4px solid rgba(255, 255, 255, 0.3);
  margin: 0 auto $spacing-4;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);

  svg {
    color: white;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
}

.profile-card__info {
  h2 {
    font-size: 1.75rem;
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  p {
    margin: 0;
    opacity: 0.95;
    font-size: 1rem;
  }
}

.profile-card__body {
  padding: $spacing-6;
  background: white;
}

.profile-field {
  margin-bottom: $spacing-5;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $color-text-light;
    margin-bottom: $spacing-2;
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: $color-text;
    font-weight: 500;
    padding: $spacing-3 $spacing-4;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;

  svg {
    flex-shrink: 0;
  }

  &--success {
    background: #d1fae5;
    color: #065f46;
  }

  &--warning {
    background: #fef3c7;
    color: #92400e;
  }
}

.profile-info {
  &__item {
    display: flex;
    justify-content: space-between;
    padding: $spacing-3 0;
    border-bottom: 1px solid $color-gray-100;
    
    &:last-child {
      border-bottom: none;
    }
    
    .label {
      font-weight: 500;
      color: $color-gray-600;
    }
    
    .value {
      color: $color-dark;
    }
  }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-4;
}

.order-item {
  padding: $spacing-4;
  border: 1px solid $color-gray-200;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: $color-primary;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-2;
    
    .order-number {
      font-weight: 600;
      color: $color-dark;
    }
  }

  &__details {
    display: flex;
    justify-content: space-between;
    font-size: $font-size-sm;
    color: $color-gray-600;
    margin-bottom: $spacing-2;
    
    .total {
      font-weight: 600;
      color: $color-dark;
    }
  }

  &__items {
    font-size: $font-size-sm;
    color: $color-gray-500;
    margin-bottom: $spacing-3;
  }

  &__link {
    display: inline-block;
    color: $color-primary;
    font-size: $font-size-sm;
    font-weight: 500;
    text-decoration: none;
    
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
  
  &--gray { background: #f3f4f6; color: #6b7280; }
  &--blue { background: #dbeafe; color: #1e40af; }
  &--purple { background: #ede9fe; color: #6d28d9; }
  &--green { background: #d1fae5; color: #065f46; }
  &--red { background: #fee2e2; color: #991b1b; }
  &--orange { background: #ffedd5; color: #9a3412; }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-3;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-4;
  border: 1px solid $color-gray-200;
  border-radius: 8px;
  text-decoration: none;
  color: $color-dark;
  transition: all 0.2s;
  background: white;
  cursor: pointer;
  
  &:hover {
    border-color: $color-primary;
    background: $color-gray-50;
  }
  
  .icon {
    font-size: $font-size-2xl;
  }
  
  span:last-child {
    font-size: $font-size-sm;
    font-weight: 500;
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-6;
}

.stat {
  text-align: center;
  
  &__value {
    display: block;
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $color-primary;
    margin-bottom: $spacing-1;
  }
  
  &__label {
    display: block;
    font-size: $font-size-sm;
    color: $color-gray-600;
  }
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: $spacing-8;
  color: $color-gray-600;
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

// Container
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-4;
}
</style>
