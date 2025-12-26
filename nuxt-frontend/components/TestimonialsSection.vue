<template>
  <section class="testimonials-section">
    <div class="container">
      <!-- Floating Customer Images Background -->
      <div class="testimonials-images">
        <img
          src="../assets/images/testimonial_bg.png"
          alt="Customer testimonials background"
          class="testimonials-bg-image"
        />
      </div>

      <!-- Section Header -->
      <div class="testimonials-header">
        <p class="testimonials-label">Testimonials</p>
        <h2 class="testimonials-title">WHAT OUR CUSTOMERS SAY</h2>
      </div>

      <!-- Testimonial Card with Carousel -->
      <div class="testimonials-carousel">
        <div class="testimonial-card" v-if="currentTestimonial">
          <Transition name="fade" mode="out-in">
            <div :key="currentIndex" class="testimonial-content">
              <blockquote class="testimonial-text">
                {{ currentTestimonial.reviewText }}
              </blockquote>

              <div class="testimonial-rating">
                <strong>{{ averageRating }}</strong> Rating on
                {{ currentTestimonial.source }}
              </div>
            </div>
          </Transition>
        </div>

        <!-- Pagination Dots -->
        <div class="testimonials-pagination" v-if="testimonials.length > 1">
          <button
            v-for="(testimonial, index) in testimonials"
            :key="`dot-${testimonial.id}`"
            class="pagination-dot"
            :class="{ active: index === currentIndex }"
            @click="goToSlide(index)"
            :aria-label="`Go to testimonial ${index + 1}`"
          ></button>
        </div>

        <!-- CTA Button -->
        <NuxtLink to="/reviews" class="btn-reviews">
          READ ALL REVIEWS
          <FontAwesomeIcon :icon="['fas', 'arrow-right']" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { CustomerTestimonial } from "~/types/strapi";

const config = useRuntimeConfig();
const strapiUrl = config.public.strapiUrl;
const { fetchFeaturedTestimonials, getAverageRating } = useTestimonials();

const testimonials = ref<CustomerTestimonial[]>([]);
const averageRating = ref<number>(4.9);
const currentIndex = ref(0);
const autoplayInterval = ref<NodeJS.Timeout | null>(null);

// Load testimonials on mount
onMounted(async () => {
  try {
    const { testimonials: data } = await fetchFeaturedTestimonials(10);
    testimonials.value = data;

    // Calculate average rating
    const rating = await getAverageRating();
    if (rating > 0) {
      averageRating.value = rating;
    }

    // Start autoplay
    startAutoplay();
  } catch (error) {
    console.error("Failed to load testimonials:", error);
  }
});

// Clean up autoplay on unmount
onUnmounted(() => {
  stopAutoplay();
});

const currentTestimonial = computed(() => {
  return testimonials.value[currentIndex.value] || null;
});

function goToSlide(index: number) {
  currentIndex.value = index;
  resetAutoplay();
}

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % testimonials.value.length;
}

function startAutoplay() {
  if (testimonials.value.length <= 1) return;
  autoplayInterval.value = setInterval(() => {
    nextSlide();
  }, 5000); // 5 seconds
}

function stopAutoplay() {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
}

function resetAutoplay() {
  stopAutoplay();
  startAutoplay();
}
</script>

<style lang="scss" scoped>
.testimonials-section {
  padding: 2rem 0;
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
}

// Floating Images Grid
.testimonials-images {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1200px;
  height: 350px;
  pointer-events: none;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.testimonials-bg-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  object-position: top center;
}

// Header
.testimonials-header {
  text-align: center;
  padding-top: 180px;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
}

.testimonials-label {
  font-size: 0.875rem;
  font-family: $font-family-heading;
  text-transform: capitalize;
  color: $color-text;
  font-weight: 600;
  letter-spacing: 1px;
  background-color: #f2f2f2;
  width: fit-content;
  margin: 0 auto;
  margin-bottom: 1rem;
  padding: 0.25rem 2rem;
  border-radius: 25px;
}

.testimonials-title {
  font-family: $font-family-heading;
  font-size: $font-size-3xl;
  font-weight: bold;
  text-transform: uppercase;
  color: $color-text;
  margin: 0;
  margin-top: 2rem;
}

// Carousel
.testimonials-carousel {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.testimonial-card {
  background: white;
  border-radius: 24px;
  padding: 2rem;
  max-width: 80%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  text-align: center;
  font-family: $font-family-heading;
  min-height: 190px;
}

// Fade transition animations
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.testimonial-text {
  font-size: 1.125rem;
  line-height: 1.3;
  color: $color-text;
  margin: 0 0 2rem 0;
  font-style: normal;
  line-clamp: 3;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Number of lines */
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  overflow: hidden;
}

.testimonial-rating {
  font-family: $font-family-heading;
  font-size: $font-size-xl;
  font-weight: bold;

  strong {
    color: $color-primary-light;
    font-weight: 700;
  }
}

// Pagination
.testimonials-pagination {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  position: absolute;
  flex-direction: column;
  left: 6%;
  top: 70px;
}

.pagination-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $color-primary;
  opacity: 0.4;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;

  &:hover {
    background: $color-primary-light;
    transform: scale(1.2);
  }

  &.active {
    opacity: 1;
    width: 12px;
  }
}

// CTA Button
.btn-reviews {
  display: inline-block;
  background: $color-primary;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-2px);
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

// Responsive
@media (max-width: 1024px) {
  .testimonials-images {
    height: 250px;
  }

  .testimonials-bg-image {
    max-height: 250px;
  }

  .testimonials-header {
    margin-top: 150px;
  }

  .testimonials-title {
    font-size: 2rem;
  }

  .testimonial-card {
    padding: 2rem 2.5rem;
  }
}

@media (max-width: 640px) {
  .testimonials-section {
    padding: 4rem 0;
  }

  .testimonials-images {
    height: 180px;
  }

  .testimonials-bg-image {
    max-height: 180px;
  }

  .testimonials-header {
    margin-top: 120px;
    margin-bottom: 2rem;
  }

  .testimonials-title {
    font-size: 1.5rem;
  }

  .testimonial-card {
    padding: 1.5rem;
    border-radius: 16px;
  }

  .testimonial-text {
    font-size: 1rem;
  }

  .btn-reviews {
    padding: 0.875rem 2rem;
    font-size: 0.75rem;
  }
}
</style>
