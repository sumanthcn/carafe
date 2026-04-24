<template>
  <div class="payment-result">
    <div class="payment-result__container">
      <div class="payment-result__icon payment-result__icon--success">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h1 class="payment-result__title">Payment Successful!</h1>
      <p class="payment-result__message">
        Thank you for your order. Your payment has been processed successfully.
      </p>

      <div v-if="orderDetails" class="payment-result__details">
        <div class="payment-result__detail">
          <span class="label">Order Number:</span>
          <span class="value">{{ orderDetails.orderNumber }}</span>
        </div>
        <div class="payment-result__detail">
          <span class="label">Amount Paid:</span>
          <span class="value">£{{ formatAmount(orderDetails.total) }}</span>
        </div>
        <div class="payment-result__detail">
          <span class="label">Email:</span>
          <span class="value">{{ orderDetails.customerEmail }}</span>
        </div>
      </div>

      <div class="payment-result__info">
        <p>✅ A confirmation email has been sent to your email address.</p>
        <p>✅ Use your order number to track your order at any time.</p>
      </div>

      <!-- Order number copy box -->
      <div v-if="orderDetails" class="payment-result__order-box">
        <p class="order-box__label">Your Order Number</p>
        <div class="order-box__row">
          <span class="order-box__number">{{ orderDetails.orderNumber }}</span>
          <button class="order-box__copy" @click="copyOrderNumber">
            <svg v-if="!copied" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>

      <div class="payment-result__actions">
        <!-- Guest users → track-order page pre-filled; logged-in → account/orders -->
        <NuxtLink
          v-if="isAuthenticated"
          to="/account/orders"
          class="btn btn--primary"
        >
          View My Orders
        </NuxtLink>
        <NuxtLink
          v-else
          :to="trackOrderUrl"
          class="btn btn--primary"
        >
          Track Your Order
        </NuxtLink>
        <NuxtLink to="/shop-coffee" class="btn btn--secondary">
          Continue Shopping
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const route = useRoute();
const config = useRuntimeConfig();
const { isAuthenticated } = useAuth();
const cartStore = useCartStore();

// Stripe redirects to: /payment/success?session_id=cs_xxx&order_id=123
const sessionId = computed(() => route.query.session_id as string);
const orderId = computed(() => route.query.order_id as string);

const orderDetails = ref<any>(null);
const loading = ref(true);
const copied = ref(false);

// Build the track-order URL pre-filled with order number + email
const trackOrderUrl = computed(() => {
  if (!orderDetails.value) return '/track-order';
  const params = new URLSearchParams({
    orderNumber: orderDetails.value.orderNumber || '',
    email: orderDetails.value.customerEmail || '',
  });
  return `/track-order?${params.toString()}`;
});

onMounted(async () => {
  // Clear the cart now that payment is confirmed
  cartStore.clearCart();

  if (!sessionId.value) {
    loading.value = false;
    return;
  }

  try {
    // Use the public confirmation endpoint (validated by Stripe session_id, no auth needed)
    const response = await $fetch<any>(
      `${config.public.strapiUrl}/api/stripe/order-confirmation`,
      { query: { session_id: sessionId.value } }
    );

    if (response?.data) {
      const d = response.data;
      orderDetails.value = {
        orderNumber: d.orderNumber,
        total: d.total,
        status: d.orderStatus || d.status,
        customerEmail: d.customerEmail,
        customerName: d.customerName,
      };
    }
  } catch (err) {
    console.error('Failed to fetch order confirmation:', err);
  } finally {
    loading.value = false;
  }
});

const formatAmount = (amount: number) => (amount ? amount.toFixed(2) : '0.00');

const copyOrderNumber = async () => {
  if (!orderDetails.value?.orderNumber) return;
  try {
    await navigator.clipboard.writeText(orderDetails.value.orderNumber);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = orderDetails.value.orderNumber;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  }
};

useHead({
  title: 'Payment Successful - Carafe Coffee',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";
@import "~/assets/scss/mixins";

.payment-result {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-8 $spacing-4;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  &__container {
    background: white;
    border-radius: 16px;
    padding: $spacing-10 $spacing-8;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
    margin-top: 80px;
  }

  &__icon {
    width: 80px;
    height: 80px;
    margin: 0 auto $spacing-6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 50px;
      height: 50px;
    }

    &--success {
      background: #10b981;
      color: white;
    }
  }

  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-3xl;
    color: $color-dark;
    margin-bottom: $spacing-4;
  }

  &__message {
    font-size: $font-size-lg;
    color: $color-gray-600;
    margin-bottom: $spacing-8;
  }

  &__details {
    background: $color-gray-50;
    border-radius: 8px;
    padding: $spacing-6;
    margin-bottom: $spacing-6;
    text-align: left;
  }

  &__detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-3 0;
    border-bottom: 1px solid $color-gray-200;

    &:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 600;
      color: $color-gray-700;
    }

    .value {
      font-family: 'Courier New', monospace;
      color: $color-dark;
      font-weight: 600;
    }
  }

  &__info {
    background: #ecfdf5;
    border: 1px solid #10b981;
    border-radius: 8px;
    padding: $spacing-5;
    margin-bottom: $spacing-6;

    p {
      margin: $spacing-2 0;
      color: #065f46;
      font-size: $font-size-sm;
    }
  }

  &__order-box {
    background: #f0fdf4;
    border: 2px dashed #10b981;
    border-radius: 8px;
    padding: $spacing-4 $spacing-5;
    margin-bottom: $spacing-6;
    text-align: left;

    .order-box__label {
      font-size: $font-size-sm;
      color: $color-gray-600;
      margin-bottom: $spacing-2;
      font-weight: 500;
    }

    .order-box__row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: $spacing-3;
    }

    .order-box__number {
      font-family: 'Courier New', monospace;
      font-size: $font-size-lg;
      font-weight: 700;
      color: $color-dark;
      letter-spacing: 0.05em;
    }

    .order-box__copy {
      display: inline-flex;
      align-items: center;
      gap: $spacing-1;
      padding: $spacing-1 $spacing-3;
      border: 1px solid #10b981;
      border-radius: 6px;
      background: white;
      color: #10b981;
      font-size: $font-size-sm;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;

      &:hover {
        background: #10b981;
        color: white;
      }
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-4;
    justify-content: center;
    flex-wrap: wrap;
  }
}

.btn {
  padding: $spacing-3 $spacing-6;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s;

  &--primary {
    background: $color-primary;
    color: white;

    &:hover {
      background: darken($color-primary, 10%);
      transform: translateY(-2px);
    }
  }

  &--secondary {
    background: white;
    color: $color-primary;
    border: 2px solid $color-primary;

    &:hover {
      background: $color-primary;
      color: white;
      transform: translateY(-2px);
    }
  }
}

@media (max-width: 768px) {
  .payment-result {
    &__container {
      padding: $spacing-8 $spacing-6;
      margin-top: 80px;
    }

    &__title {
      font-size: $font-size-2xl;
    }

    &__actions {
      flex-direction: column;

      .btn {
        width: 100%;
      }
    }
  }
}
</style>
