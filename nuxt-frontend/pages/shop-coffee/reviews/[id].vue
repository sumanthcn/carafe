<template>
  <div class="reviews-page">
    <div class="container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item">
            <NuxtLink to="/">HOME</NuxtLink>
          </li>
          <li class="breadcrumb__separator">/</li>
          <li class="breadcrumb__item">
            <NuxtLink to="/shop-coffee">Shop Coffee</NuxtLink>
          </li>
          <li class="breadcrumb__separator">/</li>
          <li v-if="product" class="breadcrumb__item">
            <NuxtLink :to="`/shop-coffee/${product.slug}`">{{ product.name }}</NuxtLink>
          </li>
          <li v-if="product" class="breadcrumb__separator">/</li>
          <li class="breadcrumb__item breadcrumb__item--active" aria-current="page">
            Reviews
          </li>
        </ol>
      </nav>

      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">
          {{ product ? `Reviews for ${product.name}` : 'All Reviews' }}
        </h1>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search reviews..."
            class="search-input"
            @input="handleSearch"
          />
          <FontAwesomeIcon :icon="['fas', 'search']" class="search-icon" />
        </div>

        <div class="filter-controls">
          <select v-model="sortBy" class="filter-select" @change="applyFilters">
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>

          <select v-model="verifiedOnly" class="filter-select" @change="applyFilters">
            <option :value="false">All Reviews</option>
            <option :value="true">Verified Purchase Only</option>
          </select>
        </div>
      </div>

      <!-- Reviews Component -->
      <CustomerReviews 
        v-if="productId"
        :product-id="productId"
        :initial-count="10"
        :load-more-count="10"
        :show-view-all="false"
        :is-view-all-page="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from "~/types/strapi";

const route = useRoute();
const { fetchProductBySlug } = useProducts();

// Get product ID from route
const productId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

// State
const product = ref<Product | null>(null);
const searchQuery = ref('');
const sortBy = ref('recent');
const verifiedOnly = ref(false);

// Methods
function handleSearch() {
  // Debounced search
  applyFilters();
}

function applyFilters() {
  // This would be handled by the CustomerReviews component
  // We can emit events or use provide/inject for complex filtering
  console.log('Filters applied:', {
    searchQuery: searchQuery.value,
    sortBy: sortBy.value,
    verifiedOnly: verifiedOnly.value
  });
}

// Load product data if ID is provided
async function loadProduct() {
  if (!productId.value) return;
  
  try {
    // We need to fetch the product to get the slug first
    // For now, we'll assume we have the product ID directly
    // In a real scenario, you'd fetch the product details
    console.log('Loading product:', productId.value);
  } catch (error) {
    console.error('Failed to load product:', error);
  }
}

onMounted(() => {
  loadProduct();
});

// SEO
useHead({
  title: product.value 
    ? `Reviews - ${product.value.name} | Carafe Coffee` 
    : 'Customer Reviews | Carafe Coffee',
  meta: [
    { 
      name: 'description', 
      content: 'Read customer reviews and ratings for our specialty coffee products.' 
    },
  ],
});
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.reviews-page {
  padding-top: 80px;
  min-height: 100vh;
  background: #f9f9f9;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
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
  flex-wrap: wrap;
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

.page-header {
  padding: 2rem 0;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  color: $color-text;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
}

.filters-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 50px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007ba7;
  }
}

.search-icon {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 1.125rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007ba7;
  }
}
</style>
