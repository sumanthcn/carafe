<script setup lang="ts">
import type { Page } from "~/types/strapi";

// Define page meta to set lower priority than static routes
definePageMeta({
  layout: "default",
});

const route = useRoute();
const slug = route.params.slug as string;

const { getPageBySlug, getStrapiMediaUrl } = useStrapi();
const { defaultSeo, siteName } = useGlobalSettings();

// Fetch page data from Strapi CMS - wrapped in try/catch to handle gracefully
let page: Ref<Page | null>;
let fetchError: Ref<any> = ref(null);

try {
  const result = await useAsyncData<Page | null>(
    `page-${slug}`,
    () => getPageBySlug(slug),
    {
      // Don't throw on error, just return null
      server: true,
      lazy: false,
    }
  );
  page = result.data;
  fetchError = result.error;
} catch (err) {
  console.error("Error fetching CMS page:", err);
  page = ref(null);
}

// Handle 404 - Only throw error if page doesn't exist in CMS
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page Not Found",
    message: `The page "${slug}" could not be found.`,
  });
}

// SEO
const pageTitle = computed(
  () => page.value?.seo?.metaTitle || page.value?.title || siteName.value
);
const pageDescription = computed(
  () =>
    page.value?.seo?.metaDescription ||
    defaultSeo.value?.metaDescription ||
    `Learn more about ${page.value?.title}`
);

useHead({
  title: pageTitle.value,
  meta: [
    { name: "description", content: pageDescription.value },
    {
      property: "og:title",
      content: page.value?.seo?.ogTitle || pageTitle.value,
    },
    {
      property: "og:description",
      content: page.value?.seo?.ogDescription || pageDescription.value,
    },
    { property: "og:type", content: page.value?.seo?.ogType || "website" },
  ],
});

// JSON-LD structured data
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: pageTitle.value,
        description: pageDescription.value,
        url: `${useRuntimeConfig().public.siteUrl}/${slug}`,
        isPartOf: {
          "@type": "WebSite",
          name: siteName.value,
        },
      }),
    },
  ],
});
</script>

