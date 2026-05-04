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

      <!-- Menu Section -->
      <section v-if="visitCafeData.menuSection" id="menu-section" class="menu-section">
        <div class="container">
          <h2 class="menu-section__title">{{ visitCafeData.menuSection.title }}</h2>
          <p v-if="visitCafeData.menuSection.description" class="menu-section__description">
            {{ visitCafeData.menuSection.description }}
          </p>

          <div
            v-if="visitCafeData.menuSection.items && visitCafeData.menuSection.items.length > 0"
            class="menu-section__files"
          >
            <div
              v-for="item in visitCafeData.menuSection.items"
              :key="item.id"
              class="menu-file-item"
              @click="item.file && handleMenuFileClick(item)"
            >
              <!-- Image thumbnail -->
              <template v-if="item.file && isImage(item.file)">
                <div class="menu-file-item__thumb">
                  <img
                    :src="getStrapiMediaUrl(item.file)"
                    :alt="item.file.alternativeText || item.title"
                    class="menu-file-item__img"
                    loading="lazy"
                  />
                  <div class="menu-file-item__overlay">
                    <span class="menu-file-item__zoom-icon">&#128269;</span>
                  </div>
                </div>
              </template>

              <!-- PDF item -->
              <template v-else-if="item.file">
                <div class="menu-file-item__pdf">
                  <span class="menu-file-item__pdf-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5c0 .83-.67 1.5-1.5 1.5H7v2H5.5V8H8c.83 0 1.5.67 1.5 1.5v2zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V8H13c.83 0 1.5.67 1.5 1.5v4zm4-4H17v1h1.5V12H17v2h-1.5V8h3v1.5zM7 9.5h1v1H7v-1zM11 9.5h1v3h-1v-3z"/>
                    </svg>
                  </span>
                  <div class="menu-file-item__pdf-label">PDF</div>
                </div>
              </template>

              <!-- No file placeholder -->
              <template v-else>
                <div class="menu-file-item__pdf menu-file-item__pdf--empty">
                  <div class="menu-file-item__pdf-label">No file</div>
                </div>
              </template>

              <p class="menu-file-item__name">{{ item.title }}</p>
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
            <div
              v-for="group in groupedOpeningHours"
              :key="group.label"
              class="hours-card"
            >
              <h3>{{ group.label }}</h3>
              <p>{{ group.hours }}</p>
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

      <!-- Image Lightbox Popup -->
      <Teleport to="body">
        <div v-if="lightbox.open" class="lightbox-overlay" @click.self="closeLightbox">
          <div class="lightbox-modal">
            <button class="lightbox-close" @click="closeLightbox" aria-label="Close">&#215;</button>
            <button
            v-if="lightboxHasPrev"
            class="lightbox-nav lightbox-nav--prev"
            @click="prevLightboxImage"
            aria-label="Previous"
          >&#8249;</button>
          <div
            class="lightbox-zoom-wrapper"
            ref="zoomWrapper"
            :style="{ cursor: lightbox.scale > 1 ? (lightbox.dragging ? 'grabbing' : 'grab') : 'zoom-in' }"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
            @touchstart.passive="onTouchStart"
            @touchmove.prevent="onTouchMove"
            @touchend="onTouchEnd"
            @wheel.prevent="handleLightboxWheel"
            @click="cycleLightboxZoom"
          >
            <img
              :src="lightbox.src"
              :alt="lightbox.alt"
              class="lightbox-img"
              :style="{
                transform: `translate(${lightbox.translateX}px, ${lightbox.translateY}px) scale(${lightbox.scale})`,
                transition: lightbox.dragging ? 'none' : 'transform 0.2s ease',
              }"
              draggable="false"
            />
          </div>
          <button
            v-if="lightboxHasNext"
            class="lightbox-nav lightbox-nav--next"
            @click="nextLightboxImage"
            aria-label="Next"
          >&#8250;</button>
          <div class="lightbox-zoom-controls">
            <button @click="zoomOut" :disabled="lightbox.scale <= 1" aria-label="Zoom out">&#8722;</button>
            <span>{{ Math.round(lightbox.scale * 100) }}%</span>
            <button @click="zoomIn" :disabled="lightbox.scale >= 4" aria-label="Zoom in">&#43;</button>
            <button @click="resetZoom" aria-label="Reset zoom">Reset</button>
          </div>
        </div>
      </div>
      </Teleport>
    </div>

    <!-- Error State -->
    <div v-else class="error-container">
      <p>Unable to load page content. Please try again later.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VisitCafe, MenuItem } from "~/composables/useVisitCafe";

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

