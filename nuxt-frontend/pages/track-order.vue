<template>
  <div class="track-order-page">

    <section class="page-hero">
      <div class="page-hero__content">
        <h1 class="page-hero__title">Track Your Order</h1>
        <p class="page-hero__subtitle">Enter your order number and email to see the latest status</p>
      </div>
    </section>

    <div class="container">

      <section v-if="!order" class="track-section">
        <div class="track-card">
          <div class="track-card__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="1" y="3" width="15" height="13" rx="1"/>
              <path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <h2>Order Lookup</h2>
          <p>Track any Carafe Coffee order — no account required</p>

          <!-- Mode tabs -->
          <div class="track-tabs">
            <button :class="['track-tab', { active: trackMode === 'order' }]" @click="trackMode = 'order'; trackingError = ''">
              📋 Order Number
            </button>
            <button :class="['track-tab', { active: trackMode === 'tracking' }]" @click="trackMode = 'tracking'; trackingError = ''">
              🚚 Tracking Number
            </button>
          </div>

          <form class="track-form" @submit.prevent="doTrack">
            <!-- Order number mode -->
            <template v-if="trackMode === 'order'">
              <div class="form-group">
                <label class="form-label" for="orderNum">Order Number</label>
                <input
                  id="orderNum"
                  v-model="orderNumber"
                  type="text"
                  class="form-input"
                  placeholder="e.g. ORD-1771661478431-F5C672"
                  :required="trackMode === 'order'"
                />
                <span class="form-hint">Found in your order confirmation email</span>
              </div>
              <div class="form-group">
                <label class="form-label" for="emailInput">Email Address</label>
                <input
                  id="emailInput"
                  v-model="email"
                  type="email"
                  class="form-input"
                  placeholder="The email used at checkout"
                  :required="trackMode === 'order'"
                />
              </div>
            </template>

            <!-- Tracking number mode -->
            <template v-else>
              <div class="form-group">
                <label class="form-label" for="trackingInput">Carrier Tracking Number</label>
                <input
                  id="trackingInput"
                  v-model="trackingNumber"
                  type="text"
                  class="form-input"
                  placeholder="e.g. JD000012345678"
                  :required="trackMode === 'tracking'"
                />
                <span class="form-hint">Found in your dispatch confirmation email</span>
              </div>
            </template>

            <div v-if="trackingError" class="form-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ trackingError }}
            </div>

            <button type="submit" class="btn btn--track" :disabled="loading">
              <span v-if="loading" class="btn-spinner"></span>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {{ loading ? 'Searching...' : 'Track Order' }}
            </button>
          </form>

          <div class="track-help">
            <p>Have an account? <NuxtLink to="/account/orders">View all your orders &rarr;</NuxtLink></p>
          </div>
        </div>
      </section>

      <section v-else class="result-section">
        <div class="result-card">

          <div class="result-card__header">
            <div class="result-header-info">
              <span class="order-label">Order</span>
              <h2 class="order-number">{{ order.orderNumber }}</h2>
              <span class="order-date">Placed on {{ formatDate(order.createdAt) }}</span>
            </div>
            <div :class="`order-badge order-badge--${statusMeta.color}`">
              {{ statusMeta.icon }} {{ statusMeta.label }}
            </div>
          </div>

          <div v-if="!isOffPathStatus" class="progress-tracker">
            <OrderStatusStepper :status="order.orderStatus || order.status || ''" />
          </div>

          <div v-else class="status-banner" :class="`status-banner--${statusMeta.color}`">
            {{ statusMeta.icon }} This order has been {{ statusMeta.label.toLowerCase() }}
          </div>

          <div class="result-body">
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
                <div v-if="order.shippingAddress && order.shippingAddress.city" class="info-row">
                  <span class="info-row__label">Delivering to</span>
                  <span class="info-row__value">{{ order.shippingAddress.city }}{{ order.shippingAddress.postcode ? ', ' + order.shippingAddress.postcode : '' }}</span>
                </div>
                <div v-if="order.dispatchedAt" class="info-row">
                  <span class="info-row__label">Dispatched</span>
                  <span class="info-row__value">{{ formatDate(order.dispatchedAt) }}</span>
                </div>
                <div v-if="order.deliveredAt" class="info-row">
                  <span class="info-row__label">Delivered</span>
                  <span class="info-row__value info-row__value--success">{{ formatDate(order.deliveredAt) }}</span>
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
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                </div>
              </div>
              <div class="order-total">
                <span>Total</span>
                <span class="total-amount">{{ formatPrice(order.total, order.currency) }}</span>
              </div>
            </div>
          </div>

          <div class="result-card__footer">
            <button @click="resetSearch" class="btn btn--secondary">
              Track another order
            </button>
            <NuxtLink to="/shop-coffee" class="btn btn--primary">
              Shop Again
            </NuxtLink>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useOrderTracking } from '~/composables/useOrderTracking';

