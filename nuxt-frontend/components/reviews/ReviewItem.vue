<template>
  <article class="review-item">
    <div class="review-header">
      <div class="reviewer-info">
        <div class="reviewer-avatar">
          <FontAwesomeIcon :icon="['fas', 'user']" />
        </div>
        <div class="reviewer-name">{{ review.customerName || review.user?.username || 'Anonymous' }}</div>
      </div>
    </div>

    <div class="review-rating-row">
      <NuxtRating
        :rating-value="review.rating"
        :read-only="true"
        :rating-size="18"
        :rating-count="5"
        active-color="#007ba7"
        inactive-color="#fff"
        border-color="#007ba7"
        :border-width="2"
      />
      <h5 v-if="review.reviewTitle" class="review-title">{{ review.reviewTitle }}</h5>
    </div>

    <div class="review-meta">
      <span class="review-date">Reviewed in the United Kingdom on {{ formatDate(review.createdAt) }}</span>
    </div>

    <div v-if="review.reviewText" class="review-content">
      <div class="review-details">
        <span class="detail-label">Flavour Name:</span>
        <span class="detail-value">Colombian</span>
        <span class="detail-separator">|</span>
        <span class="detail-label">Size Name:</span>
        <span class="detail-value">500 g (Pack of 2)</span>
        <span v-if="review.isVerifiedPurchase" class="verified-badge">
          <FontAwesomeIcon :icon="['fas', 'check-circle']" />
          Verified Purchase
        </span>
      </div>
      <p class="review-text">{{ review.reviewText }}</p>
    </div>

    <div class="review-footer">
      <span class="helpful-count" v-if="helpfulCount > 0">{{ helpfulCount }} {{ helpfulCount === 1 ? 'person' : 'people' }} found this helpful</span>
      
      <div class="review-actions">
        <button 
          @click="markHelpful" 
          class="action-button"
          :class="{ active: hasMarkedHelpful }"
          :disabled="hasMarkedHelpful"
        >
          Helpful
        </button>
        <button 
          @click="reportReview" 
          class="action-button"
          :disabled="hasReported"
        >
          Report
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ProductReview } from "~/composables/useProductReviews";

interface ReviewItemProps {
  review: ProductReview;
}

const props = defineProps<ReviewItemProps>();

const hasMarkedHelpful = ref(false);
const hasReported = ref(false);
const helpfulCount = ref(props.review.isHelpful || 0);

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

function markHelpful() {
  if (!hasMarkedHelpful.value) {
    hasMarkedHelpful.value = true;
    helpfulCount.value++;
    // TODO: API call to increment helpful count
  }
}

function reportReview() {
  if (!hasReported.value) {
    hasReported.value = true;
    // TODO: API call to report review
  }
}
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.review-item {
  background: white;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007ba7 0%, #005f85 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  flex-shrink: 0;

  svg {
    width: 50%;
  }
}

.reviewer-name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: $color-text;
}

.review-rating-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.review-title {
  font-size: 1rem;
  font-weight: 700;
  color: $color-text;
  margin: 0;
}

.review-meta {
  font-size: $font-size-sm;
  color: $color-text;
  margin-bottom: 0.75rem;
}

.review-date {
  font-weight: 500;
}

.review-content {
  margin-bottom: 1rem;
}

.review-details {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: $font-size-sm;
  margin-bottom: 0.75rem;
  color: $color-text;
}

.detail-label {
  font-weight: bold;
  color: $color-text;
}

.detail-value {
  color: $color-text;
}

.detail-separator {
  color: $color-gray-400;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: $color-primary-dark;
  font-weight: bold;

  svg {
    width: 40px;
    height: 40px;
  }
}

.review-text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: $color-text;
  font-weight: 500;
  margin: 0;
}

.review-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
}

.helpful-count {
  font-size: $font-size-sm;
  color: $color-text;
  font-weight: bold;
}

.review-actions {
  display: flex;
  gap: 1rem;
}

.action-button {
  padding: 0.5rem 1.25rem;
  border: 1px solid #ddd;
  border-radius: 50px;
  background: white;
  color: #666;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: $color-primary-dark;
    color: $color-primary-dark;
    background: #f0f8fb;
  }

  &.active {
    border-color: $color-primary-dark;
    background: $color-primary-dark;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
