<template>
  <article class="product-card">
    <!-- Top Seller Badge -->
    <div v-if="product.isTopSeller" class="badge-container">
      <span class="badge">TOP SELLERS</span>
    </div>

    <!-- Product Image -->
    <NuxtLink :to="`/shop-coffee/${product.slug}`" class="product-image-link">
      <div class="product-image">
        <img
          v-if="product.images && product.images.length > 0"
          :src="`${strapiUrl}${product.images[0].url}`"
          :alt="product.images[0].alternativeText || product.name"
          loading="lazy"
        />
        <div v-else class="product-image-placeholder">
          <span>No Image</span>
        </div>
      </div>
    </NuxtLink>

    <!-- Product Info -->
    <div class="product-info">
      <NuxtLink :to="`/shop-coffee/${product.slug}`" class="product-name">
        {{ product.name }}
      </NuxtLink>

      <div class="product-footer">
        <div class="product-price">
          <span v-if="product.salePrice" class="price-sale">
            € {{ product.salePrice }}
          </span>
          <span
            :class="[
              'price-regular',
              { 'price-strikethrough': product.salePrice },
            ]"
          >
            € {{ product.price || "0.00" }}
          </span>
        </div>

        <button
          @click="handleAddToCart"
          class="btn-add-to-cart"
          :disabled="isAdding || !product.inStock"
          aria-label="Add to cart"
        >
          {{ isAdding ? "ADDING..." : "ADD TO CART" }}
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from "~/types/strapi";

interface ProductCardProps {
  product: Product;
}

const props = defineProps<ProductCardProps>();

const config = useRuntimeConfig();
const strapiUrl = config.public.strapiUrl;
const cartStore = useCartStore();
const toast = useToast();

const isAdding = ref(false);

async function handleAddToCart() {
  if (!props.product.inStock) {
    toast.add({
      title: "Out of Stock",
      description: "This product is currently unavailable",
      color: "red",
      icon: "i-heroicons-exclamation-circle",
    });
    return;
  }

  isAdding.value = true;

  try {
    cartStore.addItem(props.product, 1);

    toast.add({
      title: "Added to Cart",
      description: `${props.product.name} has been added to your cart`,
      color: "green",
      icon: "i-heroicons-check-circle",
    });
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to add product to cart",
      color: "red",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    setTimeout(() => {
      isAdding.value = false;
    }, 300);
  }
}
</script>

<style lang="scss" scoped>
.product-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 60px;
  border: 1px solid $product-card-border;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }
}

.badge-container {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.badge {
  display: inline-block;
  background: #000;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 8px 16px;
  border-radius: 20px;
  text-transform: uppercase;
}

.product-image-link {
  display: block;
  width: 100%;
  padding-top: 2rem;
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%; // 1:1 aspect ratio
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;
  }
}

.product-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  color: #999;
  font-size: 0.875rem;
  font-weight: 600;
}

.product-info {
  padding: 1.5rem 2.5rem 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  text-align: center;
}

.product-name {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $color-text;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-decoration: none;
  line-height: 1.4;
  transition: color 0.2s ease;

  &::after {
    content: "";
    display: block;
    width: 50px;
    height: 3px;
    background: $color-text;
    transition: width 0.3s ease;
    margin: 0 auto;
    margin-top: 10px;
  }

  &:hover {
    // color: #00a5a5;

    &::after {
      width: 70px;
      background: $color-primary-dark;
    }
  }
}

.product-footer {
  align-items: center;
}

.product-price {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 700;
}

.price-sale {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $color-text;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.price-regular {
  font-size: 1.125rem;
  color: #000;

  &.price-strikethrough {
    font-size: 0.875rem;
    color: #999;
    text-decoration: line-through;
  }
}

.btn-add-to-cart {
  background: transparent;
  border: 2px solid $color-text;
  color: $color-text;
  font-size: $font-size-xl;
  font-weight: bold;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-transform: uppercase;
  margin-top: 1rem;
  width: 100%;

  &:hover:not(:disabled) {
    background: $color-text;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Responsive
@media (max-width: 768px) {
  .product-card {
    border-radius: 16px;
  }

  .product-info {
    padding: 1rem;
  }

  .product-name {
    font-size: 0.875rem;
  }

  .product-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add-to-cart {
    width: 100%;
    text-align: center;
  }
}
</style>
