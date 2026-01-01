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
      <section
        v-if="visitCafeData.bannerSection"
        class="banner-section"
        :style="bannerBackgroundStyle"
      >
        <div class="banner-overlay"></div>
        <div class="container">
          <div class="banner-content">
            <h1 class="banner-title">{{ visitCafeData.bannerSection.title }}</h1>
            <p v-if="visitCafeData.bannerSection.subtitle" class="banner-subtitle">
              {{ visitCafeData.bannerSection.subtitle }}
            </p>
            <div
              v-if="visitCafeData.bannerSection.description"
              class="banner-description"
              v-html="visitCafeData.bannerSection.description"
            ></div>
          </div>
        </div>
      </section>

      <!-- Brand Story Section -->
      <section v-if="visitCafeData.brandStorySection" class="brand-story-section">
        <div class="container">
          <div class="brand-story-grid">
            <div class="story-content">
              <span class="heading">{{ visitCafeData.brandStorySection.heading }}</span>
              <h2 class="title">{{ visitCafeData.brandStorySection.title }}</h2>
              <div class="description" v-html="visitCafeData.brandStorySection.description"></div>
            </div>
            <div class="story-images">
              <img
                v-for="(image, index) in visitCafeData.brandStorySection.images"
                :key="index"
                :src="getStrapiMediaUrl(image)"
                :alt="`Brand story image ${index + 1}`"
                class="story-image"
              />
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
        <div class="hours-overlay"></div>
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
const config = useRuntimeConfig();

const loading = ref(true);
const visitCafeData = ref<VisitCafe | null>(null);

// Fetch data
onMounted(async () => {
  loading.value = true;
  visitCafeData.value = await fetchVisitCafeData();
  loading.value = false;
});

// Computed styles
const bannerBackgroundStyle = computed(() => {
  if (visitCafeData.value?.bannerSection?.backgroundImage) {
    return {
      backgroundImage: `url(${getStrapiMediaUrl(visitCafeData.value.bannerSection.backgroundImage)})`,
    };
  }
  return {};
});

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
  min-height: 100vh;
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

// Banner Section
.banner-section {
  position: relative;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 4rem 2rem;

  @media (min-width: 768px) {
    min-height: 600px;
  }

  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }

  .container {
    position: relative;
    z-index: 2;
    max-width: 800px;
    text-align: center;
  }

  .banner-content {
    .banner-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 2px;

      @media (min-width: 768px) {
        font-size: 3.5rem;
      }
    }

    .banner-subtitle {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      opacity: 0.95;

      @media (min-width: 768px) {
        font-size: 1.5rem;
      }
    }

    .banner-description {
      font-size: 1rem;
      line-height: 1.8;
      opacity: 0.9;

      @media (min-width: 768px) {
        font-size: 1.125rem;
      }
    }
  }
}

// Brand Story Section
.brand-story-section {
  padding: 5rem 2rem;
  background: white;

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .brand-story-grid {
    display: grid;
    gap: 3rem;
    align-items: center;

    @media (min-width: 992px) {
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
    }
  }

  .story-content {
    .heading {
      display: block;
      color: $color-primary;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 1rem;
    }

    .title {
      font-size: 2rem;
      font-weight: 700;
      color: $color-text;
      margin-bottom: 1.5rem;
      line-height: 1.2;

      @media (min-width: 768px) {
        font-size: 2.5rem;
      }
    }

    .description {
      color: $color-text;
      line-height: 1.8;
      font-size: 1rem;

      @media (min-width: 768px) {
        font-size: 1.125rem;
      }
    }
  }

  .story-images {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(2, 1fr);

    .story-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
      border-radius: 8px;

      @media (min-width: 768px) {
        height: 300px;
      }
    }
  }
}

// Opening Hours Section
.opening-hours-section {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 4rem 2rem;
  color: white;

  .hours-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 1;
  }

  .container {
    position: relative;
    z-index: 2;
    max-width: 800px;
    text-align: center;
  }

  .hours-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-transform: uppercase;
    letter-spacing: 2px;

    @media (min-width: 768px) {
      font-size: 2.5rem;
    }
  }

  .hours-grid {
    display: grid;
    gap: 2rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 3rem;
    }
  }

  .hours-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);

    h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      letter-spacing: 1px;
    }

    p {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0;
    }
  }
}

// Getting Here Section
.getting-here-section {
  padding: 5rem 2rem;
  background: $color-background;

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-title {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 3rem;
    color: $color-text;
    text-transform: uppercase;
    letter-spacing: 2px;

    @media (min-width: 768px) {
      font-size: 2.5rem;
    }
  }

  .getting-here-grid {
    display: grid;
    gap: 2rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 2.5rem;
    }

    @media (min-width: 992px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .getting-here-item {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    }

    .item-icon {
      margin-bottom: 1.5rem;

      img {
        width: 60px;
        height: 60px;
        object-fit: contain;

        @media (min-width: 768px) {
          width: 80px;
          height: 80px;
        }
      }
    }

    .item-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: $color-primary;
      margin-bottom: 1rem;
    }

    .item-description {
      color: $color-text;
      line-height: 1.6;
      font-size: 0.9375rem;

      p {
        margin: 0;
      }
    }
  }
}
</style>
