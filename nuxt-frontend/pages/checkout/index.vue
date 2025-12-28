<template>
  <div class="checkout-page">
    <div class="container">
      <div class="checkout-page__header">
        <NuxtLink to="/shop-coffee" class="checkout-page__back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12L12 19M5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Continue Shopping
        </NuxtLink>
        <h1>Checkout</h1>
      </div>

      <div v-if="cartStore.isEmpty" class="checkout-page__empty">
        <p>Your cart is empty</p>
        <NuxtLink to="/shop-coffee" class="btn btn--primary">
          Start Shopping
        </NuxtLink>
      </div>

      <div v-else class="checkout-page__content">
        <div class="checkout-page__form">
          <!-- Contact Information -->
          <section class="checkout-section">
            <h2>Contact Information</h2>
            <div class="form-grid">
              <div class="form-group form-group--full">
                <label for="email">Email *</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div class="form-group">
                <label for="phone">Phone</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  placeholder="+44 20 1234 5678"
                />
              </div>
            </div>
          </section>

          <!-- Shipping Address -->
          <section class="checkout-section">
            <h2>Shipping Address</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="firstName">First Name *</label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                />
              </div>
              <div class="form-group">
                <label for="lastName">Last Name *</label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                />
              </div>
              <div class="form-group form-group--full">
                <label for="address1">Address Line 1 *</label>
                <input
                  id="address1"
                  v-model="form.address1"
                  type="text"
                  required
                  placeholder="Street address"
                />
              </div>
              <div class="form-group form-group--full">
                <label for="address2">Address Line 2</label>
                <input
                  id="address2"
                  v-model="form.address2"
                  type="text"
                  placeholder="Apartment, suite, etc."
                />
              </div>
              <div class="form-group">
                <label for="city">City *</label>
                <input id="city" v-model="form.city" type="text" required />
              </div>
              <div class="form-group">
                <label for="postcode">Postcode *</label>
                <input
                  id="postcode"
                  v-model="form.postcode"
                  type="text"
                  required
                />
              </div>
              <div class="form-group form-group--full">
                <label for="country">Country *</label>
                <select id="country" v-model="form.country" required>
                  <option value="GB">United Kingdom</option>
                  <option value="IE">Ireland</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="ES">Spain</option>
                  <option value="IT">Italy</option>
                  <option value="NL">Netherlands</option>
                </select>
              </div>
            </div>
          </section>

          <!-- Shipping Method -->
          <section class="checkout-section">
            <h2>Shipping Method</h2>
            <div class="shipping-options">
              <label
                v-for="option in shippingOptions"
                :key="option.id"
                class="shipping-option"
                :class="{
                  'shipping-option--selected':
                    form.shippingMethod === option.id,
                }"
              >
                <input
                  v-model="form.shippingMethod"
                  type="radio"
                  :value="option.id"
                  name="shipping"
                />
                <div class="shipping-option__content">
                  <span class="shipping-option__name">{{ option.name }}</span>
                  <span class="shipping-option__description">{{
                    option.description
                  }}</span>
                </div>
                <span class="shipping-option__price">
                  {{
                    option.price === 0 ? "Free" : `£${option.price.toFixed(2)}`
                  }}
                </span>
              </label>
            </div>
          </section>

          <!-- Payment -->
          <section class="checkout-section">
            <h2>Payment</h2>
            <p class="checkout-section__note">
              You will be redirected to Worldpay to complete your payment
              securely.
            </p>

            <div class="payment-icons">
              <FontAwesomeIcon :icon="['fab', 'cc-visa']" />
              <FontAwesomeIcon :icon="['fab', 'cc-mastercard']" />
              <FontAwesomeIcon :icon="['fab', 'cc-paypal']" />
              <FontAwesomeIcon :icon="['fab', 'apple-pay']" />
            </div>
          </section>

          <!-- Order Notes -->
          <section class="checkout-section">
            <h2>Order Notes (Optional)</h2>
            <div class="form-group">
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Special instructions for your order..."
              ></textarea>
            </div>
          </section>
        </div>

        <!-- Order Summary -->
        <aside class="checkout-page__summary">
          <div class="order-summary">
            <h2>Order Summary</h2>

            <ul class="order-summary__items">
              <li
                v-for="item in cartStore.items"
                :key="item.product.id"
                class="order-summary__item"
              >
                <div class="order-summary__item-image">
                  <NuxtImg
                    v-if="item.product.images && item.product.images.length > 0"
                    :src="`${strapiUrl}${item.product.images[0].url}`"
                    :alt="item.product.name"
                    width="64"
                    height="64"
                    loading="lazy"
                  />
                  <span class="order-summary__item-quantity">{{
                    item.quantity
                  }}</span>
                </div>
                <div class="order-summary__item-details">
                  <span class="order-summary__item-name">{{ item.product.name }}</span>
                  <span
                    v-if="item.product.weight"
                    class="order-summary__item-variant"
                    >{{ item.product.weight }}</span
                  >
                </div>
                <span class="order-summary__item-price">
                  £{{ ((item.product.salePrice || item.product.price) * item.quantity).toFixed(2) }}
                </span>
              </li>
            </ul>

            <div class="order-summary__totals">
              <div class="order-summary__row">
                <span>Subtotal</span>
                <span>£{{ cartStore.subtotal.toFixed(2) }}</span>
              </div>
              <div class="order-summary__row">
                <span>Shipping</span>
                <span>{{
                  selectedShipping?.price === 0
                    ? "Free"
                    : `£${selectedShipping?.price.toFixed(2)}`
                }}</span>
              </div>
              <div class="order-summary__row">
                <span>Tax (VAT 20%)</span>
                <span>£{{ cartStore.tax.toFixed(2) }}</span>
              </div>
              <div class="order-summary__row order-summary__row--total">
                <span>Total</span>
                <span>£{{ orderTotal.toFixed(2) }}</span>
              </div>
            </div>

            <button
              class="btn btn--primary btn--block"
              :disabled="isProcessing || !isFormValid"
              @click="processPayment"
            >
              <span v-if="!isProcessing">Pay £{{ orderTotal.toFixed(2) }}</span>
              <span v-else class="loading-spinner"></span>
            </button>

            <p v-if="error" class="order-summary__error">
              {{ error }}
            </p>

            <p class="order-summary__secure">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Secure checkout powered by Worldpay
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/cart";

