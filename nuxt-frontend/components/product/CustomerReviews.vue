<template>
    <section id="reviews" class="customer-reviews">
        <div class="container">
            <div class="reviews-grid">
                <!-- LEFT COLUMN: Rating Summary -->
                <div class="left-column">
                    <div class="header-with-button">
                        <h2 class="section-title">CUSTOMER REVIEWS</h2>
                    </div>

                    <!-- Overall Rating with Stars -->
                    <div class="overall-rating">
                        <div class="rating-holder">
                            <NuxtRating :rating-value="averageRating" :read-only="true" :rating-size="24"
                                :rating-count="5" active-color="#007ba7" inactive-color="#fff" border-color="#007ba7"
                                :border-width="2" />
                            <div class="rating-text">
                                <span class="rating-value">{{ averageRating.toFixed(1) }} OUT OF 5</span>
                            </div>
                        </div>
                        <span class="rating-count">{{ reviews.length.toLocaleString() }} GLOBAL RATINGS</span>
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

                    <button v-if="filteredReviews.length > 0 && !isLoading" class="write-review-btn" @click="openReviewModal">
                        <FontAwesomeIcon :icon="['fas', 'pen']" />
                        WRITE A REVIEW
                    </button>

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

                    <!-- No Reviews Message -->
                    <div v-if="filteredReviews.length === 0 && !isLoading" class="no-reviews">
                        <p>Love at first pour? Tell us about it! Be the first to leave a review.</p>
                        <button class="btn btn-primary" @click="openReviewModal"><FontAwesomeIcon :icon="['fas', 'pen']" />Write the First Review</button>
                    </div>

                    <!-- Reviews List -->
                    <div v-else class="reviews-list">
                        <ReviewItem 
                            v-for="review in displayedReviews" 
                            :key="review.id" 
                            :review="review"
                            :has-marked-helpful="helpfulReviews.has(review.id)"
                            @mark-helpful="markAsHelpful"
                            @open-gallery="openImageGallery"
                        />
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

        <!-- Toast Notification -->
        <Transition name="toast">
            <div v-if="toastVisible" class="toast-notification">
                <FontAwesomeIcon :icon="['fas', 'check-circle']" class="toast-icon" />
                <span>{{ toastMessage }}</span>
            </div>
        </Transition>

        <!-- Write Review Modal -->
        <WriteReviewModal :is-open="isReviewModalOpen" :product-id="productId" @close="closeReviewModal"
            @success="handleReviewSuccess" />

        <!-- Image Gallery Modal -->
        <Teleport to="body">
            <Transition name="fade">
                <div v-if="galleryImages.length > 0" class="gallery-overlay" @click.self="closeGallery">
                    <div class="gallery-container">
                        <button class="gallery-close" @click="closeGallery">
                            <FontAwesomeIcon :icon="['fas', 'times']" />
                        </button>
                        <button v-if="galleryImages.length > 1" class="gallery-nav prev" @click="previousImage">
                            <FontAwesomeIcon :icon="['fas', 'chevron-left']" />
                        </button>
                        <img :src="getStrapiMediaUrl(galleryImages[currentImageIndex])"
                            :alt="galleryImages[currentImageIndex].alternativeText || 'Review image'"
                            class="gallery-image" />
                        <button v-if="galleryImages.length > 1" class="gallery-nav next" @click="nextImage">
                            <FontAwesomeIcon :icon="['fas', 'chevron-right']" />
                        </button>
                        <div v-if="galleryImages.length > 1" class="gallery-counter">
                            {{ currentImageIndex + 1 }} / {{ galleryImages.length }}
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { CustomerReview, StrapiMedia } from "~/types/strapi";
import WriteReviewModal from "./WriteReviewModal.vue";
import ReviewItem from "../reviews/ReviewItem.vue";

interface CustomerReviewsProps {
    productId: string;
    initialCount?: number;
    loadMoreCount?: number;
    showViewAll?: boolean;
    isViewAllPage?: boolean;
}

const props = withDefaults(defineProps<CustomerReviewsProps>(), {
    initialCount: 2,
    loadMoreCount: 3,
    showViewAll: true,
    isViewAllPage: false,
});

const { fetchProductReviews, markReviewHelpful } = useCustomerReviews();
const { getStrapiMediaUrl } = useStrapi();

const reviews = ref<CustomerReview[]>([]);
const displayedReviews = ref<CustomerReview[]>([]);
const isLoading = ref(false);
const isReviewModalOpen = ref(false);
const helpfulReviews = ref(new Set<number>());
const currentPage = ref(1);
const selectedStar = ref<number | null>(null);

// Image gallery
const galleryImages = ref<StrapiMedia[]>([]);
const currentImageIndex = ref(0);

// Computed
const averageRating = computed(() => {
    if (reviews.value.length === 0) return 0;
    const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.value.length).toFixed(1));
});

const canLoadMore = computed(() => {
    return displayedReviews.value.length < filteredReviews.value.length;
});

const filteredReviews = computed(() => {
    if (!selectedStar.value) return reviews.value;
    return reviews.value.filter(r => r.rating === selectedStar.value);
});

const viewAllUrl = computed(() => {
    return `/shop-coffee/reviews/${props.productId}`;
});

