<template>
  <section class="featured-products">
    <div class="container">
      <div class="section-header">
        <span v-if="badge" class="section-badge">{{ badge }}</span>
        <h2 class="section-title">{{ title || "Featured Products" }}</h2>
        <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      </div>

      <div class="featured-products__grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-if="showViewAll" class="featured-products__cta">
        <NuxtLink to="/shop-coffee" class="btn btn--outline">
          View All Products
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from "~/types/strapi";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  badge?: string;
  showViewAll?: boolean;
}

withDefaults(defineProps<FeaturedProductsProps>(), {
  title: "Featured Products",
  showViewAll: true,
});
</script>

<style lang="scss" scoped>
.featured-products {
  padding: $spacing-16 0;
  background: $color-white;

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: $spacing-6;
    margin-top: $spacing-12;
  }

  &__cta {
    text-align: center;
    margin-top: $spacing-12;
  }
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.section-badge {
  display: inline-block;
  color: $color-primary;
  font-size: $font-size-sm;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: $spacing-4;
}

.section-title {
  font-family: $font-family-heading;
  font-size: $font-size-3xl;
  color: $color-dark;
  margin-bottom: $spacing-4;

  @include tablet {
    font-size: $font-size-4xl;
  }
}

.section-subtitle {
  color: $color-gray-600;
  font-size: $font-size-lg;
  line-height: 1.7;
}
</style>