const config = useRuntimeConfig();
const strapiUrl = config.public.strapiUrl;


// Protect checkout page with auth
definePageMeta({
  middleware: ['auth'],
});

// SEO
useHead({
  title: "Checkout | Carafe Coffee",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { user } = useAuth();
const cartStore = useCartStore();
const { createOrder } = useOrders();

const form = reactive({
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  postcode: "",
  country: "GB",
  shippingMethod: "standard",
  notes: "",
});

// Auto-populate email from logged-in user
onMounted(() => {
  if (user.value?.email) {
    form.email = user.value.email;
  }
});

const shippingOptions = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "3-5 business days",
    price: 4.95,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "1-2 business days",
    price: 9.95,
  },
  {
    id: "free",
    name: "Free Delivery",
    description: "5-7 business days (orders over £35)",
    price: 0,
  },
];

const isProcessing = ref(false);
const error = ref("");

const selectedShipping = computed(() =>
  shippingOptions.find((o) => o.id === form.shippingMethod)
);

const orderTotal = computed(
  () => cartStore.total + (selectedShipping.value?.price || 0)
);

const isFormValid = computed(() => {
  return (
    form.email &&
    form.firstName &&
    form.lastName &&
    form.address1 &&
    form.city &&
    form.postcode &&
    form.country
  );
});

const processPayment = async () => {
  if (!isFormValid.value) return;

  isProcessing.value = true;
  error.value = "";

  try {
    // Step 1: Create order in Strapi
    const orderItems = cartStore.items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productSlug: item.product.slug,
      quantity: item.quantity,
      unitPrice: item.product.salePrice || item.product.price,
      totalPrice: (item.product.salePrice || item.product.price) * item.quantity,
      weight: String(item.product.weight || ''),
    }));

    const orderResult = await createOrder({
      items: orderItems,
      subtotal: cartStore.subtotal,
      shippingCost: selectedShipping.value?.price || 0,
      tax: cartStore.tax,
      total: orderTotal.value,
      currency: cartStore.currency || 'EUR',
      customerEmail: form.email,
      customerName: `${form.firstName} ${form.lastName}`,
      customerPhone: form.phone,
      shippingAddress: {
        street: form.address1 + (form.address2 ? ', ' + form.address2 : ''),
        city: form.city,
        postcode: form.postcode,
        country: form.country,
      },
      shippingMethod: form.shippingMethod,
      notes: form.notes,
    });

    if (!orderResult.success || !orderResult.order) {
      throw new Error(orderResult.error || 'Failed to create order');
    }

    // Step 2: Initiate Worldpay payment
    const paymentResponse = await $fetch("/api/payment/initiate", {
      method: "POST",
      body: {
        orderId: orderResult.order.id,
        orderNumber: orderResult.order.orderNumber,
        amount: orderTotal.value,
        currency: cartStore.currency || 'EUR',
        customer: {
          email: form.email,
          phone: form.phone,
          firstName: form.firstName,
          lastName: form.lastName,
          address: {
            line1: form.address1,
            line2: form.address2,
            city: form.city,
            postcode: form.postcode,
            country: form.country,
          },
        },
      },
    });

    // Step 3: Redirect to Worldpay payment page
    if (paymentResponse?.redirectUrl) {
      // Clear cart before redirecting
      cartStore.clearCart();
      window.location.href = paymentResponse.redirectUrl;
    } else {
      throw new Error('No payment redirect URL received');
    }
  } catch (err: any) {
    console.error('Checkout error:', err);
    error.value =
      err.data?.message || err.message || "Payment initiation failed. Please try again.";
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";
@import "~/assets/scss/mixins";

.checkout-page {
  padding-top: 80px;
  // padding: $spacing-8 0 $spacing-16;
  min-height: 100vh;
  background: $color-gray-50;

  &__header {
    margin-bottom: $spacing-8;

    h1 {
      font-family: $font-family-heading;
      font-size: $font-size-3xl;
      color: $color-dark;
    }
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    color: $color-gray-600;
    text-decoration: none;
    font-size: $font-size-sm;
    margin-bottom: $spacing-4;

    &:hover {
      color: $color-primary;
    }
  }

  &__empty {
    text-align: center;
    padding: $spacing-16 0;

    p {
      font-size: $font-size-lg;
      color: $color-gray-500;
      margin-bottom: $spacing-6;
    }
  }

  &__content {
    display: grid;
    gap: $spacing-8;

    @include desktop {
      grid-template-columns: 1fr 400px;
      gap: $spacing-12;
    }
  }

  &__form {
    background: $color-white;
    border-radius: $border-radius-lg;
    padding: $spacing-6;
    box-shadow: $shadow-sm;

    @include tablet {
      padding: $spacing-8;
    }
  }

  &__summary {
    @include desktop {
      position: sticky;
      top: $spacing-8;
      align-self: start;
    }
  }
}

.checkout-section {
  margin-bottom: $spacing-8;
  padding-bottom: $spacing-8;
  border-bottom: 1px solid $color-gray-100;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  h2 {
    font-size: $font-size-lg;
    color: $color-dark;
    margin-bottom: $spacing-4;
  }

  &__note {
    color: $color-gray-500;
    font-size: $font-size-sm;
    margin-bottom: $spacing-4;
  }
}

.form-grid {
  display: grid;
  gap: $spacing-4;

  @include tablet {
    grid-template-columns: 1fr 1fr;
  }
}

.form-group {
  &--full {
    @include tablet {
      grid-column: 1 / -1;
    }
  }

  label {
    display: block;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-dark;
    margin-bottom: $spacing-2;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: $spacing-3 $spacing-4;
    border: 1px solid $color-gray-300;
    border-radius: $border-radius-md;
    font-size: $font-size-base;
    color: $color-dark;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }

    &::placeholder {
      color: $color-gray-400;
    }
  }
}

