<script setup lang="ts">
const props = defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
}>();

const cartStore = useCartStore();
const { isAuthenticated } = useAuth();
const router = useRouter();

// Internal state for when not using v-model
const internalOpen = ref(false);

// Checkout modal state
const showCheckoutModal = ref(false);

// Use either prop or internal state
const isOpenState = computed({
  get: () => props.isOpen ?? internalOpen.value,
  set: (value: boolean) => {
    internalOpen.value = value;
    emit("update:isOpen", value);
  },
});

// Toggle cart sidebar
const toggleCart = () => {
  isOpenState.value = !isOpenState.value;
};

// Handle checkout button click
const handleCheckoutClick = () => {
  if (isAuthenticated.value) {
    // User is logged in, proceed to checkout
    isOpenState.value = false;
    router.push('/checkout');
  } else {
    // User is not logged in, show modal
    showCheckoutModal.value = true;
  }
};

// Continue as guest
const continueAsGuest = () => {
  showCheckoutModal.value = false;
  isOpenState.value = false;
  router.push('/checkout');
};

// Go to login
const goToLogin = () => {
  showCheckoutModal.value = false;
  isOpenState.value = false;
  router.push('/login?redirect=/checkout');
};

// Go to signup
const goToSignup = () => {
  showCheckoutModal.value = false;
  isOpenState.value = false;
  router.push('/signup?redirect=/checkout');
};

// Close modal
const closeModal = () => {
  showCheckoutModal.value = false;
};

// Expose toggle function
defineExpose({ toggleCart });

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (showCheckoutModal.value) {
        showCheckoutModal.value = false;
      } else if (isOpenState.value) {
        isOpenState.value = false;
      }
    }
  };
  document.addEventListener("keydown", handleEscape);
  onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
  });
});
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpenState"
        class="cart-overlay"
        @click="isOpenState = false"
      />
    </Transition>

    <!-- Sidebar -->
    <Transition name="slide">
      <aside
        v-if="isOpenState"
        class="cart-sidebar"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div class="cart-sidebar__header">
          <h2 class="cart-sidebar__title">Your Cart</h2>
          <button
            class="cart-sidebar__close"
            aria-label="Close cart"
            @click="isOpenState = false"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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

        <!-- Empty state -->
        <div v-if="cartStore.isEmpty" class="cart-sidebar__empty">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
            ></path>
          </svg>
          <p>Your cart is empty</p>
          <NuxtLink
            to="/shop-coffee"
            class="btn btn--primary"
            @click="isOpenState = false"
          >
            Shop Coffee
          </NuxtLink>
        </div>

        <!-- Cart items -->
        <div v-else class="cart-sidebar__content">
          <ul class="cart-sidebar__items">
            <li
              v-for="(item, index) in cartStore.items"
              :key="`${item.product.id}-${item.selectedVariant?.id || 'default'}-${index}`"
              class="cart-item"
            >
              <div class="cart-item__image">
                <NuxtImg
                  v-if="item.product.images?.[0]"
                  provider="strapi"
                  :src="item.product.images[0].url"
                  :alt="item.product.name"
                  width="80"
                  height="80"
                  fit="cover"
                />
              </div>
              <div class="cart-item__details">
                <h3 class="cart-item__name">{{ item.product.name }}</h3>
                
                <!-- Variant Info -->
                <div v-if="item.selectedVariant" class="cart-item__variant">
                  <span class="variant-tag">{{ item.selectedVariant.weight }}</span>
                  <span v-if="item.selectedVariant.roastLevel" class="variant-tag">
                    {{ item.selectedVariant.roastLevel }}
                  </span>
                  <span v-if="item.selectedVariant.grindSize" class="variant-tag">
                    {{ item.selectedVariant.grindSize }}
                  </span>
                </div>

                <p class="cart-item__price">
                  {{
                    cartStore.formatPrice(
                      item.selectedVariant
                        ? (item.selectedVariant.salePrice || item.selectedVariant.price)
                        : (item.product.salePrice || item.product.price)
                    )
                  }}
                </p>
                <div class="cart-item__quantity">
                  <button
                    class="cart-item__qty-btn"
                    @click="
                      cartStore.updateQuantity(
                        item.product.id,
                        item.quantity - 1,
                        item.selectedVariant?.id
                      )
                    "
                  >
                    -
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button
                    class="cart-item__qty-btn"
                    @click="
                      cartStore.updateQuantity(
                        item.product.id,
                        item.quantity + 1,
                        item.selectedVariant?.id
                      )
                    "
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                class="cart-item__remove"
                aria-label="Remove item"
                @click="cartStore.removeItem(item.product.id, item.selectedVariant?.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  ></path>
                </svg>
              </button>
            </li>
          </ul>

          <!-- Summary -->
          <div class="cart-sidebar__summary">
            <div class="cart-sidebar__row">
              <span>Subtotal</span>
              <span>{{ cartStore.formatPrice(cartStore.subtotal) }}</span>
            </div>
            <div class="cart-sidebar__row cart-sidebar__row--total">
              <span>Total</span>
              <span>{{ cartStore.formatPrice(cartStore.subtotal) }}</span>
            </div>
            <p class="cart-sidebar__shipping-note">
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
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Shipping charges will be calculated at checkout
            </p>
          </div>

          <!-- Actions -->
          <div class="cart-sidebar__actions">
            <button
              class="btn btn--primary btn--full"
              @click="handleCheckoutClick"
            >
              Checkout
            </button>
          </div>
        </div>
      </aside>
    </Transition>

    <!-- Checkout Modal -->
    <Transition name="fade">
      <div
        v-if="showCheckoutModal"
        class="checkout-modal-overlay"
        @click="closeModal"
      >
        <div class="checkout-modal" @click.stop>
          <button
            class="checkout-modal__close"
            aria-label="Close"
            @click="closeModal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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

          <div class="checkout-modal__content">
            <h3 class="checkout-modal__title">How would you like to checkout?</h3>
            <p class="checkout-modal__description">
              You're not logged in. Would you like to create an account for faster checkout and order tracking, or continue as a guest?
            </p>

            <div class="checkout-modal__actions">
              <button
                class="btn btn--primary btn--full"
                @click="goToLogin"
              >
                Login to Your Account
              </button>
              
              <button
                class="btn btn--secondary btn--full"
                @click="goToSignup"
              >
                Create New Account
              </button>

              <button
                class="btn btn--outline btn--full"
                @click="continueAsGuest"
              >
                Continue as Guest
              </button>
            </div>

            <p class="checkout-modal__note">
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
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Guest orders can still be tracked using your order number and email.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
}

