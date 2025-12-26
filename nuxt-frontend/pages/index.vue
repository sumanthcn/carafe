<script setup lang="ts">
const { getHomepage, getStrapiMediaUrl } = useStrapi();

// Fetch homepage data with error handling
const { data: homepage, error: homepageError } = await useAsyncData(
  "homepage",
  async () => {
    try {
      const data = await getHomepage();
      return data as any;
    } catch (err) {
      console.error("Failed to fetch homepage:", err);
      return null;
    }
  }
);

// SEO
useSeoMeta({
  title: "Carafe Coffee House & Roasters - Home",
  description:
    "Artisan coffee roasted in the heart of Lewes. Shop our small-batch beans online or visit our café.",
});
</script>

<template>
  <div class="homepage">
    <!-- Hero Carousel -->
    <HomepageHero
      v-if="homepage?.data?.heroCarousel?.length"
      :heroCarousel="homepage.data.heroCarousel"
      :settings="homepage.data.carohouselSettings"
    />

    <!-- Product Categories Section -->
    <HomepageCategories
      v-if="homepage?.data?.tasteTheCraft"
      :tasteTheCraft="homepage.data.tasteTheCraft"
    />

    <!-- Brand Story Section -->
    <HomepageBrandStory
      v-if="homepage?.data?.brandStory"
      :data="homepage.data.brandStory"
    />

    <!-- Cafe Location Section -->
    <HomepageCafe
      v-if="homepage?.data?.cafeLocation"
      :data="homepage.data.cafeLocation"
    />

    <!-- Culture Section -->
    <HomepageBrandStory
      v-if="homepage?.data?.cultureSection"
      :data="homepage.data.cultureSection"
      backgroundColor="alt"
    />

    <!-- Wholesale Section -->
    <HomepageWholesale
      v-if="homepage?.data?.wholesaleSection"
      :data="homepage.data.wholesaleSection"
    />

    <!-- Email Subscription -->
    <EmailSubscribe source="homepage" />
  </div>
</template>

<style lang="scss" scoped>
.homepage {
  padding-top: 80px;
}

// Shared Section Styles
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-family: $font-heading;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  text-align: center;
  margin-bottom: 1rem;
  color: $color-text;
  text-transform: uppercase;
}

.section-description {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  color: $color-text;
  line-height: 1.8;
  font-size: 1.125rem;
}

.btn-primary {
  display: inline-block;
  background: $color-primary;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-2px);
  }
}

// Cafe Section
.cafe-section__hero {
  min-height: 500px;
  background-size: cover;
  background-position: center;
  background-color: $color-secondary;
  display: flex;
  align-items: center;
  position: relative;
}

.cafe-section__overlay {
  width: 100%;
  padding: 4rem 2rem;
  background: rgba(0, 0, 0, 0.5);
  text-align: center;

  h2 {
    font-family: $font-heading;
    font-size: clamp(2rem, 4vw, 3rem);
    color: white;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    max-width: 800px;
    margin: 0 auto 2rem;
    line-height: 1.8;
    font-size: 1.125rem;
  }
}
</style>