// Group consecutive days with identical hours for display
const groupedOpeningHours = computed(() => {
  const section = visitCafeData.value?.openingHoursSection;
  if (!section) return [];

  const days = [
    { key: 'sunday',    label: 'Sunday' },
    { key: 'monday',    label: 'Monday' },
    { key: 'tuesday',   label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday',  label: 'Thursday' },
    { key: 'friday',    label: 'Friday' },
    { key: 'saturday',  label: 'Saturday' },
  ] as const;

  const groups: { label: string; hours: string }[] = [];

  let i = 0;
  while (i < days.length) {
    const hours = section[days[i].key] || 'Closed';
    let j = i + 1;
    while (j < days.length && (section[days[j].key] || 'Closed') === hours) {
      j++;
    }
    const label =
      j - i === 1
        ? days[i].label
        : `${days[i].label} – ${days[j - 1].label}`;
    groups.push({ label: label.toUpperCase(), hours });
    i = j;
  }

  return groups;
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

// ─── Menu Section ────────────────────────────────────────────────────────────

const IMAGE_MIME_PREFIXES = ['image/'];

const isImage = (file: { mime?: string }): boolean => {
  return !!(file.mime && IMAGE_MIME_PREFIXES.some((p) => file.mime!.startsWith(p)));
};

// Lightbox state
const lightbox = reactive({
  open: false,
  src: '',
  alt: '',
  scale: 1,
  imageIndex: -1,
  // Pan state
  translateX: 0,
  translateY: 0,
  dragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragOriginX: 0,
  dragOriginY: 0,
});

const zoomWrapper = ref<HTMLElement | null>(null);

// Whether we moved enough to count as a drag (suppress click-to-zoom)
const dragMoved = ref(false);

// Only items that have an image file, used for lightbox navigation
const imageItems = computed(() =>
  (visitCafeData.value?.menuSection?.items ?? []).filter(
    (item) => item.file && isImage(item.file)
  )
);

const lightboxHasPrev = computed(() => lightbox.imageIndex > 0);
const lightboxHasNext = computed(() => lightbox.imageIndex < imageItems.value.length - 1);

const resetPan = () => {
  lightbox.translateX = 0;
  lightbox.translateY = 0;
};

const openLightbox = (item: MenuItem, index: number) => {
  if (!item.file) return;
  lightbox.src = getStrapiMediaUrl(item.file);
  lightbox.alt = item.file.alternativeText || item.title;
  lightbox.scale = 1;
  lightbox.imageIndex = index;
  lightbox.open = true;
  resetPan();
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightbox.open = false;
  lightbox.scale = 1;
  lightbox.imageIndex = -1;
  resetPan();
  document.body.style.overflow = '';
};

const prevLightboxImage = () => {
  if (!lightboxHasPrev.value) return;
  lightbox.imageIndex--;
  const item = imageItems.value[lightbox.imageIndex];
  lightbox.src = getStrapiMediaUrl(item.file!);
  lightbox.alt = item.file!.alternativeText || item.title;
  lightbox.scale = 1;
  resetPan();
};

const nextLightboxImage = () => {
  if (!lightboxHasNext.value) return;
  lightbox.imageIndex++;
  const item = imageItems.value[lightbox.imageIndex];
  lightbox.src = getStrapiMediaUrl(item.file!);
  lightbox.alt = item.file!.alternativeText || item.title;
  lightbox.scale = 1;
  resetPan();
};

const zoomIn = () => { lightbox.scale = Math.min(lightbox.scale + 0.5, 4); };
const zoomOut = () => {
  lightbox.scale = Math.max(lightbox.scale - 0.5, 1);
  if (lightbox.scale <= 1) resetPan();
};
const resetZoom = () => { lightbox.scale = 1; resetPan(); };

const cycleLightboxZoom = () => {
  if (dragMoved.value) return; // suppress click when a drag just ended
  if (lightbox.scale < 2) { lightbox.scale = 2; }
  else if (lightbox.scale < 4) { lightbox.scale = 4; }
  else { lightbox.scale = 1; resetPan(); }
};

const handleLightboxWheel = (e: WheelEvent) => {
  const delta = e.deltaY > 0 ? -0.25 : 0.25;
  lightbox.scale = Math.min(4, Math.max(1, lightbox.scale + delta));
  if (lightbox.scale <= 1) resetPan();
};

// ── Drag-to-pan ──────────────────────────────────────────────────────────────
const onDragStart = (clientX: number, clientY: number) => {
  if (lightbox.scale <= 1) return;
  lightbox.dragging = true;
  dragMoved.value = false;
  lightbox.dragStartX = clientX;
  lightbox.dragStartY = clientY;
  lightbox.dragOriginX = lightbox.translateX;
  lightbox.dragOriginY = lightbox.translateY;
};

const onDragMove = (clientX: number, clientY: number) => {
  if (!lightbox.dragging) return;
  const dx = clientX - lightbox.dragStartX;
  const dy = clientY - lightbox.dragStartY;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved.value = true;
  lightbox.translateX = lightbox.dragOriginX + dx;
  lightbox.translateY = lightbox.dragOriginY + dy;
};

const onDragEnd = () => {
  lightbox.dragging = false;
  // Keep dragMoved true until after the click event that follows mouseup fires.
  // nextTick is not enough — click fires after mouseup in the same microtask queue
  // so we need a macrotask (setTimeout) to let the click handler run first.
  if (dragMoved.value) {
    setTimeout(() => { dragMoved.value = false; }, 50);
  }
};

// Mouse events
const onMouseDown = (e: MouseEvent) => { e.preventDefault(); onDragStart(e.clientX, e.clientY); };
const onMouseMove = (e: MouseEvent) => { onDragMove(e.clientX, e.clientY); };
const onMouseUp = () => { onDragEnd(); };

// Touch events
const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length !== 1) return;
  onDragStart(e.touches[0].clientX, e.touches[0].clientY);
};
const onTouchMove = (e: TouchEvent) => {
  if (e.touches.length !== 1) return;
  e.preventDefault();
  onDragMove(e.touches[0].clientX, e.touches[0].clientY);
};
const onTouchEnd = () => { onDragEnd(); };

const handleMenuFileClick = (item: MenuItem) => {
  if (!item.file) return;
  if (isImage(item.file)) {
    const idx = imageItems.value.findIndex((i) => i.id === item.id);
    openLightbox(item, idx);
  } else {
    // PDF or other file – open in new tab
    window.open(getStrapiMediaUrl(item.file), '_blank', 'noopener,noreferrer');
  }
};

// Close lightbox on Escape key
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

const handleKeydown = (e: KeyboardEvent) => {
  if (!lightbox.open) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') prevLightboxImage();
  if (e.key === 'ArrowRight') nextLightboxImage();
};

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

    @media (max-width: 767px) {
      padding: 0;
    }
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
  padding: 80px 30px;
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
    max-width: 980px;
    text-align: center;
    padding-right: 20px;
    padding-left: 20px;
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
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
  }

  .hours-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    padding: 32px 16px;
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

    @media (max-width: 767px) {
      gap: 0;
    }

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
          // width: 50px;
          // height: 50px;
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
        max-width: 100%;
      }

      p {
        margin: 0;
      }
    }
  }
}

