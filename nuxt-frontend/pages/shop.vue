<script setup lang="ts">
const { getProducts, getProductCategories } = useStrapi();
const route = useRoute();

// Get category from query
const category = computed(() => (route.query.category as string) || undefined);
const page = computed(() => parseInt(route.query.page as string) || 1);

// Fetch products and categories
const { data: productsData, pending } = await useAsyncData(
  `products-${category.value}-${page.value}`,
  () =>
    getProducts({
      category: category.value,
      page: page.value,
      pageSize: 12,
    }),
  { watch: [category, page] }
);

const { data: categoriesData } = await useAsyncData(
  "product-categories",
  getProductCategories
);

// SEO
useSeo({
  title: "Shop Coffee",
  description:
    "Discover our range of freshly roasted specialty coffee. From bold single origins to smooth blends, find your perfect cup.",
});

// Breadcrumb schema
useBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Shop Coffee", url: "/shop-coffee" },
]);

// WebPage schema
useWebPageSchema({
  name: "Shop Coffee | Carafe Coffee",
  description: "Browse our collection of specialty coffee beans",
  type: "CollectionPage",
});
</script>

<template>
  <div class="shop-page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb__list">
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li aria-current="page">Shop Coffee</li>
      </ol>
    </nav>

    <!-- Page Header -->
    <header class="shop-header">
      <h1 class="shop-header__title">COFFEE COLLECTIONS</h1>
    </header>

    <!-- Category Filter -->
    <div class="shop-filters">
      <div class="shop-filters__categories">
        <NuxtLink
          to="/shop-coffee"
          class="shop-filters__btn"
          :class="{ 'shop-filters__btn--active': !category }"
        >
          All
        </NuxtLink>
        <NuxtLink
          v-for="cat in categoriesData?.data"
          :key="cat.id"
          :to="`/shop-coffee?category=${cat.slug}`"
          class="shop-filters__btn"
          :class="{ 'shop-filters__btn--active': category === cat.slug }"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="shop-content">
      <div v-if="pending" class="shop-loading">
        <div class="shop-loading__spinner" />
        <p>Loading products...</p>
      </div>

      <div v-else-if="productsData?.data?.length" class="products-grid">
        <ProductCard
          v-for="product in productsData.data"
          :key="product.id"
          :product="product"
        />
      </div>

      <div v-else class="shop-empty">
        <p>No products found</p>
        <NuxtLink to="/shop-coffee" class="btn btn--primary"
          >View All Products</NuxtLink
        >
      </div>

      <!-- Pagination -->
      <div
        v-if="productsData?.meta?.pagination?.pageCount > 1"
        class="shop-pagination"
      >
        <NuxtLink
          v-if="page > 1"
          :to="{ query: { ...route.query, page: page - 1 } }"
          class="shop-pagination__btn"
        >
          Previous
        </NuxtLink>
        <span class="shop-pagination__info">
          Page {{ page }} of {{ productsData.meta.pagination.pageCount }}
        </span>
        <NuxtLink
          v-if="page < productsData.meta.pagination.pageCount"
          :to="{ query: { ...route.query, page: page + 1 } }"
          class="shop-pagination__btn"
        >
          Next
        </NuxtLink>
      </div>
    </div>

    <!-- Featured / What's New Section -->
    <section class="shop-featured">
      <h2 class="shop-featured__title">WHAT'S NEW</h2>
      <FeaturedProductSlider />
    </section>

    <!-- Testimonials -->
    <section class="shop-testimonials">
      <TestimonialsCarousel />
    </section>

    <!-- Visit Café CTA -->
    <section class="shop-cafe-cta">
      <VisitCafeCta />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.shop-page {
  padding-top: 80px; // Account for fixed header
}

.breadcrumb {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;

  &__list {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.875rem;
    color: #666;

    li:not(:last-child)::after {
      content: "/";
      margin-left: 0.5rem;
    }

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        color: $color-primary;
      }
    }
  }
}

.shop-header {
  text-align: center;
  padding: 2rem 2rem 3rem;

  &__title {
    font-family: $font-heading;
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
  }
}

.shop-filters {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 2rem;

  &__categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  &__btn {
    padding: 0.5rem 1.25rem;
    border: 1px solid #ddd;
    border-radius: 25px;
    font-size: 0.875rem;
    text-decoration: none;
    color: $color-text;
    transition: all 0.2s ease;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
    }

    &--active {
      background: $color-primary;
      border-color: $color-primary;
      color: white;
    }
  }
}

.shop-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.shop-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: #666;

  &__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #eee;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.shop-empty {
  text-align: center;
  padding: 4rem;
  color: #666;

  .btn {
    margin-top: 1rem;
  }
}

.shop-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;

  &__btn {
    padding: 0.75rem 1.5rem;
    border: 1px solid $color-primary;
    border-radius: 4px;
    color: $color-primary;
    text-decoration: none;
    font-size: 0.875rem;
    transition: all 0.2s ease;

    &:hover {
      background: $color-primary;
      color: white;
    }
  }

  &__info {
    font-size: 0.875rem;
    color: #666;
  }
}

.shop-featured,
.shop-testimonials,
.shop-cafe-cta {
  margin-top: 4rem;
}

.shop-featured__title {
  font-family: $font-heading;
  font-size: 1.25rem;
  text-align: center;
  margin-bottom: 2rem;
}
</style>
