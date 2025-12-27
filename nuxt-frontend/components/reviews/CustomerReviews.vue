<template>
    <section id="reviews" class="customer-reviews">
        <div class="container">
            <div class="reviews-grid">
                <!-- LEFT COLUMN: Rating Summary -->
                <div class="left-column">
                    <h2 class="section-title">CUSTOMER REVIEWS</h2>

                    <!-- Overall Rating with Stars -->
                    <div class="overall-rating">
                        <div class="rating-holder">
                            <NuxtRating :rating-value="stats.averageRating" :read-only="true" :rating-size="24"
                                :rating-count="5" active-color="#007ba7" inactive-color="#fff" border-color="#007ba7"
                                :border-width="2" />
                            <div class="rating-text">
                                <span class="rating-value">{{ stats.averageRating.toFixed(1) }} OUT OF 5</span>
                            </div>
                        </div>
                        <span class="rating-count">{{ stats.totalReviews.toLocaleString() }} GLOBAL RATINGS</span>
                    </div>

                    <!-- Rating Distribution Bars -->
                    <div class="rating-distribution">
                        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="distribution-row">
                            <button @click="filterByStar(star)" class="star-label"
                                :class="{ active: selectedStar === star }">
                                {{ star }} STAR
                            </button>
                            <div class="progress-bar">
                                <div class="progress-fill" :style="{ width: `${getPercentage(star)}%` }"></div>
                            </div>
                            <span class="percentage">{{ getPercentage(star) }}%</span>
                        </div>
                    </div>

                    <!-- How are ratings calculated dropdown -->
                    <details class="rating-info">
                        <summary class="rating-info-toggle">
                            How are ratings calculated?
                            <FontAwesomeIcon :icon="['fas', 'chevron-down']" class="toggle-icon" />
                        </summary>
                        <div class="rating-info-content">
                            <p>To calculate the overall star rating and percentage breakdown by star, we don't use a
                                simple average. Instead, our system considers factors like when a review was left and if
                                the reviewer verified their purchase.</p>
                        </div>
                    </details>
                </div>

                <!-- RIGHT COLUMN: Reviews List -->
                <div class="right-column">
                    <ReviewItem v-for="review in displayedReviews" :key="review.id" :review="review" />

                    <!-- No Reviews Message -->
                    <div v-if="displayedReviews.length === 0 && !isLoading" class="no-reviews">
                        <p>No reviews {{ selectedStar ? `with ${selectedStar} stars` : 'available' }} yet.</p>
                    </div>

                    <!-- Load More Button -->
                    <div v-if="canLoadMore" class="load-more-container">
                        <button @click="loadMore" class="btn-load-more" :disabled="isLoading">
                            {{ isLoading ? 'LOADING...' : 'LOAD MORE REVIEWS' }}
                        </button>
                    </div>

                    <!-- View All Link -->
                    <div v-if="showViewAll && !isViewAllPage" class="view-all-container">
                        <NuxtLink :to="viewAllUrl" class="btn-view-all">
                            VIEW ALL REVIEWS
                            <FontAwesomeIcon :icon="['fas', 'arrow-right']" />
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
        <img src="../../assets/images/review_images.jpg" class="review-bg" />
    </section>
</template>

<script setup lang="ts">
import type { ProductReview, ReviewStats } from "~/composables/useProductReviews";
import ReviewItem from "~/components/reviews/ReviewItem.vue";

interface CustomerReviewsProps {
    productId?: number;
    initialCount?: number; // How many reviews to show initially (default: 2)
    loadMoreCount?: number; // How many to load on "Load More" (default: 3)
    showViewAll?: boolean; // Show "View All" button (default: true)
    isViewAllPage?: boolean; // If this is the dedicated reviews page
}

const props = withDefaults(defineProps<CustomerReviewsProps>(), {
    initialCount: 2,
    loadMoreCount: 3,
    showViewAll: true,
    isViewAllPage: false,
});

const { fetchReviewsByProduct, getRatingPercentage } = useProductReviews();

// State
const allReviews = ref<ProductReview[]>([]);
const displayedReviews = ref<ProductReview[]>([]);
const stats = ref<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
});
const isLoading = ref(false);
const currentPage = ref(1);
const selectedStar = ref<number | null>(null);

// Computed
const canLoadMore = computed(() => {
    return displayedReviews.value.length < filteredReviews.value.length;
});

const filteredReviews = computed(() => {
    if (!selectedStar.value) return allReviews.value;
    return allReviews.value.filter(r => r.rating === selectedStar.value);
});

const viewAllUrl = computed(() => {
    if (props.productId) {
        return `/shop-coffee/reviews/${props.productId}`;
    }
    return '/reviews';
});

// Methods
function getPercentage(star: number): number {
    return getRatingPercentage(
        stats.value.ratingDistribution[star as keyof typeof stats.value.ratingDistribution],
        stats.value.totalReviews
    );
}

function filterByStar(star: number) {
    if (selectedStar.value === star) {
        selectedStar.value = null;
    } else {
        selectedStar.value = star;
    }
    currentPage.value = 1;
    updateDisplayedReviews();
}

