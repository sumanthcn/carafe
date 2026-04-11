<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

const config = useRuntimeConfig();
const { getAuthHeaders } = useAuth();

const stats = ref({ orders: 0, products: 0, subscribers: 0, revenue: 0 });
const recentOrders = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const headers = getAuthHeaders();
    const [ordersRes, productsRes, subsRes] = await Promise.all([
      $fetch<any>(`${config.public.strapiUrl}/api/orders?pagination[limit]=5&sort=createdAt:desc&populate=*`, { headers }),
      $fetch<any>(`${config.public.strapiUrl}/api/products?pagination[limit]=1`, { headers }),
      $fetch<any>(`${config.public.strapiUrl}/api/email-subscribers?pagination[limit]=1`, { headers }),
    ]);

    stats.value.orders = ordersRes?.meta?.pagination?.total ?? 0;
    stats.value.products = productsRes?.meta?.pagination?.total ?? 0;
    stats.value.subscribers = subsRes?.meta?.pagination?.total ?? 0;

    const orders = ordersRes?.data ?? [];
    recentOrders.value = orders.map((item: any) => item.attributes || item);

    stats.value.revenue = recentOrders.value.reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0);
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

const statusColor: Record<string, string> = {
  order_received: 'blue', packed: 'purple', shipped: 'indigo',
  in_transit: 'indigo', delivered: 'green', cancelled: 'red', refunded: 'orange',
};
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome back! Here's what's happening in your store.</p>
    </div>

    <div class="stats-grid">
      <NuxtLink to="/store-admin/orders" class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">📦</div>
        <div>
          <div class="stat-card__value">{{ stats.orders }}</div>
          <div class="stat-card__label">Total Orders</div>
        </div>
      </NuxtLink>
      <NuxtLink to="/store-admin/products" class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">☕</div>
        <div>
          <div class="stat-card__value">{{ stats.products }}</div>
          <div class="stat-card__label">Products</div>
        </div>
      </NuxtLink>
      <NuxtLink to="/store-admin/subscribers" class="stat-card">
        <div class="stat-card__icon stat-card__icon--purple">✉️</div>
        <div>
          <div class="stat-card__value">{{ stats.subscribers }}</div>
          <div class="stat-card__label">Subscribers</div>
        </div>
      </NuxtLink>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--orange">💰</div>
        <div>
          <div class="stat-card__value">£{{ stats.revenue.toFixed(2) }}</div>
          <div class="stat-card__label">Recent Revenue</div>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <h2>Recent Orders</h2>
        <NuxtLink to="/store-admin/orders" class="link-btn">View all →</NuxtLink>
      </div>

      <div v-if="loading" class="loading-placeholder">Loading…</div>
      <table v-else-if="recentOrders.length" class="data-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id">
            <td><code>{{ order.orderNumber }}</code></td>
            <td>{{ order.customerName }}</td>
            <td>
              <span :class="`badge badge--${statusColor[order.orderStatus] || 'gray'}`">
                {{ order.orderStatus?.replace('_', ' ') }}
              </span>
            </td>
            <td>£{{ parseFloat(order.total).toFixed(2) }}</td>
            <td>{{ new Date(order.createdAt).toLocaleDateString('en-GB') }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-msg">No orders yet.</p>
    </div>

    <div class="quick-links">
      <NuxtLink to="/store-admin/products" class="quick-link">
        <span>☕</span><span>Manage Products</span>
      </NuxtLink>
      <NuxtLink to="/store-admin/categories" class="quick-link">
        <span>🗂️</span><span>Manage Categories</span>
      </NuxtLink>
      <NuxtLink to="/store-admin/users" class="quick-link">
        <span>👥</span><span>Manage Users</span>
      </NuxtLink>
      <NuxtLink to="/store-admin/subscribers" class="quick-link">
        <span>✉️</span><span>Email Subscribers</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.page-header {
  margin-bottom: 1.75rem;
  h1 { font-size: 1.75rem; font-weight: 700; color: #1e293b; margin: 0 0 .25rem; }
  p  { color: #64748b; margin: 0; }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  text-decoration: none;
  color: inherit;
  transition: box-shadow .2s;
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); }

  &__icon {
    width: 48px; height: 48px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; flex-shrink: 0;
    &--blue   { background: #dbeafe; }
    &--green  { background: #dcfce7; }
    &--purple { background: #ede9fe; }
    &--orange { background: #ffedd5; }
  }

  &__value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
  &__label { font-size: 0.8rem; color: #64748b; }
}

.section-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  margin-bottom: 1.75rem;
  overflow: hidden;

  &__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #f1f5f9;
    h2 { margin: 0; font-size: 1rem; font-weight: 600; color: #1e293b; }
  }
}

.link-btn {
  color: #6366f1; font-size: 0.875rem; font-weight: 600; text-decoration: none;
  &:hover { text-decoration: underline; }
}

.data-table {
  width: 100%; border-collapse: collapse;
  th, td { padding: .75rem 1.25rem; text-align: left; font-size: .875rem; }
  th { color: #64748b; font-weight: 600; font-size: .75rem; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
  tr:not(:last-child) td { border-bottom: 1px solid #f8fafc; }
  code { font-family: monospace; font-size: .82rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
}

.badge {
  display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: .72rem; font-weight: 600; text-transform: capitalize;
  &--blue   { background: #dbeafe; color: #1e40af; }
  &--purple { background: #ede9fe; color: #6d28d9; }
  &--indigo { background: #e0e7ff; color: #4338ca; }
  &--green  { background: #dcfce7; color: #166534; }
  &--red    { background: #fee2e2; color: #991b1b; }
  &--orange { background: #ffedd5; color: #9a3412; }
  &--gray   { background: #f1f5f9; color: #475569; }
}

.loading-placeholder { padding: 2rem; text-align: center; color: #94a3b8; }
.empty-msg { padding: 2rem; text-align: center; color: #94a3b8; }

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.quick-link {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  text-decoration: none;
  color: #1e293b;
  font-weight: 600;
  font-size: .875rem;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  transition: all .2s;
  span:first-child { font-size: 1.75rem; }
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); transform: translateY(-2px); }
}
</style>
