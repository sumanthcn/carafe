<template>
  <div class="subscriptions-page">
    <!-- Hero -->
    <div class="subs-hero">
      <div class="subs-hero__background"></div>
      <div class="container">
        <div class="subs-hero__content">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <NuxtLink to="/">Home</NuxtLink>
            <span class="breadcrumb__separator">/</span>
            <NuxtLink to="/account">Account</NuxtLink>
            <span class="breadcrumb__separator">/</span>
            <span class="breadcrumb__current">My Subscriptions</span>
          </nav>
          <h1 class="subs-hero__title">My Subscriptions</h1>
          <p class="subs-hero__subtitle">Manage your recurring coffee deliveries</p>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="subs-page__wrapper">

        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading your subscriptions...</p>
        </div>

        <!-- Empty -->
        <div v-else-if="!subscriptions.length" class="empty-state">
          <div class="empty-state__icon">🔁</div>
          <h2>No active subscriptions</h2>
          <p>Subscribe to a coffee product and your recurring deliveries will appear here.</p>
          <NuxtLink to="/shop-coffee" class="btn btn--primary">Browse Coffee</NuxtLink>
        </div>

        <!-- Subscription cards -->
        <div v-else class="subs-list">
          <!-- Stats strip -->
          <div class="stats-strip">
            <div class="stats-strip__item">
              <span class="stats-strip__value">{{ activeCount }}</span>
              <span class="stats-strip__label">Active</span>
            </div>
            <div class="stats-strip__item">
              <span class="stats-strip__value">{{ totalOrdersPlaced }}</span>
              <span class="stats-strip__label">Total Deliveries</span>
            </div>
            <div class="stats-strip__item">
              <span class="stats-strip__value">{{ formatPrice(lifetimeSpend) }}</span>
              <span class="stats-strip__label">Lifetime Spend</span>
            </div>
          </div>

          <div v-for="sub in subscriptions" :key="sub.id" class="sub-card" :class="'sub-card--' + sub.status">
            <div class="sub-card__header">
              <div class="sub-card__product">
                <h3>{{ sub.productName }}</h3>
                <span v-if="sub.variantDetails?.weight" class="sub-card__weight">{{ sub.variantDetails.weight }}</span>
              </div>
              <span class="status-badge" :class="'status-badge--' + sub.status">{{ statusLabel(sub.status) }}</span>
            </div>

            <div class="sub-card__body">
              <div class="sub-detail-grid">
                <div class="sub-detail">
                  <span class="sub-detail__label">Delivery interval</span>
                  <span class="sub-detail__value interval-chip">{{ formatInterval(sub.interval) }}</span>
                </div>
                <div class="sub-detail">
                  <span class="sub-detail__label">Price per delivery</span>
                  <span class="sub-detail__value">
                    {{ formatPrice(sub.unitPrice) }}
                    <span v-if="sub.discountPercentage" class="saving-tag">{{ sub.discountPercentage }}% off</span>
                  </span>
                </div>
                <div class="sub-detail">
                  <span class="sub-detail__label">Started</span>
                  <span class="sub-detail__value">{{ formatDate(sub.startDate) }}</span>
                </div>
                <div class="sub-detail" v-if="sub.status === 'active'">
                  <span class="sub-detail__label">Next delivery</span>
                  <span class="sub-detail__value" :class="{ 'text-overdue': isOverdue(sub) }">
                    {{ formatDate(sub.nextBillingDate) }}
                    <span v-if="isOverdue(sub)" class="overdue-chip">Processing soon</span>
                  </span>
                </div>
                <div class="sub-detail" v-if="sub.status === 'cancelled'">
                  <span class="sub-detail__label">Cancelled on</span>
                  <span class="sub-detail__value">{{ formatDate(sub.cancelledAt) }}</span>
                </div>
                <div class="sub-detail">
                  <span class="sub-detail__label">Deliveries made</span>
                  <span class="sub-detail__value">{{ sub.totalOrdersGenerated || 1 }}</span>
                </div>
              </div>

              <!-- Order history -->
              <div v-if="(sub.orderNumbers || []).length" class="order-history">
                <h4>Order history</h4>
                <div class="order-history__list">
                  <div v-for="(num, idx) in sub.orderNumbers" :key="num" class="order-history__row">
                    <span class="order-history__badge">{{ idx === 0 ? 'First order' : 'Auto-delivery ' + idx }}</span>
                    <span class="order-history__num">{{ num }}</span>
                    <NuxtLink :to="`/account/orders?search=${num}`" class="order-history__link">View →</NuxtLink>
                  </div>
                </div>
              </div>

              <!-- Billing error -->
              <div v-if="sub.lastBillingError" class="billing-error">
                ⚠️ Last billing error: {{ sub.lastBillingError }}
              </div>
            </div>

            <div class="sub-card__actions">
              <button
                v-if="sub.status === 'active' || sub.status === 'payment_failed'"
                class="btn btn--danger-outline"
                :disabled="cancellingId === sub.id"
                @click="cancelSub(sub)"
              >
                {{ cancellingId === sub.id ? 'Cancelling...' : 'Cancel subscription' }}
              </button>
              <span v-if="sub.status === 'cancelled'" class="cancelled-note">
                This subscription has been cancelled. <NuxtLink to="/shop-coffee">Re-subscribe →</NuxtLink>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const config = useRuntimeConfig();