function updateDisplayedReviews() {
    const reviews = filteredReviews.value;
    const count = props.isViewAllPage
        ? currentPage.value * props.loadMoreCount
        : currentPage.value === 1
            ? props.initialCount
            : props.initialCount + (currentPage.value - 1) * props.loadMoreCount;

    displayedReviews.value = reviews.slice(0, count);
}

function loadMore() {
    currentPage.value++;
    updateDisplayedReviews();
}

// Load reviews
async function loadReviews() {
    if (!props.productId) return;

    isLoading.value = true;
    try {
        const data = await fetchReviewsByProduct(props.productId);
        allReviews.value = data.reviews;
        stats.value = {
            averageRating: data.stats.averageRating,
            totalReviews: data.stats.totalReviews,
            ratingDistribution: {
                5: data.stats.ratingDistribution['5'] || 0,
                4: data.stats.ratingDistribution['4'] || 0,
                3: data.stats.ratingDistribution['3'] || 0,
                2: data.stats.ratingDistribution['2'] || 0,
                1: data.stats.ratingDistribution['1'] || 0,
            }
        };
        updateDisplayedReviews();
    } catch (error) {
        console.error('Failed to load reviews:', error);
    } finally {
        isLoading.value = false;
    }
}

// Watch for filter changes
watch(filteredReviews, () => {
    updateDisplayedReviews();
});

// Initialize
onMounted(() => {
    if (props.productId) {
        loadReviews();
    }
});
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.customer-reviews {
    padding: 4rem 0 0;
    background: white;

    .review-bg {
        margin-top: 50px;
    }
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
}

.reviews-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 3rem;
    align-items: start;

    @media (max-width: 1024px) {
        grid-template-columns: 300px 1fr;
        gap: 2rem;
    }

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
}

// LEFT COLUMN STYLES
.left-column {
    position: sticky;
    top: 100px;

    @media (max-width: 768px) {
        position: static;
    }
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 1.5rem;
    color: $color-text;
    letter-spacing: 0.5px;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 1.25rem;
    }
}

.overall-rating {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-bottom: 2rem;

    .rating-holder {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-weight: bold;
    }
}

.rating-text {
    display: flex;
    flex-direction: column;
}

.rating-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: $color-text;
    text-transform: uppercase;
    margin: 0;
}

.rating-count {
    font-size: 0.875rem;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 0.25rem;
}

.rating-distribution {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.distribution-row {
    display: grid;
    grid-template-columns: 70px 1fr 50px;
    align-items: center;
    gap: 0.75rem;
}

.star-label {
    font-size: 0.8125rem;
    font-weight: 700;
    color: $color-text;
    text-transform: uppercase;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    white-space: nowrap;

    &:hover {
        background: rgba(0, 123, 167, 0.1);
        color: #007ba7;
    }

    &.active {
        background: #007ba7;
        color: white;
    }
}

.progress-bar {
    height: 30px;
    background: transparent;
    border: 2px solid $color-text;
    border-radius: 5px;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    height: 100%;
    background: $color-primary-dark;
    transition: width 0.3s ease;
}

.percentage {
    font-size: 0.8125rem;
    font-weight: 600;
    text-align: right;
}

.rating-info {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
}

.rating-info-toggle {
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-primary-dark;
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    user-select: none;

    &::-webkit-details-marker {
        display: none;
    }

    .toggle-icon {
        font-size: 0.75rem;
        transition: transform 0.3s ease;
    }
}

.rating-info[open] .toggle-icon {
    transform: rotate(180deg);
}

.rating-info-content {
    padding: 1rem 0 0.5rem;
    font-size: $font-size-sm;
    line-height: 1.6;
    font-weight: 500;
    color: $color-text;

    p {
        margin: 0;
    }
}

// RIGHT COLUMN STYLES
.right-column {
    min-height: 400px;
}

.no-reviews {
    text-align: center;
    padding: 3rem 1rem;
    color: #999;
    font-size: 1.125rem;
    background: #f9f9f9;
    border-radius: 8px;
}

.load-more-container,
.view-all-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}
.btn-load-more,
.btn-view-all {
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

  svg{
    width: 20px;
  }
}

// .btn-load-more,
// .btn-view-all {
//     padding: 0.875rem 2.5rem;
//     font-size: 0.9375rem;
//     font-weight: 700;
//     text-transform: uppercase;
//     border-radius: 50px;
//     cursor: pointer;
//     transition: all 0.3s ease;
//     text-decoration: none;
//     display: inline-flex;
//     align-items: center;
//     gap: 0.75rem;
// }

// .btn-load-more {
//     background: white;
//     color: $color-text;
//     border: 2px solid $color-text;

//     &:hover:not(:disabled) {
//         background: $color-text;
//         color: white;
//         transform: translateY(-2px);
//         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
//     }

//     &:disabled {
//         opacity: 0.5;
//         cursor: not-allowed;
//     }
// }

.btn-view-all {
    background: #007ba7;
    color: white;
    border: 2px solid #007ba7;

    &:hover {
        background: #005f85;
        border-color: #005f85;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 167, 0.3);
    }
}
</style>
