<template>
  <article class="product-card">
    <NuxtLink :to="`/products/${product.slug}`" class="product-card__link">
      <div class="product-card__image">
        <NuxtImg
          v-if="product.images?.[0]?.url"
          :src="product.images[0].url"
          :alt="product.images[0].alternativeText || product.name"
          preset="product"
          loading="lazy"
        />

        <div
          v-if="product.badge"
          class="product-card__badge"
          :class="`product-card__badge--${product.badge}`"
        >
          {{ product.badge }}
        </div>

        <div
          v-if="product.images?.length > 1"
          class="product-card__image-hover"
        >
          <NuxtImg
            :src="product.images[1].url"
            :alt="product.images[1].alternativeText || product.name"
            preset="product"
            loading="lazy"
          />
        </div>
      </div>

      <div class="product-card__content">
        <div v-if="product.category" class="product-card__category">
          {{ product.category.name }}
        </div>

        <h3 class="product-card__title">{{ product.name }}</h3>

        <div
          v-if="product.roastLevel || product.origin"
          class="product-card__meta"
        >
          <span v-if="product.roastLevel" class="product-card__roast">
            {{ product.roastLevel }}
          </span>
          <span v-if="product.origin" class="product-card__origin">
            {{ product.origin }}
          </span>
        </div>

        <div v-if="product.tastingNotes?.length" class="product-card__notes">
          <span v-for="note in product.tastingNotes.slice(0, 3)" :key="note">
            {{ note }}
          </span>
        </div>

        <div class="product-card__footer">
          <div class="product-card__price">
            <span
              v-if="product.compareAtPrice"
              class="product-card__price-compare"
            >
              £{{ product.compareAtPrice.toFixed(2) }}
            </span>
            <span class="product-card__price-current">
              £{{ product.price.toFixed(2) }}
            </span>
          </div>

          <button
            class="product-card__add"
            @click.prevent="addToCart"
            :disabled="!product.inStock"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import type { Product } from "~/types/strapi";
import { useCartStore } from "~/stores/cart";

interface ProductCardProps {
  product: Product;
}

const props = defineProps<ProductCardProps>();
const cartStore = useCartStore();

const addToCart = () => {
  if (!props.product.inStock) return;

  cartStore.addItem({
    id: props.product.id,
    name: props.product.name,
    slug: props.product.slug,
    price: props.product.price,
    quantity: 1,
    image: props.product.images?.[0]?.url,
    variant: props.product.variants?.[0]?.name,
  });
};
</script>

<style lang="scss" scoped>
.product-card {
  background: $color-white;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: box-shadow 0.3s ease, transform 0.3s ease;

  &:hover {
    box-shadow: $shadow-lg;
    transform: translateY(-4px);

    .product-card__image-hover {
      opacity: 1;
    }
  }

  &__link {
    display: block;
    text-decoration: none;
    color: inherit;
  }

  &__image {
    position: relative;
    aspect-ratio: 1 / 1;
    background: $color-gray-100;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    &:hover img:first-child {
      transform: scale(1.05);
    }
  }

  &__image-hover {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__badge {
    position: absolute;
    top: $spacing-3;
    left: $spacing-3;
    padding: $spacing-1 $spacing-3;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &--new {
      background: $color-primary;
      color: $color-white;
    }

    &--sale {
      background: $color-error;
      color: $color-white;
    }

    &--bestseller {
      background: $color-warning;
      color: $color-dark;
    }

    &--limited {
      background: $color-dark;
      color: $color-white;
    }
  }

  &__content {
    padding: $spacing-4;
  }

  &__category {
    font-size: $font-size-xs;
    color: $color-primary;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: $spacing-2;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-lg;
    color: $color-dark;
    margin-bottom: $spacing-2;
    line-height: 1.3;
  }

  &__meta {
    display: flex;
    gap: $spacing-3;
    font-size: $font-size-sm;
    color: $color-gray-500;
    margin-bottom: $spacing-3;
  }

  &__roast {
    padding: $spacing-1 $spacing-2;
    background: $color-gray-100;
    border-radius: $border-radius-sm;
    text-transform: capitalize;
  }

  &__notes {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-2;
    margin-bottom: $spacing-4;

    span {
      font-size: $font-size-xs;
      color: $color-gray-600;
      padding: $spacing-1 $spacing-2;
      background: $color-gray-50;
      border-radius: $border-radius-sm;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: $spacing-3;
    border-top: 1px solid $color-gray-100;
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: $spacing-2;

    &-compare {
      font-size: $font-size-sm;
      color: $color-gray-400;
      text-decoration: line-through;
    }

    &-current {
      font-size: $font-size-lg;
      font-weight: 600;
      color: $color-dark;
    }
  }

  &__add {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-primary;
    color: $color-white;
    border: none;
    border-radius: $border-radius-full;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;

    &:hover:not(:disabled) {
      background: $color-primary-dark;
      transform: scale(1.1);
    }

    &:disabled {
      background: $color-gray-300;
      cursor: not-allowed;
    }
  }
}
</style>