const { getAuthHeaders } = useAuth();

const subscriptions = ref<any[]>([]);
const loading = ref(true);
const cancellingId = ref<number | null>(null);

const INTERVAL_LABELS: Record<string, string> = {
  '5_minutes': 'Every 5 min (test)',
  '1_week': 'Every week',
  '2_weeks': 'Every 2 weeks',
  '3_weeks': 'Every 3 weeks',
  '1_month': 'Every 4 weeks',
  '2_months': 'Every 2 months',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  cancelled: 'Cancelled',
  payment_failed: 'Payment failed',
};

const loadSubscriptions = async () => {
  loading.value = true;
  try {
    const res = await $fetch<{ data: any[] }>(
      `${config.public.strapiUrl}/api/customer-subscriptions/mine`,
      { headers: getAuthHeaders() }
    );
    subscriptions.value = res.data || [];
  } catch (e) {
    console.error('Failed to load subscriptions', e);
  } finally {
    loading.value = false;
  }
};

onMounted(loadSubscriptions);

const activeCount = computed(() => subscriptions.value.filter(s => s.status === 'active').length);
const totalOrdersPlaced = computed(() => subscriptions.value.reduce((t, s) => t + (s.totalOrdersGenerated || 1), 0));
const lifetimeSpend = computed(() => subscriptions.value.reduce((t, s) => t + Number(s.totalRevenue || 0), 0));

const isOverdue = (sub: any) =>
  sub.status === 'active' && sub.nextBillingDate && new Date(sub.nextBillingDate) < new Date();

const formatDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n || 0);

const formatInterval = (i: string) => INTERVAL_LABELS[i] || i;
const statusLabel = (s: string) => STATUS_LABELS[s] || s;

const cancelSub = async (sub: any) => {
  if (!confirm(`Cancel your "${sub.productName}" subscription? You won't be charged again after this.`)) return;
  cancellingId.value = sub.id;
  try {
    await $fetch(`${config.public.strapiUrl}/api/stripe/cancel-subscription`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: { subscriptionId: sub.id },
    });
    await loadSubscriptions();
  } catch (e: any) {
    alert('Failed to cancel: ' + (e.data?.error?.message || e.message || String(e)));
  } finally {
    cancellingId.value = null;
  }
};