// ─── Menu Section ─────────────────────────────────────────────────────────────
.menu-section {
  padding: 80px 60px;
  background: $color-background;

  @media (max-width: 991px) {
    padding: 60px 40px;
  }

  @media (max-width: 767px) {
    padding: 48px 20px;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__title {
    font-family: $font-heading;
    font-size: $font-size-4xl;
    font-weight: 700;
    color: $color-text;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 1.25rem;

    @media (max-width: 991px) {
      font-size: $font-size-3xl;
    }

    @media (max-width: 767px) {
      font-size: $font-size-2xl;
    }
  }

  &__description {
    font-family: $font-body;
    font-size: $font-size-lg;
    color: $color-text-light;
    text-align: center;
    line-height: 1.7;
    max-width: 680px;
    margin: 0 auto 1rem;
  }

  &__files {
    display: grid;
    gap: 1.5rem;
    grid-template-columns: repeat(2, 1fr);

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

// Menu file items
.menu-file-item {
  cursor: pointer;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 0.5rem;
  border-radius: 12px;
  padding: 0.5rem;
  transition: background 0.2s ease;

  &:hover {
    background: $color-background-alt;
  }

  &__thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    overflow: hidden;
    background: $color-gray-100;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    display: block;
    transition: transform 0.3s ease;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.25s ease;
  }

  &__zoom-icon {
    font-size: 2rem;
    opacity: 0;
    color: white;
    text-shadow: 0 2px 8px rgba(0,0,0,0.4);
    transition: opacity 0.25s ease;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
  }

  &__thumb:hover &__overlay {
    background: rgba(0, 0, 0, 0.35);
  }

  &__thumb:hover &__img {
    transform: scale(1.05);
  }

  &__thumb:hover &__zoom-icon {
    opacity: 1;
  }

  &__pdf {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 10px;
    background: $color-background-alt;
    border: 2px dashed $color-border;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: border-color 0.2s ease, background 0.2s ease;

    &:hover {
      border-color: $color-primary;
      background: lighten($color-primary, 50%);
    }
  }

  &__pdf-icon {
    color: $color-primary;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__pdf-label {
    font-family: $font-heading;
    font-size: $font-size-xs;
    font-weight: 700;
    letter-spacing: 1px;
    color: $color-primary;
    text-transform: uppercase;
  }

  &__name {
    font-family: $font-body;
    font-size: 1.4rem;
    color: $color-text-light;
    font-weight: bold;
    text-align: center;
    line-height: 1.4;
    word-break: break-word;
    max-width: 100%;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.lightbox-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95vw;
  max-width: 1400px;
  max-height: 95vh;
}

.lightbox-close {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  font-size: 1.75rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  z-index: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.lightbox-zoom-wrapper {
  overflow: hidden;
  width: 100%;
  max-height: 88vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* cursor is set dynamically via :style */
  user-select: none;
}

.lightbox-img {
  max-width: 95vw;
  max-height: 88vh;
  width: 100%;
  object-fit: contain;
  transform-origin: center center;
  user-select: none;
  pointer-events: none; /* drag handled on wrapper, click bubbles up */
  display: block;
  border-radius: 6px;
}

.lightbox-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  color: white;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  z-index: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &--prev {
    left: 1rem;
  }

  &--next {
    right: 1rem;
  }
}

.lightbox-zoom-controls {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50px;
  padding: 0.5rem 1.25rem;
  backdrop-filter: blur(8px);

  button {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.4);
    color: white;
    border-radius: 6px;
    padding: 0.2rem 0.6rem;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.15s ease;

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    &:not(:disabled):hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  span {
    color: rgba(255, 255, 255, 0.85);
    font-size: $font-size-sm;
    min-width: 48px;
    text-align: center;
    font-family: $font-body;
  }
}
</style>
