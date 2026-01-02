<template>
  <div class="page-art-culture">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Content -->
    <div v-else-if="artAndCultureData">
      <!-- Banner Section -->
      <PageBanner :data="artAndCultureData.bannerSection" />

      <!-- Art Exhibits Section (with Carousel) -->
      <HomepageBrandStoryCarousel
        v-if="artAndCultureData.artExibits"
        :data="artAndCultureData.artExibits"
        background-color="default"
      />

      <!-- Culture Nights Section -->
      <HomepageCafe
        v-if="artAndCultureData.cultureNights"
        :data="artAndCultureData.cultureNights"
      />

      <!-- Meetups Section -->
      <HomepageBrandStory
        v-if="artAndCultureData.meetups"
        :data="artAndCultureData.meetups"
        background-color="alt"
      />

      <!-- Upcoming Events Section -->
      <HomepageWholesale
        v-if="artAndCultureData.upcomingEvents"
        :data="artAndCultureData.upcomingEvents"
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
import type { ArtAndCulture } from "~/composables/useArtAndCulture";

definePageMeta({
  layout: "default",
});

const { fetchArtAndCultureData } = useArtAndCulture();

const loading = ref(true);
const artAndCultureData = ref<ArtAndCulture | null>(null);

// Fetch data
onMounted(async () => {
  loading.value = true;
  artAndCultureData.value = await fetchArtAndCultureData();
  loading.value = false;
});

// SEO
useHead(() => {
  const seo = artAndCultureData.value?.seo;
  return {
    title: seo?.metaTitle || "Art & Culture - Carafe Coffee House",
    meta: [
      {
        name: "description",
        content:
          seo?.metaDescription ||
          "Discover our commitment to supporting local artists and cultural events at Carafe Coffee House.",
      },
      {
        property: "og:title",
        content: seo?.metaTitle || "Art & Culture - Carafe Coffee House",
      },
      {
        property: "og:description",
        content:
          seo?.metaDescription ||
          "Discover our commitment to supporting local artists and cultural events at Carafe Coffee House.",
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.page-art-culture {
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
