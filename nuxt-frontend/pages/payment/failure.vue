<template>
  <div class="payment-result">
    <div class="payment-result__container">
      <div class="payment-result__icon payment-result__icon--failure">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>

      <h1 class="payment-result__title">Payment Failed</h1>
      <p class="payment-result__message">
        We were unable to process your payment. Please check your payment details and try again.
      </p>

      <div v-if="orderId" class="payment-result__details">
        <div class="payment-result__detail">
          <span class="label">Order ID:</span>
          <span class="value">{{ orderId }}</span>
        </div>
        <div v-if="transactionReference" class="payment-result__detail">
          <span class="label">Transaction Reference:</span>
          <span class="value">{{ transactionReference }}</span>
        </div>
      </div>

      <div class="payment-result__info">
        <h3>Common Reasons for Payment Failure:</h3>
        <ul>
          <li>❌ Insufficient funds</li>
          <li>❌ Incorrect card details (number, expiry, CVV)</li>
          <li>❌ Card expired</li>
          <li>❌ Card not activated for online payments</li>
          <li>❌ Bank declined the transaction</li>
          <li>❌ Transaction limit exceeded</li>
        </ul>
      </div>

      <div class="payment-result__actions">
        <NuxtLink :to="`/checkout?orderId=${orderId}`" class="btn btn--primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          Try Again
        </NuxtLink>
        <NuxtLink to="/contact" class="btn btn--secondary">
          Contact Support
        </NuxtLink>
      </div>

      <div class="payment-result__help">
        <p>
          <strong>Need help?</strong> If you continue to experience issues, please contact our support team.
          We're here to help you complete your order.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

// Extract query parameters
const orderId = computed(() => route.query.orderId as string);
const transactionReference = computed(() => route.query.ref as string);

// Log all query parameters for debugging
onMounted(() => {
  console.log('=== Payment Failure Debug Info ===');
  console.log('All query parameters:', route.query);
  console.log('Order ID:', orderId.value);
  console.log('Transaction Reference:', transactionReference.value);
  console.log('=================================');
});

// SEO
useHead({
  title: 'Payment Failed - Carafe Coffee',
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
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);

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

    &--failure {
      background: #ef4444;
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
      font-size: $font-size-sm;
    }
  }

  &__info {
    background: #fef2f2;
    border: 1px solid #ef4444;
    border-radius: 8px;
    padding: $spacing-5;
    margin-bottom: $spacing-6;
    text-align: left;

    h3 {
      font-size: $font-size-base;
      color: #991b1b;
      margin-bottom: $spacing-3;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin: $spacing-2 0;
        color: #7f1d1d;
        font-size: $font-size-sm;
      }
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-4;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: $spacing-6;
  }

  &__help {
    background: $color-gray-50;
    border-radius: 8px;
    padding: $spacing-5;

    p {
      margin: 0;
      color: $color-gray-700;
      font-size: $font-size-sm;

      strong {
        color: $color-dark;
      }
    }
  }
}

.btn {
  padding: $spacing-3 $spacing-6;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  transition: all 0.2s;

  svg {
    flex-shrink: 0;
  }

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
