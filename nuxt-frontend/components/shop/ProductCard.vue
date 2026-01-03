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
          :src="getImageUrl(product.images[0])"
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
        <div class="product-price-and-rating">
          <span class="product-price">{{ baseVariantPrice }}</span>
          
          <!-- Review Stars -->
          <div class="product-rating">
            <NuxtRating 
              :rating-value="4.5" 
              :read-only="true" 
              :rating-size="16" 
              :rating-count="5"
              active-color="#007ba7" 
              inactive-color="#ddd"
              :border-width="0"
              :rating-spacing="2"
            />
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product, StrapiMedia } from "~/types/strapi";

interface ProductCardProps {
  product: Product;
}

const props = defineProps<ProductCardProps>();

const config = useRuntimeConfig();
const strapiUrl = config.public.strapiUrl;
const { getStrapiMediaUrl } = useStrapi();

// Helper to get image URL (handles both local and Cloudinary URLs)
const getImageUrl = (image: StrapiMedia) => {
  return getStrapiMediaUrl(image);
};

// Get base variant (250g) price
const baseVariantPrice = computed(() => {
  const variants = props.product.variants || [];
  
  if (variants.length === 0) {
    return '€0.00';
  }

  // Find 250g variant
  const baseVariant = variants.find(v => v.weight === '250g');
  
  if (baseVariant) {
    const price = baseVariant.salePrice || baseVariant.price;
    const currency = props.product.currency || 'EUR';
    const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    return `${symbol}${price.toFixed(2)}`;
  }

  // If no 250g variant, show first variant price
  const firstVariant = variants[0];
  const price = firstVariant.salePrice || firstVariant.price;
  const currency = props.product.currency || 'EUR';
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  return `${symbol}${price.toFixed(2)}`;
});
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem 1.5rem;
}

.product-price-and-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: $color-text;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-rating {
  display: flex;
  align-items: center;
  justify-content: center;
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
