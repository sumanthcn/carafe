<template>
  <div class="page-visit-cafe">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Content -->
    <div v-else-if="visitCafeData">
      <!-- Banner Section -->
      <PageBanner :data="visitCafeData.bannerSection" />
      
      <!-- Brand Story Section -->
      <section v-if="visitCafeData.brandStorySection" class="brand-story-section">
        <div class="container">
          <div class="brand-story-grid">
            <div class="brand-story__content">
              <h2>{{ visitCafeData.brandStorySection.headline }}</h2>
              <div class="brand-story__text" v-html="parsedBrandStoryContent" />
              <NuxtLink
                v-if="visitCafeData.brandStorySection.cta"
                :to="visitCafeData.brandStorySection.cta.url || '/'"
                :target="visitCafeData.brandStorySection.cta.openInNewTab ? '_blank' : undefined"
                :class="['btn', `btn--${visitCafeData.brandStorySection.cta.style || 'primary'}`]"
              >
                <img
                  v-if="visitCafeData.brandStorySection.cta.icon && visitCafeData.brandStorySection.cta.iconPosition === 'left'"
                  :src="getStrapiMediaUrl(visitCafeData.brandStorySection.cta.icon)"
                  alt=""
                  class="btn__icon btn__icon--left"
                />
                <span>{{ visitCafeData.brandStorySection.cta.text }}</span>
                <img
                  v-if="visitCafeData.brandStorySection.cta.icon && visitCafeData.brandStorySection.cta.iconPosition === 'right'"
                  :src="getStrapiMediaUrl(visitCafeData.brandStorySection.cta.icon)"
                  alt=""
                  class="btn__icon btn__icon--right"
                />
              </NuxtLink>
            </div>
            <div v-if="visitCafeData.brandStorySection.image" class="brand-story__image">
              <img :src="getStrapiMediaUrl(visitCafeData.brandStorySection.image)" :alt="visitCafeData.brandStorySection.headline" />
            </div>
          </div>
        </div>
      </section>

      <!-- Opening Hours Section -->
      <section
        v-if="visitCafeData.openingHoursSection"
        class="opening-hours-section"
        :style="openingHoursBackgroundStyle"
      >
        <div class="container">
          <h2 class="hours-title">{{ visitCafeData.openingHoursSection.title }}</h2>
          <div class="hours-grid">
            <div class="hours-card">
              <h3>MONDAY – SATURDAY</h3>
              <p>{{ visitCafeData.openingHoursSection.mondayToSaturday }}</p>
            </div>
            <div class="hours-card">
              <h3>SUNDAY</h3>
              <p>{{ visitCafeData.openingHoursSection.sunday }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Getting Here Section -->
      <section v-if="visitCafeData.gettingHereSection" class="getting-here-section">
        <div class="container">
          <h2 class="section-title">{{ visitCafeData.gettingHereSection.title }}</h2>
          <div class="getting-here-grid">
            <div
              v-for="item in visitCafeData.gettingHereSection.items"
              :key="item.id"
              class="getting-here-item"
            >
              <div class="item-icon">
                <img :src="getStrapiMediaUrl(item.icon)" :alt="item.name" />
              </div>
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-description" v-html="item.description"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Email Subscribe -->
      <EmailSubscribe />
    </div>

    <!-- Error State -->
    <div v-else class="error-container">
      <p>Unable to load page content. Please try again later.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VisitCafe } from "~/composables/useVisitCafe";

definePageMeta({
  layout: "default",
});

const { fetchVisitCafeData } = useVisitCafe();
const { getStrapiMediaUrl } = useStrapi();
const { parseMarkdown } = useMarkdown();
const config = useRuntimeConfig();

const loading = ref(true);
const visitCafeData = ref<VisitCafe | null>(null);

// Fetch data
onMounted(async () => {
  loading.value = true;
  visitCafeData.value = await fetchVisitCafeData();
  loading.value = false;
});

// Computed property to parse markdown content
const parsedBrandStoryContent = computed(() => {
  if (!visitCafeData.value?.brandStorySection?.content) return '';
  return parseMarkdown(visitCafeData.value.brandStorySection.content);
});

// Computed styles
const openingHoursBackgroundStyle = computed(() => {
  if (visitCafeData.value?.openingHoursSection?.backgroundImage) {
    return {
      backgroundImage: `url(${getStrapiMediaUrl(visitCafeData.value.openingHoursSection.backgroundImage)})`,
    };
  }
  return {};
});