.cart-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  background: white;
  z-index: 201;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
  }

  &__title {
    font-family: $font-heading;
    font-size: 1.25rem;
    font-weight: 600;
  }

  &__close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: $color-text;
  }

  &__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 2rem;
    color: #888;

    svg {
      opacity: 0.3;
    }
  }

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__items {
    flex: 1;
    overflow-y: auto;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__summary {
    padding: 1.5rem;
    border-top: 1px solid #eee;
    background: #fafafa;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;

    &--total {
      font-weight: 600;
      font-size: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
    }
  }

  &__shipping-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #666;
    margin-top: 1rem;
    padding: 0.75rem;
    background: #f9f9f9;
    border-radius: 4px;
    line-height: 1.4;

    svg {
      flex-shrink: 0;
      color: $color-primary;
    }
  }

  &__free-shipping {
    font-size: 0.75rem;
    color: $color-primary;
    margin-top: 1rem;
    text-align: center;
  }

  &__actions {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;

  &__image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    background: #f5f5f5;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__details {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__variant {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 0.5rem;

    .variant-tag {
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
      background: #e5e7eb;
      color: #374151;
      border-radius: 4px;
      font-weight: 500;
    }
  }

  &__price {
    font-size: 0.875rem;
    color: #666;
    margin: 0 0 0.5rem;
  }

  &__quantity {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    span {
      font-size: 0.875rem;
      min-width: 1.5rem;
      text-align: center;
    }
  }

  &__qty-btn {
    width: 28px;
    height: 28px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: $color-primary;
    }
  }

  &__remove {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: #999;
    transition: color 0.2s ease;

    &:hover {
      color: #e53e3e;
    }
  }
}

// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

// Checkout Modal
.checkout-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.checkout-modal {
  background: white;
  border-radius: 12px;
  max-width: 580px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.3s ease-out;

  &__close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: #999;
    transition: color 0.2s ease;
    z-index: 1;

    &:hover {
      color: #333;
    }
  }

  &__content {
    padding: 2rem;
  }

  &__title {
    font-family: $font-heading;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: $color-text;
  }

  &__description {
    color: #666;
    font-size: 0.9375rem;
    line-height: 1.6;
    margin: 0 0 2rem;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  &__note {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: #666;
    padding: 0.75rem;
    background: #f9f9f9;
    border-radius: 6px;
    line-height: 1.4;

    svg {
      flex-shrink: 0;
      margin-top: 0.125rem;
      color: $color-primary;
    }
  }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive
@media (max-width: 768px) {
  .checkout-modal {
    max-width: 100%;
    margin: 1rem;
  }
}
</style>
