<script setup lang="ts">
const { getHomepage, getGlobalSettings, getProducts } = useStrapi();

// Fetch homepage data
const { data: homepage } = await useAsyncData("homepage", getHomepage);
const { data: globalSettings } = await useAsyncData(
  "global-settings",
  getGlobalSettings
);
const { data: featuredProducts } = await useAsyncData("featured-products", () =>
  getProducts({ featured: true, pageSize: 8 })
);

// SEO
useSeo({
  seo: homepage.value?.data?.seo,
  globalSettings: globalSettings.value,
});

// Organization schema
useOrganizationSchema(globalSettings.value || undefined);

// LocalBusiness schema
useLocalBusinessSchema(globalSettings.value || undefined);

// WebPage schema
useWebPageSchema({
  name: "Carafe Coffee House & Roasters - Home",
  description:
    "Artisan coffee roasted in the heart of Lewes. Shop our small-batch beans online or visit our café.",
  type: "WebPage",
});
</script>

<template>
  <div class="homepage">
    <!-- Hero Section -->
    <HomepageHero v-if="homepage?.data?.hero" :data="homepage.data.hero" />

    <!-- Product Categories -->
    <HomepageCategories
      v-if="homepage?.data?.productCategories"
      :data="homepage.data.productCategories"
    />

    <!-- Brand Story -->
    <HomepageBrandStory
      v-if="homepage?.data?.brandStory"
      :data="homepage.data.brandStory"
    />

    <!-- Café Location -->
    <HomepageCafeLocation
      v-if="homepage?.data?.cafeLocation"
      :data="homepage.data.cafeLocation"
    />

    <!-- Culture Section -->
    <HomepageCulture
      v-if="homepage?.data?.cultureSection"
      :data="homepage.data.cultureSection"
    />

    <!-- Wholesale Section -->
    <HomepageWholesale
      v-if="homepage?.data?.wholesaleSection"
      :data="homepage.data.wholesaleSection"
    />

    <!-- Newsletter -->
    <HomepageNewsletter
      v-if="homepage?.data?.newsletter"
      :data="homepage.data.newsletter"
    />
  </div>
</template>

<style lang="scss" scoped>
.homepage {
  // Page container
}
</style>