// SEO
useHead(() => {
  const seo = visitCafeData.value?.seo;
  return {
    title: seo?.metaTitle || "Visit Our Café - Carafe Coffee",
    meta: [
      {
        name: "description",
        content:
          seo?.metaDescription ||
          "Visit Carafe Coffee House and experience exceptional coffee in a warm atmosphere.",
      },
      {
        property: "og:title",
        content: seo?.metaTitle || "Visit Our Café - Carafe Coffee",
      },
      {
        property: "og:description",
        content:
          seo?.metaDescription ||
          "Visit Carafe Coffee House and experience exceptional coffee in a warm atmosphere.",
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.page-visit-cafe {
  padding-top: 80px;
}

// Loading State
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba($color-primary, 0.1);
    border-left-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    margin-top: 1rem;
    color: $color-text;
    font-size: 1.125rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Error State
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;

  p {
    color: $color-danger;
    font-size: 1.125rem;
  }
}

// Brand Story Section
.brand-story-section {
  padding: 0rem 2rem;
  background: $color-background;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .brand-story-grid {
    display: grid;
    gap: 3rem;
    align-items: center;

    @media (min-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
  }

  .brand-story__content {
    @media (min-width: 1024px) {
      margin-top: -$spacing-14;
    }

    h2 {
      font-family: $font-heading;
      font-size: $font-size-4xl;
      color: $color-text;
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      font-weight: bold;
    }

    .brand-story__text {
      :deep(p) {
        color: $color-text;
        line-height: 1.8;
        margin-bottom: 1rem;
      }

      :deep(strong) {
        font-weight: 700;
        color: $color-text;
      }

      :deep(em) {
        font-style: italic;
      }

      :deep(a) {
        color: $color-primary;
        text-decoration: none;
        font-weight: 600;
        transition: color 0.3s ease;

        &:hover {
          color: darken($color-primary, 10%);
          text-decoration: underline;
        }
      }

      :deep(br) {
        line-height: 1.8;
      }
    }
  }

  .brand-story__image {
    img {
      width: 100%;
      height: auto;
      border-radius: 12px;
    }
  }
}

// Brand story specific button overrides
  .btn {
    margin-top: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    &.btn--primary {
      .btn__icon {
        filter: brightness(0) invert(1);
      }

      &:hover {
        transform: translateY(-2px);
      }
    }
  }

// Opening Hours Section
.opening-hours-section {
  position: relative;
  min-height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 80px 60px;
  color: white;

  @media (max-width: 991px) {
    padding: 60px 40px;
    min-height: 400px;
  }

  @media (max-width: 767px) {
    padding: 40px 20px;
    min-height: 350px;
  }

  .container {
    position: relative;
    z-index: 2;
    max-width: 900px;
    text-align: center;
  }

  .hours-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 50px;
    text-transform: uppercase;
    letter-spacing: 4px;
    color: white;

    @media (max-width: 991px) {
      font-size: 2rem;
      margin-bottom: 40px;
    }

    @media (max-width: 767px) {
      font-size: 1.75rem;
      letter-spacing: 2px;
      margin-bottom: 30px;
    }
  }

  .hours-grid {
    display: grid;
    gap: 30px;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
    }
  }

  .hours-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    padding: 32px 24px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }

    @media (max-width: 767px) {
      padding: 24px 20px;
    }

    h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 16px;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.9);

      @media (max-width: 767px) {
        font-size: 0.9375rem;
      }
    }

    p {
      font-size: 1.625rem;
      font-weight: 500;
      margin: 0;
      color: white;

      @media (max-width: 767px) {
        font-size: 1.375rem;
      }
    }
  }
}

// Getting Here Section
.getting-here-section {
  padding: 80px 80px 0 60px;
  background: white;

  @media (max-width: 991px) {
    padding: 60px 40px;
  }

  @media (max-width: 767px) {
    padding: 40px 20px;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0;
  }

  .section-title {
    text-align: center;
    font-family: $font-heading;
    font-size: $font-size-4xl;
    color: $color-text;
    font-weight: bold;
    margin-bottom: 60px;
    text-transform: uppercase;

    @media (max-width: 991px) {
      font-size: $font-size-3xl;
      margin-bottom: 50px;
    }

    @media (max-width: 767px) {
      font-size: $font-size-2xl;
      letter-spacing: 2px;
      margin-bottom: 40px;
    }
  }

  .getting-here-grid {
    display: grid;
    gap: 30px;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 32px;
    }

    @media (min-width: 992px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
    }
  }

  .getting-here-item {
    text-align: left;
    padding: 36px 24px;

    @media (max-width: 767px) {
      padding: 28px 20px;
    }

    .item-icon {
      margin-bottom: 20px;
      align-items: center;
      justify-content: center;
      min-height: 80px;

      @media (max-width: 767px) {
        min-height: 60px;
      }

      img {
        width: 80px;
        height: 80px;
        object-fit: contain;

        @media (max-width: 991px) {
          width: 60px;
          height: 60px;
        }

        @media (max-width: 767px) {
          width: 50px;
          height: 50px;
        }
      }
    }

    .item-name {
      font-size: $font-size-xl;
      font-weight: 700;
      color: $color-text;
      font-weight: bold;
      font-family: $font-heading;
      margin-bottom: 12px;
      letter-spacing: 0.5px;

      @media (max-width: 767px) {
        font-size: 1rem;
      }
    }

    .item-description {
      color: $color-text;
      line-height: 1.5;
      font-size: $font-size-base;
      font-weight: 500;
      max-width: 80%;
      margin-top: 1.25rem;

      @media (max-width: 767px) {
        font-size: 0.875rem;
      }

      p {
        margin: 0;
      }
    }
  }
}
</style>
