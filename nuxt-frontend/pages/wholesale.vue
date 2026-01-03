<template>
  <div class="page-wholesale">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <div v-else-if="wholesaleData">
      <PageBanner :data="wholesaleData.bannerSection" />

      <FAQs
        v-if="wholesaleData.faqs"
        :title="wholesaleData.faqs.headline"
        :faqs="wholesaleData.faqs.items"
      />

      <WholesaleOffering
        v-if="wholesaleData.offerings"
        :data="wholesaleData.offerings"
      />

      <HomepageBrandStory
        v-if="wholesaleData.getStarted"
        :data="wholesaleData.getStarted"
        background-color="alt"
      />

      <HomepageWholesale
        v-if="wholesaleData.buildTogether"
        :data="wholesaleData.buildTogether"
      />

      <EmailSubscribe />
    </div>

    <div v-else class="error-container">
      <p>Unable to load page content. Please try again later.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Wholesale } from "~/composables/useWholesale";

definePageMeta({
  layout: "default",
});

const { fetchWholesaleData } = useWholesale();
const loading = ref(true);
const wholesaleData = ref<Wholesale | null>(null);

onMounted(async () => {
  loading.value = true;
  wholesaleData.value = await fetchWholesaleData();
  loading.value = false;
});

useHead(() => {
  const seo = wholesaleData.value?.seo;
  return {
    title: seo?.metaTitle || "Wholesale Coffee - Carafe Coffee Roasters",
    meta: [
      {
        name: "description",
        content: seo?.metaDescription || "Partner with Carafe Coffee for wholesale coffee supplies. Premium beans for restaurants, cafés, and offices.",
      },
      {
        property: "og:title",
        content: seo?.metaTitle || "Wholesale Coffee - Carafe Coffee Roasters",
      },
      {
        property: "og:description",
        content: seo?.metaDescription || "Partner with Carafe Coffee for wholesale coffee supplies. Premium beans for restaurants, cafés, and offices.",
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.page-wholesale {
  padding-top: 80px;
}

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
