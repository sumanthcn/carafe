<template>
  <div class="review-form">
    <h3 class="review-form__title">Write a Review</h3>
    
    <form @submit.prevent="handleSubmit">
      <!-- Rating Input -->
      <div class="form-group">
        <label for="rating" class="form-label">Your Rating *</label>
        <NuxtRating
          v-model="formData.rating"
          :rating-size="32"
          :rating-count="5"
          active-color="#ffc107"
          inactive-color="#ddd"
          :read-only="false"
        />
        <span v-if="errors.rating" class="error-message">{{ errors.rating }}</span>
      </div>

      <!-- Review Title -->
      <div class="form-group">
        <label for="title" class="form-label">Review Title *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          class="form-input"
          placeholder="Give your review a title"
          :class="{ 'has-error': errors.title }"
        />
        <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
      </div>

      <!-- Review Text -->
      <div class="form-group">
        <label for="review" class="form-label">Your Review *</label>
        <textarea
          id="review"
          v-model="formData.reviewText"
          class="form-textarea"
          rows="5"
          placeholder="Share your experience with this product"
          :class="{ 'has-error': errors.reviewText }"
        ></textarea>
        <span v-if="errors.reviewText" class="error-message">{{ errors.reviewText }}</span>
      </div>

      <!-- Submit Button -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Review' }}
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
interface ReviewFormData {
  rating: number;
  title: string;
  reviewText: string;
}

interface ReviewFormErrors {
  rating?: string;
  title?: string;
  reviewText?: string;
}

const props = defineProps<{
  productId: number;
}>();

const emit = defineEmits<{
  submitted: [void];
}>();

const formData = ref<ReviewFormData>({
  rating: 0,
  title: '',
  reviewText: '',
});

const errors = ref<ReviewFormErrors>({});
const isSubmitting = ref(false);
const successMessage = ref('');

function validateForm(): boolean {
  errors.value = {};
  
  if (formData.value.rating === 0) {
    errors.value.rating = 'Please select a rating';
  }
  
  if (!formData.value.title.trim()) {
    errors.value.title = 'Please provide a title';
  }
  
  if (!formData.value.reviewText.trim()) {
    errors.value.reviewText = 'Please write a review';
  } else if (formData.value.reviewText.trim().length < 10) {
    errors.value.reviewText = 'Review must be at least 10 characters';
  }
  
  return Object.keys(errors.value).length === 0;
}

async function handleSubmit() {
  if (!validateForm()) {
    return;
  }
  
  isSubmitting.value = true;
  successMessage.value = '';
  
  try {
    // TODO: Implement actual API call using useProductReviews composable
    // const { submitReview } = useProductReviews();
    // await submitReview({
    //   productId: props.productId,
    //   rating: formData.value.rating,
    //   reviewTitle: formData.value.title,
    //   reviewText: formData.value.reviewText,
    // });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    successMessage.value = 'Thank you for your review! It will be published after verification.';
    
    // Reset form
    formData.value = {
      rating: 0,
      title: '',
      reviewText: '',
    };
    
    emit('submitted');
  } catch (error: any) {
    errors.value.reviewText = error.message || 'Failed to submit review';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.review-form {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: #333;
  }
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  
  &:focus {
    outline: none;
    border-color: $color-primary;
  }
  
  &.has-error {
    border-color: #dc3545;
  }
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.error-message {
  display: block;
  margin-top: 0.5rem;
  color: #dc3545;
  font-size: 0.875rem;
}

.success-message {
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
  margin-top: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &-primary {
    background: $color-primary;
    color: white;
    
    &:hover:not(:disabled) {
      background: darken($color-primary, 10%);
    }
  }
}
</style>
