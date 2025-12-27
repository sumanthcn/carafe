<template>
  <div class="product-details-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading product...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <h2>Product Not Found</h2>
      <p>{{ error }}</p>
      <NuxtLink to="/shop-coffee" class="btn btn-primary">Back to Shop</NuxtLink>
    </div>

    <div v-else-if="product" class="product-content">
        <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item">
            <NuxtLink to="/">HOME</NuxtLink>
          </li>
          <li class="breadcrumb__separator">/</li>
          <li><NuxtLink to="/shop-coffee">Shop Coffee</NuxtLink></li>
          <li
            class="breadcrumb__item breadcrumb__item--active"
            aria-current="page"
          >
            {{ product.name }}
          </li>
        </ol>
      </nav>
    </div>
      <section class="product-hero">
        <div class="container">
          <!-- <nav class="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li><NuxtLink to="/">Home</NuxtLink></li>
              <li><NuxtLink to="/shop-coffee">Shop Coffee</NuxtLink></li>
              <li aria-current="page">{{ product.name }}</li>
            </ol>
          </nav> -->

          <div class="product-hero-grid">
            <div class="product-images">
              <div class="main-image">
                <img :src="selectedImage.url" :alt="selectedImage.alternativeText || product.name" />
              </div>
              <div v-if="product.images.length > 1" class="thumbnail-gallery">
                <button
                  v-for="(image, index) in product.images"
                  :key="index"
                  class="thumbnail"
                  :class="{ active: selectedImageIndex === index }"
                  @click="selectedImageIndex = index"
                >
                  <img :src="`${strapiUrl}${image.formats?.thumbnail?.url || image.url}`" :alt="image.alternativeText" />
                </button>
              </div>
            </div>

            <div class="product-info">
              <h1 class="product-title">{{ product.name }}</h1>
              <p v-if="product.subtitle" class="product-subtitle">{{ product.subtitle }}</p>
              <p v-if="product.shortDescription" class="product-short-description">{{ product.shortDescription }}</p>

              <div class="product-pricing">
                <span v-if="isOnSale(product)" class="original-price">{{ formatCurrency(product.price, product.currency) }}</span>
                <span class="current-price">{{ formatCurrency(getDisplayPrice(product), product.currency) }}</span>
                <span v-if="isOnSale(product)" class="discount-badge">-{{ calculateDiscount(product.price, product.salePrice) }}% OFF</span>
              </div>

              <div class="product-actions">
                <button class="btn btn-outline" @click="handleAddToCart" :disabled="!product.inStock">
                  {{ product.inStock ? 'ADD TO CART' : 'OUT OF STOCK' }}
                </button>
                <button class="btn btn-primary" @click="handleBuyNow" :disabled="!product.inStock">BUY NOW</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="product-accordion">
        <div class="container">
          <div class="accordion-item">
            <button class="accordion-header" @click="toggleAccordion('info')">
              <span>PRODUCT INFO</span>
              <span class="icon">{{ activeAccordion === 'info' ? '−' : '+' }}</span>
            </button>
            <div v-show="activeAccordion === 'info'" class="accordion-content">
              <div v-if="product.description" v-html="product.description"></div>
              <div class="product-attributes">
                <div v-if="product.origin" class="attribute"><strong>Origin:</strong> {{ product.origin }}</div>
                <div v-if="product.tastingNotes" class="attribute"><strong>Tasting Notes:</strong> {{ product.tastingNotes }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VisitCafeSection v-if="shopCoffeeData?.visitCafeSection" :section="shopCoffeeData.visitCafeSection" />
      <EmailSubscribe />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types/strapi";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const config = useRuntimeConfig();

const { fetchProductBySlug } = useProducts();
const { fetchShopCoffeeData } = useShopCoffee();
const strapiUrl = config.public.strapiUrl;

// Utility functions
function calculateDiscount(originalPrice: number, salePrice?: number): number {
  if (!salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

function getDisplayPrice(product: Product): number {
  return product.salePrice || product.price;
}

function isOnSale(product: Product): boolean {
  return !!product.salePrice && product.salePrice < product.price;
}

function formatCurrency(amount: number, currency: string = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

const product = ref<Product | null>(null);
const shopCoffeeData = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedImageIndex = ref(0);
const activeAccordion = ref<string | null>('info');

const selectedImage = computed(() => {
  if (product.value && product.value.images[selectedImageIndex.value]) {
    const img = product.value.images[selectedImageIndex.value];
    return {
      url: `${strapiUrl}${img.url}`,
      alternativeText: img.alternativeText || product.value.name
    };
  }
  return { url: '', alternativeText: '' };
});

async function loadProduct() {
  try {
    loading.value = true;
    error.value = null;
    const slug = route.params.slug as string;
    product.value = await fetchProductBySlug(slug);
    
    // Try to fetch shop coffee data, but don't fail if it's not available
    try {
      shopCoffeeData.value = await fetchShopCoffeeData();
    } catch (e) {
      console.warn('Shop coffee data not available:', e);
      shopCoffeeData.value = null;
    }
  } catch (e: any) {
    error.value = e.message || "Failed to load product";
  } finally {
    loading.value = false;
  }
}

function toggleAccordion(section: string) {
  activeAccordion.value = activeAccordion.value === section ? null : section;
}

function handleAddToCart() {
  if (product.value) {
    cartStore.addItem(product.value, 1);
  }
}

function handleBuyNow() {
  if (product.value) {
    cartStore.addItem(product.value, 1);
    router.push('/checkout');
  }
}

onMounted(() => {
  loadProduct();
});

watch(() => route.params.slug, () => {
  if (route.params.slug) {
    loadProduct();
  }
});

useHead(() => {
  if (!product.value) return {};
  const title = product.value.seo?.metaTitle || `${product.value.name} - Carafe Coffee`;
  const description = product.value.seo?.metaDescription || product.value.shortDescription || '';
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'product' },
    ],
  };
});
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.product-details-page {
  padding-top: 80px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: $color-primary;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.container {
    max-width: 1400px;
    margin: 0 auto;
}

// Breadcrumb
.breadcrumb {
  font-family: $font-body;
  font-size: $font-size-lg;
  padding: 1.5rem 0;
}

.breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  font-size: 0.875rem;
  color: #666;
}

.breadcrumb__item {
  a {
    color: $color-text;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: $color-primary-light;
    }
  }

  &--active {
    color: $color-primary-dark;
    font-weight: 500;
  }
}