useHead({
  title: 'My Subscriptions - Carafe Coffee',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.subscriptions-page {
  background: $color-gray-50;
  min-height: 100vh;
}

.subs-hero {
  position: relative;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%);
  padding: 7rem 0 $spacing-8;
  overflow: hidden;

  &__background {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba($color-primary, 0.15), transparent 60%);
  }

  &__content { position: relative; z-index: 1; }
  &__title { font-size: 2rem; color: #fff; margin: $spacing-3 0 $spacing-2; }
  &__subtitle { color: rgba(#fff, 0.7); font-size: 1rem; margin: 0; }
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  font-size: 0.875rem;
  color: rgba(#fff, 0.6);
  margin-bottom: $spacing-4;
  a { color: rgba(#fff, 0.7); text-decoration: none; &:hover { color: #fff; } }
  &__separator { color: rgba(#fff, 0.4); }
  &__current { color: rgba(#fff, 0.5); }
}

.subs-page__wrapper {
  max-width: 860px;
  margin: 0 auto;
  padding: $spacing-8 $spacing-4;
}

.loading-state, .empty-state {
  text-align: center;
  padding: $spacing-16 $spacing-4;
  color: $color-gray-600;
  .spinner {
    width: 40px; height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto $spacing-4;
  }
}

.empty-state {
  &__icon { font-size: 3rem; margin-bottom: $spacing-4; }
  h2 { font-size: 1.5rem; color: $color-dark; margin-bottom: $spacing-2; }
  p { color: $color-gray-600; margin-bottom: $spacing-6; }
}

.btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.6rem 1.4rem; border-radius: 8px; font-size: 0.875rem;
  font-weight: 500; cursor: pointer; text-decoration: none; border: 1px solid transparent;
  &--primary { background: $color-primary; color: #fff; border-color: $color-primary; }
  &--danger-outline { background: transparent; color: #dc2626; border-color: #dc2626; &:hover { background: #fee2e2; } }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.stats-strip {
  display: flex;
  gap: $spacing-4;
  background: #fff;
  border-radius: 12px;
  padding: $spacing-4 $spacing-6;
  margin-bottom: $spacing-6;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);

  &__item { flex: 1; text-align: center; }
  &__value { display: block; font-size: 1.5rem; font-weight: 700; color: $color-dark; }
  &__label { font-size: 0.75rem; color: $color-gray-500; text-transform: uppercase; letter-spacing: 0.05em; }
}

.sub-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  margin-bottom: $spacing-4;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);

  &--cancelled { opacity: 0.75; border-color: #f3f4f6; }
  &--payment_failed { border-color: #fca5a5; }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: $spacing-4 $spacing-5;
    border-bottom: 1px solid #f3f4f6;
    background: #fafafa;
  }

  &__product {
    h3 { font-size: 1.1rem; font-weight: 700; color: $color-dark; margin: 0 0 0.2rem; }
  }
  &__weight { font-size: 0.8rem; color: $color-gray-500; }

  &__body { padding: $spacing-4 $spacing-5; }

  &__actions {
    padding: $spacing-3 $spacing-5 $spacing-4;
    border-top: 1px solid #f3f4f6;
  }
}

.sub-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: $spacing-3;
  margin-bottom: $spacing-4;
}

.sub-detail {
  &__label { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: $color-gray-500; margin-bottom: 0.2rem; }
  &__value { font-size: 0.9rem; font-weight: 600; color: $color-dark; }
}

.interval-chip {
  background: #ede9fe; color: #5b21b6;
  padding: 0.2rem 0.6rem; border-radius: 100px;
  font-size: 0.8rem !important;
}

.saving-tag {
  background: #dcfce7; color: #166534;
  padding: 0.15rem 0.4rem; border-radius: 4px;
  font-size: 0.7rem; font-weight: 600; margin-left: 0.3rem;
}

.text-overdue { color: #dc2626 !important; }
.overdue-chip {
  background: #fee2e2; color: #991b1b;
  padding: 0.1rem 0.4rem; border-radius: 4px;
  font-size: 0.7rem; margin-left: 0.3rem;
}

.status-badge {
  padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.75rem; font-weight: 600;
  &--active { background: #dcfce7; color: #166534; }
  &--cancelled { background: #f3f4f6; color: #6b7280; }
  &--paused { background: #fef3c7; color: #92400e; }
  &--payment_failed { background: #fee2e2; color: #991b1b; }
}

.order-history {
  margin-top: $spacing-3;
  h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: $color-gray-500; margin-bottom: $spacing-2; }

  &__list { display: flex; flex-direction: column; gap: 0.4rem; }
  &__row {
    display: flex; align-items: center; gap: $spacing-3;
    font-size: 0.85rem;
    padding: 0.35rem 0.6rem;
    background: #f9fafb; border-radius: 6px;
  }
  &__badge {
    font-size: 0.7rem; color: $color-gray-500;
    white-space: nowrap;
  }
  &__num { font-weight: 600; color: $color-dark; flex: 1; }
  &__link { color: $color-primary; text-decoration: none; font-size: 0.8rem; &:hover { text-decoration: underline; } }
}

.billing-error {
  margin-top: $spacing-3;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: #92400e;
}

.cancelled-note {
  font-size: 0.85rem;
  color: $color-gray-500;
  a { color: $color-primary; text-decoration: none; &:hover { text-decoration: underline; } }
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