<template>
  <div class="page">
    <!-- Featured Image Hero -->
    <section
      v-if="page?.featuredImage"
      class="page__hero"
      :style="{
        backgroundImage: `url(${getStrapiMediaUrl(page.featuredImage)})`,
      }"
    >
      <div class="page__hero-overlay">
        <h1 class="page__title">{{ page?.title }}</h1>
      </div>
    </section>

    <!-- Title only (no featured image) -->
    <section v-else class="page__header">
      <div class="page__header-container">
        <h1 class="page__title">{{ page?.title }}</h1>
      </div>
    </section>

    <!-- Dynamic Content Blocks -->
    <div class="page__content">
      <template v-if="page?.content?.length">
        <template v-for="(block, index) in page.content" :key="index">
          <!-- Text Content Section -->
          <section
            v-if="block.__component === 'sections.text-content'"
            class="page__text-section"
          >
            <div class="page__container">
              <div
                class="page__text-content prose"
                v-html="parseMarkdown(block.content || '')"
              ></div>
            </div>
          </section>

          <!-- Image Gallery Section -->
          <section
            v-else-if="block.__component === 'sections.image-gallery'"
            class="page__gallery-section"
          >
            <div class="page__container">
              <h2 v-if="block.headline" class="page__section-title">
                {{ block.headline }}
              </h2>
              <div
                class="page__gallery"
                :class="`page__gallery--cols-${block.columns || '3'}`"
              >
                <figure
                  v-for="(image, imgIndex) in block.images"
                  :key="imgIndex"
                  class="page__gallery-item"
                >
                  <img
                    :src="getStrapiMediaUrl(image)"
                    :alt="
                      image.alternativeText || `Gallery image ${imgIndex + 1}`
                    "
                    loading="lazy"
                  />
                  <figcaption v-if="image.caption">
                    {{ image.caption }}
                  </figcaption>
                </figure>
              </div>
            </div>
          </section>

          <!-- CTA Section -->
          <section
            v-else-if="block.__component === 'sections.cta-section'"
            class="page__cta-section"
            :style="
              block.backgroundImage
                ? {
                    backgroundImage: `url(${getStrapiMediaUrl(
                      block.backgroundImage
                    )})`,
                  }
                : {}
            "
          >
            <div class="page__cta-overlay">
              <div class="page__container">
                <h2 v-if="block.headline" class="page__cta-title">
                  {{ block.headline }}
                </h2>
                <p v-if="block.description" class="page__cta-description">
                  {{ block.description }}
                </p>
                <NuxtLink
                  v-if="block.cta"
                  :to="block.cta.url || '/'"
                  class="page__cta-button"
                  :target="block.cta.openInNewTab ? '_blank' : undefined"
                >
                  {{ block.cta.text }}
                </NuxtLink>
              </div>
            </div>
          </section>

          <!-- Hero Section (if used in content) -->
          <section
            v-else-if="block.__component === 'sections.hero-section'"
            class="page__hero-section"
            :style="
              block.backgroundImage
                ? {
                    backgroundImage: `url(${getStrapiMediaUrl(
                      block.backgroundImage
                    )})`,
                  }
                : {}
            "
          >
            <div class="page__hero-overlay">
              <h2 v-if="block.headline" class="page__hero-headline">
                {{ block.headline }}
              </h2>
              <p v-if="block.subheadline" class="page__hero-subheadline">
                {{ block.subheadline }}
              </p>
              <div class="page__hero-actions">
                <NuxtLink
                  v-if="block.primaryCta"
                  :to="block.primaryCta.url || '/'"
                  class="page__hero-cta page__hero-cta--primary"
                >
                  {{ block.primaryCta.text }}
                </NuxtLink>
                <NuxtLink
                  v-if="block.secondaryCta"
                  :to="block.secondaryCta.url || '/'"
                  class="page__hero-cta page__hero-cta--secondary"
                >
                  {{ block.secondaryCta.text }}
                </NuxtLink>
              </div>
            </div>
          </section>
        </template>
      </template>

      <!-- Fallback: No content blocks -->
      <section v-else class="page__empty">
        <div class="page__container">
          <p>This page has no content yet.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  padding-top: 80px; // Account for fixed header

  &__hero {
    height: 50vh;
    min-height: 400px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__hero-overlay {
    background: rgba(0, 0, 0, 0.4);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
  }

  &__header {
    padding: 4rem 2rem;
    background: $color-background-alt;
    text-align: center;
  }

  &__header-container {
    max-width: 800px;
    margin: 0 auto;
  }

  &__title {
    font-family: $font-heading;
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: white;
    margin: 0;

    .page__header & {
      color: $color-text;
    }
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  &__text-section {
    padding: 4rem 0;

    &:nth-child(even) {
      background: $color-background-alt;
    }
  }

  &__text-content {
    max-width: 800px;
    margin: 0 auto;

    &.prose {
      line-height: 1.8;
      font-size: 1.125rem;

      h2,
      h3,
      h4 {
        font-family: $font-heading;
        margin-top: 2rem;
        margin-bottom: 1rem;
      }

      p {
        margin-bottom: 1.5rem;
      }

      ul,
      ol {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
      }

      a {
        color: $color-primary;
        text-decoration: underline;

        &:hover {
          text-decoration: none;
        }
      }

      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 2rem 0;
      }

      blockquote {
        border-left: 4px solid $color-primary;
        padding-left: 1.5rem;
        margin: 2rem 0;
        font-style: italic;
        color: $color-text-light;
      }
    }
  }

  &__section-title {
    font-family: $font-heading;
    font-size: 2rem;
    text-align: center;
    margin-bottom: 2rem;
  }

  &__gallery-section {
    padding: 4rem 0;
  }

  &__gallery {
    display: grid;
    gap: 1.5rem;

    &--cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }

    &--cols-3 {
      grid-template-columns: repeat(3, 1fr);
    }

    &--cols-4 {
      grid-template-columns: repeat(4, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  &__gallery-item {
    margin: 0;

    img {
      width: 100%;
      height: 250px;
      object-fit: cover;
      border-radius: 8px;
    }

    figcaption {
      font-size: 0.875rem;
      color: $color-text-light;
      text-align: center;
      margin-top: 0.5rem;
    }
  }

  &__cta-section {
    min-height: 400px;
    background-size: cover;
    background-position: center;
    background-color: $color-primary;
    display: flex;
    align-items: center;
  }

  &__cta-overlay {
    width: 100%;
    padding: 4rem 0;
    background: rgba(0, 0, 0, 0.5);
  }

  &__cta-title {
    font-family: $font-heading;
    font-size: 2.5rem;
    color: white;
    text-align: center;
    margin-bottom: 1rem;
  }

  &__cta-description {
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
    font-size: 1.125rem;
    max-width: 600px;
    margin: 0 auto 2rem;
  }

  &__cta-button {
    display: inline-block;
    background: $color-primary;
    color: white;
    padding: 1rem 2rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: background-color 0.2s ease;
    margin: 0 auto;

    &:hover {
      background: darken($color-primary, 10%);
    }
  }

  &__hero-section {
    min-height: 60vh;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  &__hero-headline {
    font-family: $font-heading;
    font-size: 3rem;
    color: white;
    margin-bottom: 1rem;
  }

  &__hero-subheadline {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.25rem;
    margin-bottom: 2rem;
  }

  &__hero-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__hero-cta {
    padding: 1rem 2rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: all 0.2s ease;

    &--primary {
      background: $color-primary;
      color: white;

      &:hover {
        background: darken($color-primary, 10%);
      }
    }

    &--secondary {
      background: transparent;
      color: white;
      border: 2px solid white;

      &:hover {
        background: white;
        color: $color-text;
      }
    }
  }

  &__empty {
    padding: 4rem 0;
    text-align: center;
    color: $color-text-light;
  }
}
</style>
