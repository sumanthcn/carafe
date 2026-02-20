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
          <span class="label">Transaction Reference:</span>
          <span class="value">{{ transactionReference }}</span>
        </div>
        <div class="payment-result__detail">
          <span class="label">Amount:</span>
          <span class="value">£{{ formatAmount(orderDetails.total) }}</span>
        </div>
      </div>

      <div class="payment-result__info">
        <p>✅ A confirmation email has been sent to your email address.</p>
        <p>✅ You can track your order status in your account.</p>
      </div>

      <div class="payment-result__actions">
        <NuxtLink to="/account/orders" class="btn btn--primary">
          View Order Details
        </NuxtLink>
        <NuxtLink to="/shop" class="btn btn--secondary">
          Continue Shopping
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

// Extract query parameters
const orderId = computed(() => route.query.orderId as string);
const transactionReference = computed(() => route.query.ref as string);

// Order details
const orderDetails = ref<any>(null);
const loading = ref(true);
const error = ref('');

// Fetch order details
onMounted(async () => {
  if (!orderId.value) {
    error.value = 'No order ID provided';
    loading.value = false;
    return;
  }

  try {
    // Fetch order details from Strapi
    const response = await $fetch<any>(`${config.public.strapiUrl}/api/orders/${orderId.value}`, {
      headers: {
        Authorization: `Bearer ${config.public.strapiApiToken}`,
      },
    });

    if (response?.data) {
      orderDetails.value = {
        id: response.data.id,
        orderNumber: response.data.attributes?.orderNumber || response.data.orderNumber,
        total: response.data.attributes?.total || response.data.total,
        status: response.data.attributes?.status || response.data.status,
      };
    }
  } catch (err: any) {
    console.error('Failed to fetch order details:', err);
    // Don't show error to user - success page should still display
  } finally {
    loading.value = false;
  }
});

// Format amount
const formatAmount = (amount: number) => {
  return amount ? amount.toFixed(2) : '0.00';
};

// SEO
useHead({
  title: 'Payment Successful - Carafe Coffee',
  meta: [
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
