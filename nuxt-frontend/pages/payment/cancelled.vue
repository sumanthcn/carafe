<template>
  <div class="payment-result">
    <div class="payment-result__container">
      <div class="payment-result__icon payment-result__icon--cancelled">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </div>

      <h1 class="payment-result__title">Payment Cancelled</h1>
      <p class="payment-result__message">
        You cancelled the payment process. No charges have been made to your account.
      </p>

      <div v-if="orderId" class="payment-result__details">
        <div class="payment-result__detail">
          <span class="label">Order ID:</span>
          <span class="value">{{ orderId }}</span>
        </div>
      </div>

      <div class="payment-result__info">
        <p>Your order has been saved. You can complete the payment at any time.</p>
      </div>

      <div class="payment-result__actions">
        <NuxtLink to="/checkout" class="btn btn--primary">
          Complete Payment
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

// Extract query parameters
const orderId = computed(() => route.query.orderId as string);

// SEO
useHead({
  title: 'Payment Cancelled - Carafe Coffee',
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
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);

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

    &--cancelled {
      background: #f59e0b;
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
    background: #fffbeb;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: $spacing-5;
    margin-bottom: $spacing-6;

    p {
      margin: 0;
      color: #92400e;
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