.shipping-options {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.shipping-option {
  display: flex;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-4;
  border: 1px solid $color-gray-200;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: $color-gray-300;
  }

  &--selected {
    border-color: $color-primary;
    background: rgba($color-primary, 0.05);
  }

  input {
    width: auto;
    margin: 0;
  }

  &__content {
    flex: 1;
  }

  &__name {
    display: block;
    font-weight: 500;
    color: $color-dark;
  }

  &__description {
    font-size: $font-size-sm;
    color: $color-gray-500;
  }

  &__price {
    font-weight: 600;
    color: $color-dark;
  }
}

.payment-icons {
  display: flex;
  gap: $spacing-4;
  align-items: center;

  svg {
    height: 40px;
    width: auto;
    font-size: 2.5rem;
    color: $color-text;
    transition: color 0.2s ease;

    &:hover {
      color: $color-primary;
    }
  }
}

.order-summary {
  background: $color-white;
  border-radius: $border-radius-lg;
  padding: $spacing-6;
  box-shadow: $shadow-sm;

  h2 {
    font-size: $font-size-lg;
    color: $color-dark;
    margin-bottom: $spacing-6;
  }

  &__items {
    list-style: none;
    padding: 0;
    margin: 0 0 $spacing-6 0;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-4;
    padding: $spacing-3 0;
    border-bottom: 1px solid $color-gray-100;

    &:last-child {
      border-bottom: none;
    }
  }

  &__item-image {
    position: relative;
    width: 64px;
    height: 64px;
    border-radius: $border-radius-md;
    background: $color-gray-100;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__item-quantity {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-primary;
    color: $color-white;
    font-size: $font-size-xs;
    font-weight: 600;
    border-radius: $border-radius-full;
  }

  &__item-details {
    flex: 1;
  }

  &__item-name {
    display: block;
    font-weight: 500;
    color: $color-dark;
    font-size: $font-size-sm;
  }

  &__item-variant {
    font-size: $font-size-xs;
    color: $color-gray-500;
  }

  &__item-price {
    font-weight: 500;
    color: $color-dark;
  }

  &__totals {
    padding-top: $spacing-4;
    border-top: 1px solid $color-gray-200;
    margin-bottom: $spacing-6;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    padding: $spacing-2 0;
    font-size: $font-size-sm;
    color: $color-gray-600;

    &--total {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-dark;
      padding-top: $spacing-4;
      margin-top: $spacing-2;
      border-top: 1px solid $color-gray-200;
    }
  }

  &__error {
    margin-top: $spacing-4;
    padding: $spacing-3;
    background: rgba($color-error, 0.1);
    color: $color-error;
    border-radius: $border-radius-md;
    font-size: $font-size-sm;
    text-align: center;
  }

  &__secure {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-2;
    margin-top: $spacing-4;
    font-size: $font-size-xs;
    color: $color-gray-500;
  }
}

.btn--block {
  width: 100%;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