.breadcrumb__separator {
  color: $color-text;
}

.product-hero {
  padding: 3rem 0;
  
  .product-hero-grid {
    display: grid;
    grid-template-columns: 0.5fr 1fr;
    gap: 2rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

.product-images {
  .main-image {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1rem;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  
  .thumbnail-gallery {
    display: flex;
    gap: 1rem;
    
    .thumbnail {
      width: 80px;
      height: 80px;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      background: #f8f8f8;
      
      &.active {
        border-color: $color-primary;
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

.product-info {
  .product-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .product-subtitle {
    font-size: 1.125rem;
    font-weight: 600;
    color: #666;
    margin-bottom: 1rem;
  }
  
  .product-short-description {
    font-size: 1rem;
    line-height: 1.6;
    color: #666;
    margin-bottom: 2rem;
  }
  
  .product-pricing {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    
    .original-price {
      font-size: 1.25rem;
      color: #999;
      text-decoration: line-through;
    }
    
    .current-price {
      font-size: 2rem;
      font-weight: 700;
      color: $color-primary;
    }
    
    .discount-badge {
      padding: 0.25rem 0.75rem;
      background: $color-primary;
      color: white;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
    }
  }
  
  .product-actions {
    display: flex;
    gap: 1rem;
    
    .btn {
      flex: 1;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 50px;
      cursor: pointer;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
    
    .btn-outline {
      background: white;
      color: $color-primary;
      border: 2px solid $color-primary;
      
      &:hover:not(:disabled) {
        background: $color-primary;
        color: white;
      }
    }
    
    .btn-primary {
      background: $color-primary;
      color: white;
      border: 2px solid $color-primary;
    }
  }
}

.product-accordion {
  padding: 3rem 0;
  background: #f8f8f8;
  
  .accordion-item {
    background: white;
    border-radius: 8px;
    margin-bottom: 1rem;
    
    .accordion-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 1.5rem 2rem;
      background: white;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
    }
    
    .accordion-content {
      padding: 0 2rem 2rem;
      
      .product-attributes {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
      }
    }
  }
}
</style>
