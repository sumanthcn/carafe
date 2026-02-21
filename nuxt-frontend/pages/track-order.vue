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

          <form class="track-form" @submit.prevent="doTrack">
            <div class="form-group">
              <label class="form-label" for="orderNum">Order Number</label>
              <input
                id="orderNum"
                v-model="orderNumber"
                type="text"
                class="form-input"
                placeholder="e.g. ORD-1771661478431-F5C672"
                required
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
                required
              />
            </div>

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

          <div v-if="progressSteps.length" class="progress-tracker">
            <div
              v-for="(step, index) in progressSteps"
              :key="step.key"
              :class="['progress-step', { 'is-done': step.done, 'is-active': step.active }]"
            >
              <div class="progress-step__dot">
                <svg v-if="step.done" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span v-else-if="step.active" class="active-pulse"></span>
              </div>
              <div v-if="index < progressSteps.length - 1" :class="['progress-step__line', { 'is-done': step.done }]"></div>
              <span class="progress-step__label">{{ step.label }}</span>
            </div>
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

const orderNumber   = ref('');
const email         = ref('');
const trackingError = ref('');

onMounted(() => {
  const q = route.query;
  if (q.orderNumber) orderNumber.value = String(q.orderNumber);
  if (q.email) email.value = String(q.email);
  if (q.token && orderNumber.value) doTrack();
});

const statusMeta = computed(() => {
  const map: Record<string, { label: string; color: string; icon: string; step: number }> = {
    order_received: { label: 'Order Received', color: 'blue',   icon: '⏳', step: 0 },
    packed:         { label: 'Packed',         color: 'purple', icon: '📦', step: 1 },
    shipped:        { label: 'Shipped',         color: 'indigo', icon: '🚚', step: 2 },
    in_transit:     { label: 'In Transit',      color: 'indigo', icon: '🚚', step: 2 },
    delivered:      { label: 'Delivered',       color: 'green',  icon: '✅', step: 3 },
    cancelled:      { label: 'Cancelled',       color: 'red',    icon: '❌', step: -1 },
    refunded:       { label: 'Refunded',        color: 'orange', icon: '💰', step: -1 },
  };
  return map[order.value?.status ?? ''] ?? map.order_received;
});

const progressSteps = computed(() => {
  const step = statusMeta.value.step;
  if (step === -1) return [];
  return [
    { key: 'received',  label: 'Received',  done: step > 0,  active: step === 0 },
    { key: 'packed',    label: 'Packed',    done: step > 1,  active: step === 1 },
    { key: 'shipped',   label: 'Shipped',   done: step > 2,  active: step === 2 },
    { key: 'delivered', label: 'Delivered', done: step >= 3, active: step === 3 },
  ];
});

const doTrack = async () => {
  trackingError.value = '';
  const result = await trackOrder(orderNumber.value.trim(), undefined, email.value.trim());
  if (!result) {
    trackingError.value = (trackError.value as string) || 'Order not found. Please check your details and try again.';
  }
};

const resetSearch = () => {
  order.value = null;
  orderNumber.value = '';
  email.value = '';
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
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 2.5rem 1.5rem;
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
    margin-top: .45rem;
    text-align: center;
    white-space: nowrap;
  }

  &.is-done {
    .progress-step__dot { background: $color-primary; border-color: $color-primary; color: white; }
    .progress-step__label { color: $color-primary; font-weight: 600; }
  }

  &.is-active {
    .progress-step__dot { border-color: $color-primary; background: rgba($color-primary, .08); }
    .progress-step__label { color: $color-primary; font-weight: 700; }
  }
}

.active-pulse {
  width: 10px;
  height: 10px;
  background: $color-primary;
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: .55; }
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