useHead({
  title: 'Track Your Order | Carafe Coffee',
  meta: [{ name: 'description', content: 'Track your Carafe Coffee order status.' }]
});

const route = useRoute();
const { order, loading, error: trackError, trackOrder, formatDate } = useOrderTracking();

const orderNumber    = ref('');
const email          = ref('');
const trackingNumber = ref('');
const trackMode      = ref<'order' | 'tracking'>('order');
const trackingError  = ref('');

onMounted(() => {
  const q = route.query;
  if (q.orderNumber) orderNumber.value = String(q.orderNumber);
  if (q.email) email.value = String(q.email);
  // Auto-submit if both fields are pre-filled (e.g. redirected from success page)
  if ((q.token && orderNumber.value) || (q.orderNumber && q.email)) doTrack();
});

const statusMeta = computed(() => {
  const map: Record<string, { label: string; color: string; icon: string }> = {
    order_received: { label: 'Order Received', color: 'blue',   icon: '⏳' },
    packed:         { label: 'Packed',         color: 'purple', icon: '📦' },
    shipped:        { label: 'Shipped',        color: 'indigo', icon: '🚚' },
    in_transit:     { label: 'In Transit',     color: 'indigo', icon: '🚚' },
    delivered:      { label: 'Delivered',      color: 'green',  icon: '✅' },
    cancelled:      { label: 'Cancelled',      color: 'red',    icon: '❌' },
    refunded:       { label: 'Refunded',       color: 'orange', icon: '💰' },
  };
  return map[(order.value?.orderStatus ?? order.value?.status) ?? ''] ?? map.order_received;
});

const isOffPathStatus = computed(() => {
  const s = order.value?.orderStatus ?? order.value?.status ?? '';
  return s === 'cancelled' || s === 'refunded';
});

const doTrack = async () => {
  trackingError.value = '';
  let result;
  if (trackMode.value === 'tracking') {
    result = await trackOrder(undefined, undefined, undefined, trackingNumber.value.trim());
  } else {
    result = await trackOrder(orderNumber.value.trim(), undefined, email.value.trim());
  }
  if (!result) {
    trackingError.value = (trackError.value as string) || 'Order not found. Please check your details and try again.';
  }
};

const resetSearch = () => {
  order.value = null;
  orderNumber.value = '';
  email.value = '';
  trackingNumber.value = '';
  trackingError.value = '';
};

const formatPrice = (amount: number, currency = 'EUR') => {
  const sym = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
  return `${sym}${parseFloat(String(amount)).toFixed(2)}`;
};
</script>

<style lang="scss" scoped>
.page-hero {
  background: linear-gradient(135deg, $color-primary 0%, darken($color-primary, 12%) 100%);
  color: white;
  padding: 5rem 2rem 4rem;
  text-align: center;

  &__title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    margin: 0 0 0.75rem;
  }

  &__subtitle {
    font-size: 1.1rem;
    opacity: 0.85;
    margin: 0;
  }
}

.container {
  max-width: 760px;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
}

.track-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
  background: #f3f4f6;
  border-radius: 0.75rem;
  padding: 0.3rem;
}

.track-tab {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 0.55rem;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;

  &.active {
    background: white;
    color: $color-primary;
    box-shadow: 0 1px 3px rgba(0,0,0,.1);
  }
}

.track-card {
  background: white;
  border-radius: 1.5rem;
  padding: 3rem 2.5rem;
  box-shadow: 0 4px 32px rgba(0,0,0,.08);
  text-align: center;

  &__icon {
    width: 80px;
    height: 80px;
    background: rgba($color-primary, .08);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: $color-primary;
  }

  h2 { font-size: 1.6rem; margin: 0 0 0.35rem; color: $color-text; }
  > p { color: $color-text-light; margin: 0 0 2rem; font-size: 0.95rem; }
}

