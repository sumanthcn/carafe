<template>
  <div class="page-about">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Content -->
    <div v-else-if="aboutData">
      <!-- Banner Section -->
      <PageBanner :data="aboutData.bannerSection" />

      <!-- Section 1 -->
      <HomepageBrandStoryCarousel
        v-if="aboutData.section1"
        :data="aboutData.section1"
        background-color="default"
      />

      <!-- Section 2 -->
      <HomepageBrandStoryCarousel
        v-if="aboutData.section2"
        :data="aboutData.section2"
        background-color="alt"
      />

      <!-- Section 3 -->
      <HomepageBrandStoryCarousel
        v-if="aboutData.section3"
        :data="aboutData.section3"
        background-color="default"
      />

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
import type { About } from "~/composables/useAbout";

definePageMeta({
  layout: "default",
});

const { fetchAboutData } = useAbout();

const loading = ref(true);
const aboutData = ref<About | null>(null);

// Fetch data
onMounted(async () => {
  loading.value = true;
  aboutData.value = await fetchAboutData();
  loading.value = false;
});

// SEO
useHead(() => {
  const seo = aboutData.value?.seo;
  return {
    title: seo?.metaTitle || "About Us - Carafe Coffee House",
    meta: [
      {
        name: "description",
        content:
          seo?.metaDescription ||
          "Learn about our story, our passion for coffee, and our commitment to quality and sustainability.",
      },
      {
        property: "og:title",
        content: seo?.metaTitle || "About Us - Carafe Coffee House",
      },
      {
        property: "og:description",
        content:
          seo?.metaDescription ||
          "Learn about our story, our passion for coffee, and our commitment to quality and sustainability.",
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.page-about {
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
</style>
