<template>
  <div class="order-confirmation">
    <div class="container">
      <div class="order-confirmation__card">
        <div class="order-confirmation__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M8 12L11 15L16 9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h1>Thank You for Your Order!</h1>

        <p class="order-confirmation__message">
          Your order has been successfully placed. We've sent a confirmation
          email to your inbox.
        </p>

        <div v-if="orderNumber" class="order-confirmation__details">
          <div class="order-confirmation__detail">
            <span class="label">Order Number</span>
            <span class="value">{{ orderNumber }}</span>
          </div>
          <div v-if="orderDate" class="order-confirmation__detail">
            <span class="label">Date</span>
            <span class="value">{{ formatDate(orderDate) }}</span>
          </div>
        </div>

        <div class="order-confirmation__next">
          <h2>What happens next?</h2>
          <ol>
            <li>We'll prepare your freshly roasted coffee</li>
            <li>You'll receive a shipping confirmation email with tracking</li>
            <li>Your coffee will arrive within the estimated delivery time</li>
          </ol>
        </div>

        <div class="order-confirmation__actions">
          <NuxtLink to="/shop" class="btn btn--primary">
            Continue Shopping
          </NuxtLink>
          <NuxtLink to="/account/orders" class="btn btn--outline">
            View Order Details
          </NuxtLink>
        </div>

        <p class="order-confirmation__support">
          Questions about your order?
          <NuxtLink to="/contact">Contact us</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/cart";

// SEO
useHead({
  title: "Order Confirmed | Carafe Coffee",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const route = useRoute();
const cartStore = useCartStore();

const orderNumber = computed(() => route.query.orderCode as string);
const orderDate = computed(() => new Date());

// Clear cart after successful order
onMounted(() => {
  if (route.query.orderCode) {
    cartStore.clearCart();
  }
});

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";
@import "~/assets/scss/mixins";

.order-confirmation {
  padding: $spacing-16 0;
  min-height: 100vh;
  background: $color-gray-50;
  display: flex;
  align-items: center;

  &__card {
    max-width: 600px;
    margin: 0 auto;
    background: $color-white;
    border-radius: $border-radius-lg;
    padding: $spacing-12;
    text-align: center;
    box-shadow: $shadow-lg;
  }

  &__icon {
    color: $color-success;
    margin-bottom: $spacing-6;

    svg {
      width: 80px;
      height: 80px;
    }
  }

  h1 {
    font-family: $font-family-heading;
    font-size: $font-size-3xl;
    color: $color-dark;
    margin-bottom: $spacing-4;
  }

  &__message {
    color: $color-gray-600;
    font-size: $font-size-lg;
    margin-bottom: $spacing-8;
  }

  &__details {
    display: flex;
    justify-content: center;
    gap: $spacing-8;
    padding: $spacing-6;
    background: $color-gray-50;
    border-radius: $border-radius-md;
    margin-bottom: $spacing-8;
  }

  &__detail {
    text-align: center;

    .label {
      display: block;
      font-size: $font-size-sm;
      color: $color-gray-500;
      margin-bottom: $spacing-1;
    }

    .value {
      font-weight: 600;
      color: $color-dark;
    }
  }

  &__next {
    text-align: left;
    padding: $spacing-6;
    background: rgba($color-primary, 0.05);
    border-radius: $border-radius-md;
    margin-bottom: $spacing-8;

    h2 {
      font-size: $font-size-base;
      color: $color-dark;
      margin-bottom: $spacing-4;
    }

    ol {
      margin: 0;
      padding-left: $spacing-6;
      color: $color-gray-600;

      li {
        padding: $spacing-2 0;
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

  &__support {
    font-size: $font-size-sm;
    color: $color-gray-500;

    a {
      color: $color-primary;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
