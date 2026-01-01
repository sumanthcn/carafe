<template>
  <article class="review-item">
    <div class="review-header">
      <div class="reviewer-info">
        <div class="reviewer-avatar">
          {{ review.name.charAt(0).toUpperCase() }}
        </div>
        <div class="reviewer-details">
          <h4 class="reviewer-name">
            {{ review.name }}
            <span v-if="review.isVerifiedPurchase" class="verified-badge">
              <FontAwesomeIcon :icon="['fas', 'check-circle']" />
              Verified Purchase
            </span>
          </h4>
          <div class="review-meta">
            <NuxtRating 
              :rating-value="review.rating" 
              :read-only="true"
              :rating-size="16" 
              :rating-count="5"
              active-color="#007ba7" 
              inactive-color="#fff" 
              border-color="#007ba7"
              :border-width="2"
            />
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="review-content">
      <h5 v-if="review.reviewTitle" class="review-title">{{ review.reviewTitle }}</h5>
      <p v-if="review.reviewDescription" class="review-text">{{ review.reviewDescription }}</p>

      <!-- Review Images -->
      <div v-if="review.images && review.images.length > 0" class="review-media">
        <div class="review-images">
          <button 
            v-for="(image, index) in review.images" 
            :key="image.id" 
            class="review-image"
            @click="$emit('open-gallery', review.images, index)"
          >
            <img :src="getStrapiMediaUrl(image)" :alt="image.alternativeText || 'Review image'" />
          </button>
        </div>
      </div>

      <!-- Review Video -->
      <div v-if="review.video" class="review-video">
        <video :src="getStrapiMediaUrl(review.video)" controls></video>
      </div>
    </div>

    <div class="review-footer">
      <span class="helpful-count" v-if="review.helpfulCount > 0">
        {{ review.helpfulCount }} {{ review.helpfulCount === 1 ? 'person' : 'people' }} found this helpful
      </span>
      
      <div class="review-actions">
        <button 
          @click="$emit('mark-helpful', review)" 
          class="action-button"
          :class="{ active: hasMarkedHelpful }"
          :disabled="hasMarkedHelpful"
        >
          <FontAwesomeIcon :icon="['fas', 'thumbs-up']" />
          Helpful
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { CustomerReview } from "~/types/strapi";

interface ReviewItemProps {
  review: CustomerReview;
  hasMarkedHelpful?: boolean;
}

const props = withDefaults(defineProps<ReviewItemProps>(), {
  hasMarkedHelpful: false,
});

defineEmits<{
  'mark-helpful': [review: CustomerReview];
  'open-gallery': [images: any[], index: number];
}>();

const { getStrapiMediaUrl } = useStrapi();

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.review-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
}

.review-header {
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007ba7 0%, #005f85 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.reviewer-details {
  flex: 1;
}

.reviewer-name {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #059669;
  background: #d1fae5;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;

  svg {
    width: 14px;
    height: 14px;
  }
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.review-date {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.review-content {
  margin-bottom: 1rem;
}

.review-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.review-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #4b5563;
  font-weight: 500;
  margin: 0 0 1rem 0;
}

.review-media {
  margin: 1rem 0;
}

.review-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.review-image {
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  padding: 0;
  background: none;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.review-video {
  margin-top: 1rem;

  video {
    width: 100%;
    max-width: 500px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
  }
}

.review-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.helpful-count {
  font-size: 0.875rem;
  color: $color-text;
  font-weight: 600;
}

.review-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  padding: 0.5rem 1.25rem;
  border: 1px solid #d1d5db;
  border-radius: 50px;
  background: white;
  color: #6b7280;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover:not(:disabled) {
    border-color: $color-primary-dark;
    color: $color-primary-dark;
    background: #f0f8fb;
  }

  &.active {
    border-color: var(--brand-color, #8b4513);
    background: var(--brand-color, #8b4513);
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
