<template>
  <section class="categories">
    <div class="container">
      <div class="section-header">
        <span v-if="data?.badge" class="section-badge">{{ data.badge }}</span>
        <h2 class="section-title">
          {{ data?.heading || "Our Coffee Selection" }}
        </h2>
        <p v-if="data?.subheading" class="section-subtitle">
          {{ data.subheading }}
        </p>
      </div>

      <div class="categories__grid">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/shop?category=${category.slug}`"
          class="category-card"
        >
          <div class="category-card__image">
            <NuxtImg
              v-if="category.image?.url"
              :src="category.image.url"
              :alt="category.image.alternativeText || category.name"
              preset="card"
              loading="lazy"
            />
            <div class="category-card__overlay"></div>
          </div>

          <div class="category-card__content">
            <span v-if="category.icon" class="category-card__icon">
              {{ category.icon }}
            </span>
            <h3 class="category-card__title">{{ category.name }}</h3>
            <p v-if="category.description" class="category-card__description">
              {{ category.description }}
            </p>
            <span class="category-card__link">
              Shop Now
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
        </NuxtLink>
      </div>

      <div v-if="data?.ctaButton" class="categories__cta">
        <NuxtLink :to="data.ctaButton.url" class="btn btn--primary">
          {{ data.ctaButton.label }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProductCategory } from "~/types/strapi";

interface CategoriesProps {
  data?: {
    badge?: string;
    heading?: string;
    subheading?: string;
    ctaButton?: {
      label: string;
      url: string;
    };
  };
  categories?: ProductCategory[];
}

defineProps<CategoriesProps>();
</script>

<style lang="scss" scoped>
.categories {
  padding: $spacing-16 0;
  background: $color-gray-50;

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

.category-card {
  position: relative;
  display: block;
  border-radius: $border-radius-lg;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  text-decoration: none;
  color: $color-white;

  &__image {
    position: absolute;
    inset: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.2) 50%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }

  &__content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: $spacing-6;
    z-index: 1;
  }

  &__icon {
    font-size: 2rem;
    margin-bottom: $spacing-2;
    display: block;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-2xl;
    margin-bottom: $spacing-2;
  }

  &__description {
    font-size: $font-size-sm;
    opacity: 0.9;
    margin-bottom: $spacing-4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;

    svg {
      transition: transform 0.3s ease;
    }
  }

  &:hover {
    .category-card__image img {
      transform: scale(1.05);
    }

    .category-card__link svg {
      transform: translateX(4px);
    }
  }
}
</style>
