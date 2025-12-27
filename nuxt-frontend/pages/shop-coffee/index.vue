<script setup lang="ts">
import type { Product, ShopCoffee } from "~/types/strapi";
import ProductCard from "~/components/shop/ProductCard.vue";
import WhatsNewCarousel from "~/components/shop/WhatsNewCarousel.vue";
import TestimonialsSection from "~/components/TestimonialsSection.vue";
import VisitCafeSection from "~/components/VisitCafeSection.vue";

const { fetchProducts } = useProducts();
const { fetchShopCoffeeData } = useShopCoffee();

const products = ref<Product[]>([]);
const whatsNewProducts = ref<Product[]>([]);
const shopCoffeeData = ref<ShopCoffee | null>(null);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = 3;
const totalPages = ref(1);
const initialized = ref(false);

const hasMore = computed(() => currentPage.value < totalPages.value);

// SEO
useHead({
  title: "Shop Coffee - Carafe Coffee House & Roasters",
  meta: [
    {
      name: "description",
      content:
        "Discover our collection of single-origin, blended, and seasonal coffee. Expertly roasted in Lewes, shipped fresh to your door.",
    },
    {
      property: "og:title",
      content: "Shop Coffee - Carafe Coffee House & Roasters",
    },
    {
      property: "og:description",
      content:
        "Discover our collection of single-origin, blended, and seasonal coffee. Expertly roasted in Lewes, shipped fresh to your door.",
    },
    {
      property: "og:type",
      content: "website",
    },
  ],
});

// Load initial products
async function loadInitialProducts() {
  if (initialized.value) return; // Prevent double loading

  loading.value = true;
  try {
    const response = await fetchProducts({
      page: 1,
      pageSize,
    });

    products.value = response.products;
    totalPages.value = response.pagination.pageCount;
    currentPage.value = 1;
    initialized.value = true;
  } catch (error) {
    console.error("Failed to load products:", error);
  } finally {
    loading.value = false;
  }
}

// Load What's New products
async function loadWhatsNewProducts() {
  try {
    const response = await fetchProducts({
      isWhatsNew: true,
      pageSize: 5,
    });

    whatsNewProducts.value = response.products;
  } catch (error) {
    console.error("Failed to load what's new products:", error);
  }
}

// Load more products
async function loadMore() {
  if (loading.value || !hasMore.value) return;

  loading.value = true;
  try {
    const nextPage = currentPage.value + 1;
    const response = await fetchProducts({
      page: nextPage,
      pageSize,
    });

    products.value.push(...response.products);
    currentPage.value = nextPage;
  } catch (error) {
    console.error("Failed to load more products:", error);
  } finally {
    loading.value = false;
  }
}

// Load data - use onMounted with guard to prevent double loading
onMounted(async () => {
  if (!initialized.value) {
    await Promise.all([
      loadInitialProducts(),
      loadWhatsNewProducts(),
      loadShopCoffeeData(),
    ]);
  }
});

// Load shop coffee data (visit cafe section)
async function loadShopCoffeeData() {
  try {
    const data = await fetchShopCoffeeData();
    console.log("Shop Coffee Data:", data);
    shopCoffeeData.value = data;
  } catch (error) {
    console.error("Failed to load shop coffee data:", error);
  }
}
</script>

<template>
  <div class="shop-coffee-page">
    <!-- Breadcrumb -->
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item">
            <NuxtLink to="/">HOME</NuxtLink>
          </li>
          <li class="breadcrumb__separator">/</li>
          <li
            class="breadcrumb__item breadcrumb__item--active"
            aria-current="page"
          >
            SHOP COFFEE
          </li>
        </ol>
      </nav>
    </div>

    <!-- Page Title -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">COFFEE COLLECTIONS</h1>
      </div>
    </section>

    <!-- Product Grid -->
    <section class="product-section">
      <div class="container">
        <div v-if="loading && products.length === 0" class="loading-grid">
          <div v-for="i in 6" :key="i" class="skeleton-card"></div>
        </div>

        <div v-else-if="products.length > 0" class="product-grid">
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <div v-else class="empty-state">
          <p>No products available at the moment.</p>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMore && products.length > 0" class="load-more-container">
          <button @click="loadMore" class="btn-load-more" :disabled="loading">
            {{ loading ? "LOADING..." : "LOAD MORE" }}
            <svg
              v-if="!loading"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M19 9L12 16L5 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- What's New Section -->
    <WhatsNewCarousel
      v-if="whatsNewProducts.length > 0"
      :products="whatsNewProducts"
    />

    <!-- Testimonial Section -->
    <TestimonialsSection />

    <!-- Visit Cafe Section -->
    <VisitCafeSection
      v-if="shopCoffeeData?.visitCafeSection"
      :section="shopCoffeeData.visitCafeSection"
    />

    <!-- Email Subscription -->
    <EmailSubscribe source="shopcoffeepage" />
  </div>
</template>

<style lang="scss" scoped>
.shop-coffee-page {
  padding-top: 80px;
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

// Page Header
.page-header {
  padding: 0 0 1rem;
}

.page-title {
  font-size: $font-size-4xl;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  color: $color-text;
}

// Product Section
.product-section {
  padding: 2rem 0 4rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

// Loading Skeleton
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.skeleton-card {
  aspect-ratio: 3/4;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 24px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Empty State
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
  font-size: 1.125rem;
}

// Load More
.load-more-container {
  display: flex;
  justify-content: center;
  margin: 3rem 0;
}

.btn-load-more {
  display: inline-block;
  background: $color-primary;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-2px);
  }
}

// Responsive
@media (max-width: 1024px) {
  .page-title {
    font-size: 2.5rem;
  }

  .product-grid,
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .product-grid,
  .loading-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }

  .product-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }
}
</style>