.track-form {
  text-align: left;

  .form-group { margin-bottom: 1.5rem; }

  .form-label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.45rem;
    color: $color-text;
    font-size: 0.875rem;
  }

  .form-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1.5px solid #e0e0e0;
    border-radius: 0.75rem;
    font-size: 1rem;
    background: #fafafa;
    box-sizing: border-box;
    transition: border-color .2s, box-shadow .2s;

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, .1);
      background: white;
    }
  }

  .form-hint {
    font-size: 0.78rem;
    color: $color-text-light;
    display: block;
    margin-top: 0.3rem;
  }

  .form-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.75rem;
    color: #dc2626;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
}

.btn--track {
  width: 100%;
  padding: 1rem;
  background: $color-primary;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background .2s, transform .1s;

  &:hover:not(:disabled) { background: darken($color-primary, 8%); transform: translateY(-1px); }
  &:disabled { opacity: .65; cursor: not-allowed; }
}

.btn-spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.track-help {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: $color-text-light;

  a {
    color: $color-primary;
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}

.result-card {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 32px rgba(0,0,0,.08);
  overflow: hidden;

  &__header {
    padding: 2rem 2.5rem;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
}

.result-header-info { display: flex; flex-direction: column; gap: .2rem; }

.order-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: $color-text-light;
  font-weight: 600;
}

.order-number { font-size: 1.2rem; font-weight: 700; margin: 0; color: $color-text; font-family: monospace; }
.order-date   { font-size: 0.83rem; color: $color-text-light; }

.order-badge {
  padding: .45rem .9rem;
  border-radius: 2rem;
  font-size: .83rem;
  font-weight: 600;
  white-space: nowrap;
  align-self: flex-start;

  &--green  { background: #dcfce7; color: #166534; }
  &--blue   { background: #dbeafe; color: #1e40af; }
  &--purple { background: #ede9fe; color: #6b21a8; }
  &--indigo { background: #e0e7ff; color: #3730a3; }
  &--red    { background: #fee2e2; color: #991b1b; }
  &--orange { background: #ffedd5; color: #9a3412; }
}

.progress-tracker {
  padding: 2rem 2.5rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;

  @media (max-width: 480px) {
    padding: 1.5rem 1rem 1.25rem;
  }
}

.status-banner {
  padding: 1rem 2.5rem;
  text-align: center;
  font-weight: 600;
  font-size: .95rem;
  border-bottom: 1px solid #f0f0f0;

  &--red    { background: #fef2f2; color: #991b1b; }
  &--orange { background: #fff7ed; color: #9a3412; }
}

.result-body {
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 580px) { grid-template-columns: 1fr; }
}

.info-block {
  padding: 2rem 2.5rem;

  &:first-child {
    border-right: 1px solid #f0f0f0;
    @media (max-width: 580px) { border-right: none; border-bottom: 1px solid #f0f0f0; }
  }

  &__title {
    font-size: .75rem;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: $color-text-light;
    font-weight: 600;
    margin: 0 0 1.25rem;
    display: flex;
    align-items: center;
    gap: .4rem;
  }
}

.info-rows { display: flex; flex-direction: column; gap: .85rem; }

.info-row {
  display: flex;
  flex-direction: column;
  gap: .1rem;

  &__label { font-size: .7rem; color: $color-text-light; text-transform: uppercase; letter-spacing: .05em; }
  &__value {
    font-size: .9rem; color: $color-text; font-weight: 500;
    &--success { color: #166534; font-weight: 600; }
  }
}

.tracking-code {
  font-family: monospace;
  background: #f3f4f6;
  padding: .15rem .5rem;
  border-radius: .3rem;
  font-size: .82rem;
}

.items-list { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1.25rem; }

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .45rem 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: .88rem;

  &:last-child { border-bottom: none; }
}

.item-name { color: $color-text; font-weight: 500; }
.item-qty  { color: $color-text-light; }

.order-total {
  display: flex;
  justify-content: space-between;
  padding: .75rem 0 0;
  border-top: 2px solid #f0f0f0;
  font-weight: 600;
  font-size: .95rem;
}

.total-amount { color: $color-primary; font-size: 1.1rem; }

.result-card__footer {
  padding: 1.5rem 2.5rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column;
    .btn { text-align: center; }
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  padding: .75rem 1.5rem;
  border-radius: .75rem;
  font-size: .9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all .2s;
  border: none;

  &--primary {
    background: $color-primary;
    color: white;
    &:hover { background: darken($color-primary, 8%); }
  }

  &--secondary {
    background: transparent;
    color: $color-primary;
    border: 1.5px solid $color-primary;
    &:hover { background: rgba($color-primary, .06); }
  }
}
</style>