// Methods
function getPercentage(star: number): number {
    if (reviews.value.length === 0) return 0;
    const count = reviews.value.filter(r => r.rating === star).length;
    return Math.round((count / reviews.value.length) * 100);
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
const loadReviews = async () => {
    isLoading.value = true;
    try {
        reviews.value = await fetchProductReviews(props.productId);
        updateDisplayedReviews();
    } catch (error) {
        console.error("Error loading reviews:", error);
    } finally {
        isLoading.value = false;
    }
};

// Open review modal
const openReviewModal = () => {
    isReviewModalOpen.value = true;
};

// Close review modal
const closeReviewModal = () => {
    isReviewModalOpen.value = false;
};

// Handle review success
const handleReviewSuccess = () => {
    // Close modal first
    closeReviewModal();

    // Show toast notification
    showSuccessToast("Thank you for your review! Your review has been published successfully.");

    // Reload reviews to show the new one
    loadReviews();
};

// Toast notification system
const toastVisible = ref(false);
const toastMessage = ref("");

const showSuccessToast = (message: string) => {
    toastMessage.value = message;
    toastVisible.value = true;

    setTimeout(() => {
        toastVisible.value = false;
    }, 5000);
};

// Mark review as helpful
const markAsHelpful = async (review: CustomerReview) => {
    if (helpfulReviews.value.has(review.id)) return;

    const success = await markReviewHelpful(review.documentId, review.helpfulCount);
    if (success) {
        helpfulReviews.value.add(review.id);
        review.helpfulCount++;
        
        // Store in cookie to persist across sessions and prevent multiple votes
        // Cookie expires in 365 days
        const helpfulCookie = useCookie<number[]>('helpful-reviews', {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            sameSite: 'lax'
        });
        
        const currentHelpful = helpfulCookie.value || [];
        if (!currentHelpful.includes(review.id)) {
            helpfulCookie.value = [...currentHelpful, review.id];
        }
    }
};

// Image gallery functions
const openImageGallery = (images: StrapiMedia[], index: number) => {
    galleryImages.value = images;
    currentImageIndex.value = index;
};

const closeGallery = () => {
    galleryImages.value = [];
    currentImageIndex.value = 0;
};

const nextImage = () => {
    currentImageIndex.value = (currentImageIndex.value + 1) % galleryImages.value.length;
};

const previousImage = () => {
    currentImageIndex.value =
        (currentImageIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length;
};

// Watch for filter changes
watch(filteredReviews, () => {
    updateDisplayedReviews();
});

// Load helpful reviews from cookie
const loadHelpfulReviews = () => {
    const helpfulCookie = useCookie<number[]>('helpful-reviews', {
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax'
    });
    
    const helpfulIds = helpfulCookie.value || [];
    helpfulIds.forEach(id => {
        helpfulReviews.value.add(id);
    });
};

// Load reviews and helpful state
onMounted(() => {
    loadReviews();
    loadHelpfulReviews();
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

.header-with-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    gap: 1rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 0;
    color: $color-text;
    letter-spacing: 0.5px;
    line-height: 1.2;

    @media (max-width: 768px) {
        font-size: 1.25rem;
    }
}

.write-review-btn {
    background: $color-primary;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    white-space: nowrap;
    margin: 0 auto;

    &:hover {
        background: $color-primary-dark;
        transform: translateY(-2px);
    }

    svg {
        font-size: 0.875rem;
    }

    @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
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
        width: 1rem;
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
    border-radius: 8px;

    .btn-primary {
        align-items: center;
        background: $color-primary;
        color: white;
        padding: 1rem 2rem;
        border-radius: 25px;
        text-decoration: none;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;
        margin-top: 1rem;

        svg {
            display: flex;
            width: 1rem;
        }

        &:hover {
            background: $color-primary-dark;
            transform: translateY(-2px);
        }
    }
}

.reviews-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

// Gallery styles
.gallery-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 2rem;
}

.gallery-container {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;

    .gallery-image {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 4px;
    }

    .gallery-close {
        position: absolute;
        top: 0;
        right: -4rem;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.5rem;
        transition: background 0.2s;

        svg {
            width: 20px;
        }

        &:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    }

    .gallery-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.5rem;
        transition: background 0.2s;

        svg {
            width: 20px;
        }

        &:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        &.prev {
            left: -4rem;
        }

        &.next {
            right: -4rem;
        }
    }

    .gallery-counter {
        position: absolute;
        bottom: -2.5rem;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 0.875rem;
    }
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
    border: none;
    cursor: pointer;

    &:hover {
        background: $color-primary-dark;
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    svg {
        width: 20px;
    }
}

// Toast Notification
.toast-notification {
    position: fixed;
    top: 100px;
    right: 2rem;
    background: #10b981;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 10001;
    font-weight: 600;
    max-width: 400px;

    .toast-icon {
        font-size: 1.25rem;
        flex-shrink: 0;
    }
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 768px) {
    .toast-notification {
        right: 1rem;
        left: 1rem;
        max-width: calc(100% - 2rem);
    }

    .gallery-container {
        .gallery-nav {
            &.prev {
                left: 0;
            }

            &.next {
                right: 0;
            }
        }
    }
}
</style>
