<template>
  <section class="brand-story">
    <div class="container">
      <div class="brand-story__grid">
        <div class="brand-story__images">
          <div class="brand-story__image brand-story__image--main">
            <NuxtImg
              v-if="data?.mainImage?.url"
              :src="data.mainImage.url"
              :alt="data.mainImage.alternativeText || 'Carafe Coffee'"
              preset="card"
              loading="lazy"
            />
          </div>
          <div class="brand-story__image brand-story__image--secondary">
            <NuxtImg
              v-if="data?.secondaryImage?.url"
              :src="data.secondaryImage.url"
              :alt="data.secondaryImage.alternativeText || 'Our roastery'"
              preset="card"
              loading="lazy"
            />
          </div>
        </div>

        <div class="brand-story__content">
          <span v-if="data?.badge" class="brand-story__badge">
            {{ data.badge }}
          </span>

          <h2 class="brand-story__title">
            {{ data?.heading || "Our Story" }}
          </h2>

          <div
            v-if="data?.content"
            class="brand-story__text"
            v-html="data.content"
          />

          <div v-if="data?.highlights?.length" class="brand-story__highlights">
            <div
              v-for="(highlight, index) in data.highlights"
              :key="index"
              class="brand-story__highlight"
            >
              <span class="brand-story__highlight-value">{{
                highlight.value
              }}</span>
              <span class="brand-story__highlight-label">{{
                highlight.label
              }}</span>
            </div>
          </div>

          <NuxtLink
            v-if="data?.ctaButton"
            :to="data.ctaButton.url"
            class="btn btn--primary"
          >
            {{ data.ctaButton.label }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface BrandStoryProps {
  data?: {
    badge?: string;
    heading?: string;
    content?: string;
    mainImage?: {
      url: string;
      alternativeText?: string;
    };
    secondaryImage?: {
      url: string;
      alternativeText?: string;
    };
    highlights?: Array<{
      value: string;
      label: string;
    }>;
    ctaButton?: {
      label: string;
      url: string;
    };
  };
}

defineProps<BrandStoryProps>();
</script>

<style lang="scss" scoped>
.brand-story {
  padding: $spacing-20 0;

  &__grid {
    display: grid;
    gap: $spacing-12;
    align-items: center;

    @include tablet {
      grid-template-columns: 1fr 1fr;
      gap: $spacing-16;
    }
  }

  &__images {
    position: relative;
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: $spacing-4;
  }

  &__image {
    border-radius: $border-radius-lg;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &--main {
      aspect-ratio: 3 / 4;
    }

    &--secondary {
      aspect-ratio: 1 / 1;
      margin-top: $spacing-12;
    }
  }

  &__content {
    @include tablet {
      padding-left: $spacing-8;
    }
  }

  &__badge {
    display: inline-block;
    color: $color-primary;
    font-size: $font-size-sm;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: $spacing-4;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-3xl;
    color: $color-dark;
    margin-bottom: $spacing-6;

    @include tablet {
      font-size: $font-size-4xl;
    }
  }

  &__text {
    color: $color-gray-600;
    line-height: 1.8;
    margin-bottom: $spacing-8;

    :deep(p) {
      margin-bottom: $spacing-4;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &__highlights {
    display: flex;
    gap: $spacing-8;
    margin-bottom: $spacing-8;
    padding: $spacing-6 0;
    border-top: 1px solid $color-gray-200;
    border-bottom: 1px solid $color-gray-200;
  }

  &__highlight {
    text-align: center;

    &-value {
      display: block;
      font-family: $font-family-heading;
      font-size: $font-size-3xl;
      color: $color-primary;
      line-height: 1;
      margin-bottom: $spacing-1;
    }

    &-label {
      font-size: $font-size-sm;
      color: $color-gray-500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
}
</style>
