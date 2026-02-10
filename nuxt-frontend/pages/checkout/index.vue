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
                  :class="{ 'input-error': formErrors.email }"
                />
                <span v-if="formErrors.email" class="error-message">{{ formErrors.email }}</span>
              </div>
              <div class="form-group">
                <label for="phone">Phone *</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  required
                  placeholder="+447700900000"
                  :class="{ 'input-error': formErrors.phone }"
                  @input="handlePhoneInput"
                />
                <span v-if="formErrors.phone" class="error-message">{{ formErrors.phone }}</span>
              </div>
            </div>
          </section>

          <!-- Shipping Address -->
          <section class="checkout-section">
            <h2>Shipping Address</h2>

            <!-- Address Selector for Authenticated Users -->
            <AddressSelector
              v-if="isAuthenticated"
              @address-selected="handleAddressSelected"
            />

            <div class="form-grid">
              <div class="form-group">
                <label for="firstName">First Name *</label>
                <input
                  id="firstName"
                  v-model="form.firstName"
                  type="text"
                  required
                  :class="{ 'input-error': formErrors.firstName }"
                />
                <span v-if="formErrors.firstName" class="error-message">{{ formErrors.firstName }}</span>
              </div>
              <div class="form-group">
                <label for="lastName">Last Name *</label>
                <input
                  id="lastName"
                  v-model="form.lastName"
                  type="text"
                  required
                  :class="{ 'input-error': formErrors.lastName }"
                />
                <span v-if="formErrors.lastName" class="error-message">{{ formErrors.lastName }}</span>
              </div>
              <div class="form-group form-group--full">
                <label for="address1">Address Line 1 *</label>
                <input
                  id="address1"
                  v-model="form.address1"
                  type="text"
                  required
                  placeholder="Street address"
                  :class="{ 'input-error': formErrors.address1 }"
                />
                <span v-if="formErrors.address1" class="error-message">{{ formErrors.address1 }}</span>
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
                <input 
                  id="city" 
                  v-model="form.city" 
                  type="text" 
                  required 
                  :class="{ 'input-error': formErrors.city }"
                />
                <span v-if="formErrors.city" class="error-message">{{ formErrors.city }}</span>
              </div>
              <div class="form-group">
                <label for="postcode">Postcode *</label>
                <input
                  id="postcode"
                  v-model="form.postcode"
                  type="text"
                  required
                  placeholder="SW1A 1AA"
                  :class="{ 'input-error': formErrors.postcode }"
                />
                <span v-if="formErrors.postcode" class="error-message">{{ formErrors.postcode }}</span>
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

              <!-- Save Address Checkbox for Authenticated Users -->
              <div v-if="isAuthenticated" class="form-group form-group--full form-group--checkbox">
                <label class="checkbox-label">
                  <input
                    v-model="saveAddress"
                    type="checkbox"
                    class="checkbox-input"
                  />
                  <span>Save this address for future orders</span>
                </label>
              </div>
            </div>
          </section>

          <!-- Shipping Method -->
          <section class="checkout-section">
            <h2>Shipping Method</h2>
            <div v-if="shippingOptions.length === 0" class="loading-message">
              Loading shipping options...
            </div>
            <div v-else class="shipping-options">
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
                  <template v-if="option.freeEligible && cartStore.subtotal >= (checkout.shippingConfig.value?.freeShippingThreshold || 0)">
                    <span class="free-badge">FREE</span>
                    <span class="original-price">£{{ option.price.toFixed(2) }}</span>
                  </template>
                  <template v-else>
                    {{ option.price === 0 ? "Free" : `£${option.price.toFixed(2)}` }}
                  </template>
                </span>
              </label>
            </div>
            <p v-if="checkout.shippingConfig.value?.freeShippingThreshold && cartStore.subtotal < checkout.shippingConfig.value.freeShippingThreshold" class="free-shipping-note">
              Add £{{ (checkout.shippingConfig.value.freeShippingThreshold - cartStore.subtotal).toFixed(2) }} more for free shipping
            </p>
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
                :key="`${item.product.id}-${item.selectedVariant?.id || 'default'}`"
                class="order-summary__item"
              >
                <div class="order-summary__item-image">
                  <NuxtImg
                    v-if="item.product.images && item.product.images.length > 0"
                    :src="getStrapiMediaUrl(item.product.images[0])"
                    :alt="item.product.name"
                    width="64"
                    height="64"
                    loading="lazy"
                  />
                </div>
                <div class="order-summary__item-details">
                  <div class="order-summary__item-header">
                    <span class="order-summary__item-name">{{ item.product.name }}</span>
                    <button
                      class="order-summary__item-remove"
                      aria-label="Remove item"
                      @click="cartStore.removeItem(item.product.id, item.selectedVariant?.id)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <span
                    v-if="item.selectedVariant"
                    class="order-summary__item-variant"
                    >{{ item.selectedVariant.weight }}</span
                  >
                  
                  <div class="order-summary__item-bottom">
                    <div class="order-summary__item-quantity-control">
                      <button
                        class="quantity-btn"
                        aria-label="Decrease quantity"
                        @click="cartStore.updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant?.id)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <span class="quantity-value">{{ item.quantity }}</span>
                      <button
                        class="quantity-btn"
                        aria-label="Increase quantity"
                        @click="cartStore.updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant?.id)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                    <span class="order-summary__item-price">
                      £{{ ((item.selectedVariant 
                        ? (item.selectedVariant.salePrice || item.selectedVariant.price)
                        : 0) * item.quantity).toFixed(2) }}
                    </span>
                  </div>
                </div>
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
                  shippingCost === 0
                    ? "Free"
                    : `£${shippingCost.toFixed(2)}`
                }}</span>
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
const { getStrapiMediaUrl } = useStrapi();


