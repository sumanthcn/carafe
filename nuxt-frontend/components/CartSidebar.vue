<script setup lang="ts">
const props = defineProps<{
  isOpen?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
}>();

const cartStore = useCartStore();

// Internal state for when not using v-model
const internalOpen = ref(false);

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

// Expose toggle function
defineExpose({ toggleCart });

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpenState.value) {
      isOpenState.value = false;
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
              v-for="item in cartStore.items"
              :key="item.product.id"
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
                <p class="cart-item__price">
                  {{
                    cartStore.formatPrice(
                      item.product.salePrice || item.product.price
                    )
                  }}
                </p>
                <div class="cart-item__quantity">
                  <button
                    class="cart-item__qty-btn"
                    @click="
                      cartStore.updateQuantity(
                        item.product.id,
                        item.quantity - 1
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
                        item.quantity + 1
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
                @click="cartStore.removeItem(item.product.id)"
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
            <div class="cart-sidebar__row">
              <span>Shipping</span>
              <span>{{
                cartStore.shippingCost === 0
                  ? "FREE"
                  : cartStore.formatPrice(cartStore.shippingCost)
              }}</span>
            </div>
            <div class="cart-sidebar__row cart-sidebar__row--total">
              <span>Total</span>
              <span>{{ cartStore.formatPrice(cartStore.total) }}</span>
            </div>
            <p
              v-if="cartStore.subtotal < 50"
              class="cart-sidebar__free-shipping"
            >
              Add {{ cartStore.formatPrice(50 - cartStore.subtotal) }} more for
              free shipping
            </p>
          </div>

          <!-- Actions -->
          <div class="cart-sidebar__actions">
            <NuxtLink
              to="/checkout"
              class="btn btn--primary btn--full"
              @click="isOpenState = false"
            >
              Checkout
            </NuxtLink>
          </div>
        </div>
      </aside>
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
</style>