// Guest checkout is now supported, no auth middleware required

// SEO
useHead({
  title: "Checkout | Carafe Coffee",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const { user, isAuthenticated } = useAuth();
const cartStore = useCartStore();
const { createOrder } = useOrders();
const checkout = useCheckout();
const { createAddress } = useAddresses();

const form = reactive({
  email: "",
  phone: "+44",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  postcode: "",
  country: "GB",
  shippingMethod: null as number | null,
  notes: "",
});

const saveAddress = ref(false);

// Handle address selection from saved addresses
function handleAddressSelected(address: any) {
  if (address) {
    form.firstName = address.firstName;
    form.lastName = address.lastName;
    form.phone = address.phone;
    form.address1 = address.address1;
    form.address2 = address.address2 || "";
    form.city = address.city;
    form.postcode = address.postcode;
    // Map country name to country code
    const countryMap: Record<string, string> = {
      'United Kingdom': 'GB',
      'Ireland': 'IE',
      'France': 'FR',
      'Germany': 'DE',
      'Spain': 'ES',
      'Italy': 'IT',
      'Netherlands': 'NL',
      'Belgium': 'BE',
    };
    form.country = countryMap[address.country] || 'GB';
  }
}

// Form validation errors
const formErrors = reactive({
  email: "",
  phone: "",
  firstName: "",
  lastName: "",
  address1: "",
  city: "",
  postcode: "",
});

// Validation functions
const validateEmail = (email: string) => {
  if (!email) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

const validatePhone = (phone: string) => {
  if (!phone || phone === "+44" || phone === "+44 ") return "Phone number is required";
  // UK phone number validation (should be +44 followed by 10 digits)
  const cleanPhone = phone.replace(/\s/g, "");
  if (cleanPhone.length < 12) return "Please enter a valid UK phone number"; // +44 + 10 digits = 13 minimum
  return "";
};

const validatePostcode = (postcode: string) => {
  if (!postcode) return "Postcode is required";
  // UK postcode validation
  const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  if (!postcodeRegex.test(postcode)) return "Please enter a valid UK postcode";
  return "";
};

const validateRequired = (value: string, fieldName: string) => {
  if (!value || !value.trim()) return `${fieldName} is required`;
  return "";
};

// Format phone number - just keep +44 prefix without spaces
const formatPhoneNumber = (value: string) => {
  // Remove all non-digit characters except + at the start
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +44
  if (!cleaned.startsWith('+44')) {
    if (cleaned.startsWith('44')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      cleaned = '+44' + cleaned.substring(1);
    } else if (cleaned.startsWith('+')) {
      cleaned = '+44';
    } else {
      cleaned = '+44' + cleaned;
    }
  }
  
  // Limit to +44 + 10 digits
  const match = cleaned.match(/^\+44(\d{0,10})/);
  if (match) {
    return '+44' + match[1];
  }
  
  return '+44';
};

// Watch form fields for validation
watch(() => form.email, (newValue) => {
  formErrors.email = validateEmail(newValue);
});

watch(() => form.phone, (newValue) => {
  formErrors.phone = validatePhone(newValue);
});

watch(() => form.firstName, (newValue) => {
  formErrors.firstName = validateRequired(newValue, "First name");
});

watch(() => form.lastName, (newValue) => {
  formErrors.lastName = validateRequired(newValue, "Last name");
});

watch(() => form.address1, (newValue) => {
  formErrors.address1 = validateRequired(newValue, "Address");
});

watch(() => form.city, (newValue) => {
  formErrors.city = validateRequired(newValue, "City");
});

watch(() => form.postcode, (newValue) => {
  formErrors.postcode = validatePostcode(newValue);
});

// Handle phone number formatting on input
const handlePhoneInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const cursorPos = input.selectionStart || 0;
  const oldValue = form.phone;
  const newValue = formatPhoneNumber(input.value);
  
  form.phone = newValue;
  
  // Restore cursor position
  nextTick(() => {
    const diff = newValue.length - oldValue.length;
    input.setSelectionRange(cursorPos + diff, cursorPos + diff);
  });
};

// Auto-populate email from logged-in user and fetch shipping options
onMounted(async () => {
  if (user.value?.email) {
    form.email = user.value.email;
  }
  
  // Fetch shipping options from API
  await checkout.fetchShippingOptions();
  
  // Select first available option by default
  if (checkout.activeShippingOptions.value.length > 0) {
    form.shippingMethod = checkout.activeShippingOptions.value[0].id;
    checkout.selectedShippingId.value = form.shippingMethod;
  }
});

// Update selected shipping when form changes
watch(() => form.shippingMethod, (newValue) => {
  checkout.selectedShippingId.value = newValue;
});

const isProcessing = ref(false);
const error = ref("");

// Shipping options from API
const shippingOptions = computed(() => {
  return checkout.activeShippingOptions.value.map(opt => ({
    id: opt.id,
    name: `${opt.carrierName} - ${opt.serviceName}`,
    description: `${opt.estimatedDays} business days`,
    price: opt.cost,
    freeEligible: opt.freeEligible,
  }));
});

const selectedShipping = computed(() => 
  shippingOptions.value.find((o) => o.id === form.shippingMethod)
);

// Calculate shipping cost with free shipping logic
const shippingCost = computed(() => {
  if (!selectedShipping.value) return 0;
  
  const subtotal = cartStore.subtotal;
  const threshold = checkout.shippingConfig.value?.freeShippingThreshold || 0;
  
  // Check if free shipping applies
  if (selectedShipping.value.freeEligible && subtotal >= threshold) {
    return 0;
  }
  
  return selectedShipping.value.price;
});

const orderTotal = computed(() => cartStore.subtotal + shippingCost.value);

const isFormValid = computed(() => {
  const hasAllFields = (
    form.email &&
    form.phone &&
    form.phone !== "+44" &&
    form.phone !== "+44 " &&
    form.firstName &&
    form.lastName &&
    form.address1 &&
    form.city &&
    form.postcode &&
    form.country &&
    form.shippingMethod !== null
  );
  
  const hasNoErrors = (
    !formErrors.email &&
    !formErrors.phone &&
    !formErrors.firstName &&
    !formErrors.lastName &&
    !formErrors.address1 &&
    !formErrors.city &&
    !formErrors.postcode
  );
  
  return hasAllFields && hasNoErrors;
});

const processPayment = async () => {
  if (!isFormValid.value) return;

  isProcessing.value = true;
  error.value = "";

  try {
    // Get selected shipping method name
    const selectedOption = checkout.activeShippingOptions.value.find(opt => opt.id === form.shippingMethod);
    const shippingMethodStr = selectedOption 
      ? `${selectedOption.carrierName} - ${selectedOption.serviceName}`
      : '';

    // Step 1: Create order in Strapi
    const orderItems = cartStore.items.map((item) => {
      const price = item.selectedVariant 
        ? (item.selectedVariant.salePrice || item.selectedVariant.price)
        : 0;
      
      return {
        productId: item.product.id,
        productName: item.product.name,
        productSlug: item.product.slug,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: price * item.quantity,
        sku: item.selectedVariant?.sku || '',
        weight: item.selectedVariant?.weight || '',
      };
    });

    const orderResult = await createOrder({
      items: orderItems,
      subtotal: cartStore.subtotal,
      shippingCost: shippingCost.value,
      tax: 0, // VAT is included in product prices
      total: orderTotal.value,
      currency: 'GBP',
      customerEmail: form.email,
      customerName: `${form.firstName} ${form.lastName}`,
      customerPhone: form.phone,
      shippingAddress: {
        street: form.address1 + (form.address2 ? ', ' + form.address2 : ''),
        city: form.city,
        postcode: form.postcode,
        country: form.country,
      },
      shippingMethod: shippingMethodStr,
      notes: form.notes,
    });

    if (!orderResult.success || !orderResult.order) {
      throw new Error(orderResult.error || 'Failed to create order');
    }

    // Save address if user checked the box (authenticated users only)
    if (saveAddress.value && isAuthenticated.value) {
      try {
        const countryNameMap: Record<string, string> = {
          'GB': 'United Kingdom',
          'IE': 'Ireland',
          'FR': 'France',
          'DE': 'Germany',
          'ES': 'Spain',
          'IT': 'Italy',
          'NL': 'Netherlands',
          'BE': 'Belgium',
        };

        await createAddress({
          label: 'Home', // Default label, can be customized later
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          address1: form.address1,
          address2: form.address2 || undefined,
          city: form.city,
          postcode: form.postcode,
          country: countryNameMap[form.country] || 'United Kingdom',
          isDefault: false,
        });
      } catch (addressErr) {
        // Don't fail checkout if address save fails
        console.error('Failed to save address:', addressErr);
      }
    }

    // Step 2: Initiate Worldpay payment
    const paymentResponse = await $fetch("/api/payment/initiate", {
      method: "POST",
      body: {
        orderId: orderResult.order.id,
        orderNumber: orderResult.order.orderNumber,
        amount: orderTotal.value,
        currency: 'GBP',
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

    &.input-error {
      border-color: #ef4444;
      background-color: #fef2f2;

      &:focus {
        border-color: #dc2626;
      }
    }
  }

  .error-message {
    display: block;
    color: #ef4444;
    font-size: 0.75rem;
    margin-top: 0.25rem;
    font-weight: 400;
  }

  &--checkbox {
    margin-top: $spacing-4;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  user-select: none;

  span {
    font-size: $font-size-sm;
    color: $color-dark;
  }
}

.checkbox-input {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
  flex-shrink: 0;
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
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .free-badge {
      background: #10b981;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .original-price {
      text-decoration: line-through;
      color: $color-gray-400;
      font-size: 0.875rem;
    }
  }
}

.free-shipping-note {
  margin-top: $spacing-3;
  padding: $spacing-3;
  background: #f0fdf4;
  border-left: 3px solid #10b981;
  border-radius: $border-radius-sm;
  font-size: $font-size-sm;
  color: #047857;
}

.loading-message {
  padding: $spacing-4;
  text-align: center;
  color: $color-gray-500;
  font-size: $font-size-sm;
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
    gap: $spacing-3;
    padding: $spacing-4 0;
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
      border-radius: $border-radius-md;
    }
  }

  &__item-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-2;
    min-width: 0;
  }

  &__item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: $spacing-2;
  }

  &__item-name {
    font-weight: 500;
    color: $color-dark;
    font-size: $font-size-sm;
    line-height: 1.3;
  }

  &__item-remove {
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    color: $color-gray-400;
    transition: color 0.2s ease;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #ef4444;
    }

    svg {
      display: block;
    }
  }

  &__item-variant {
    font-size: $font-size-xs;
    color: $color-gray-500;
    display: block;
  }

  &__item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $spacing-2;
  }

  &__item-quantity-control {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: $color-gray-50;
    border-radius: $border-radius-md;
    padding: 0.25rem;

    .quantity-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid $color-gray-200;
      border-radius: $border-radius-sm;
      cursor: pointer;
      transition: all 0.2s ease;
      color: $color-gray-600;

      &:hover {
        background: $color-primary;
        border-color: $color-primary;
        color: white;
      }

      &:active {
        transform: scale(0.95);
      }

      svg {
        display: block;
      }
    }

    .quantity-value {
      min-width: 24px;
      text-align: center;
      font-size: $font-size-sm;
      font-weight: 500;
      color: $color-dark;
      user-select: none;
    }
  }

  &__item-price {
    font-weight: 600;
    color: $color-dark;
    font-size: $font-size-sm;
    white-space: nowrap;
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
