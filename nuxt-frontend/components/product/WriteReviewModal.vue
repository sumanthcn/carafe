<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Write a Review</h2>
            <button class="close-btn" @click="closeModal" aria-label="Close">
              <FontAwesomeIcon :icon="['fas', 'times']" />
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="review-form">

            <!-- First Row: Name & Email -->
            <div class="form-row">
              <div class="form-group">
                <label for="name">Name <span class="required">*</span></label>
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  required
                  placeholder="Your name"
                  :class="{ error: errors.name }"
                />
                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
              </div>
              <div class="form-group">
                <label for="email">Email <span class="required">*</span></label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  :class="{ error: errors.email }"
                  @blur="checkPurchaseStatus"
                />
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                <div v-if="isCheckingPurchase" class="checking-purchase">
                  <span class="spinner-small"></span> Checking purchase history...
                </div>
                <div v-if="isVerifiedPurchase" class="verified-purchase-badge">
                  <FontAwesomeIcon :icon="['fas', 'check-circle']" />
                  Verified Purchase - You've bought this product
                </div>
              </div>
            </div>

            <!-- Second Row: Review Title & Rating -->
            <div class="form-row">
              <div class="form-group">
                <label for="reviewTitle">Review Title <span class="required">*</span></label>
                <input
                  id="reviewTitle"
                  v-model="formData.reviewTitle"
                  type="text"
                  required
                  placeholder="Sum up your experience"
                  :class="{ error: errors.reviewTitle }"
                />
                <span v-if="errors.reviewTitle" class="error-message">{{ errors.reviewTitle }}</span>
              </div>
              <div class="form-group">
                <label>Rating <span class="required">*</span></label>
                <NuxtRating
                  :rating-value="formData.rating"
                  @rating-selected="(rating) => formData.rating = rating"
                  :rating-count="5"
                  :rating-size="24"
                  :border-width="2" 
                  :rating-spacing="5"
                  :read-only="false"
                  :rating-step="1"
                  active-color="#007ba7"
                  inactive-color="#fff"
                  border-color="#007ba7"
                />
                <span v-if="errors.rating" class="error-message">{{ errors.rating }}</span>
              </div>
            </div>


            <!-- Third Row: Review Description -->
            <div class="form-group">
              <label for="reviewDescription">Your Review <span class="required">*</span></label>
              <textarea
                id="reviewDescription"
                v-model="formData.reviewDescription"
                required
                rows="5"
                placeholder="Tell us about your experience with this product"
                :class="{ error: errors.reviewDescription }"
              ></textarea>
              <span v-if="errors.reviewDescription" class="error-message">{{ errors.reviewDescription }}</span>
            </div>


            <!-- Fourth Row: Upload (Images & Video) -->
            <div class="form-group">
              <label>Upload Photos or Video (Optional)</label>
              <p class="field-hint">Up to 5 images (JPG, PNG, WebP, 5MB each) and 1 video (MP4, MOV, WebM, 25MB)</p>
              <input
                id="media"
                ref="mediaInput"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                multiple
                @change="handleMediaUpload"
                class="file-input"
              />
              <div v-if="imagePreviews.length > 0" class="image-previews">
                <div v-for="(preview, index) in imagePreviews" :key="index" class="image-preview">
                  <img :src="preview" :alt="`Preview ${index + 1}`" />
                  <button type="button" class="remove-btn" @click="removeImage(index)">
                    <FontAwesomeIcon :icon="['fas', 'times']" />
                  </button>
                </div>
              </div>
              <div v-if="videoPreview" class="video-preview">
                <video :src="videoPreview" controls></video>
                <button type="button" class="remove-btn" @click="removeVideo">
                  <FontAwesomeIcon :icon="['fas', 'times']" />
                </button>
              </div>
              <span v-if="errors.images" class="error-message">{{ errors.images }}</span>
              <span v-if="errors.video" class="error-message">{{ errors.video }}</span>
            </div>

            <!-- General Error -->
            <div v-if="errors.general" class="error-message general-error">
              {{ errors.general }}
            </div>

            <!-- Submit Button -->
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeModal" :disabled="isSubmitting">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="isSubmitting">
                <span v-if="!isSubmitting">Submit</span>
                <span v-else>Submitting...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";

interface Props {
  isOpen: boolean;
  productId: string;
}

interface Emits {
  (e: "close"): void;
  (e: "success"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { submitReview, validateImages, validateVideo, checkVerifiedPurchase } = useCustomerReviews();

// Verified purchase state
const isCheckingPurchase = ref(false);
const isVerifiedPurchase = ref(false);

// Check if user has purchased this product
async function checkPurchaseStatus() {
  if (!formData.email || !props.productId) return;
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) return;
  
  isCheckingPurchase.value = true;
  try {
    isVerifiedPurchase.value = await checkVerifiedPurchase(formData.email, props.productId);
  } catch (error) {
    console.error('Error checking purchase status:', error);
    isVerifiedPurchase.value = false;
  } finally {
    isCheckingPurchase.value = false;
  }
}

// Combined media upload handler
function handleMediaUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;
  const imageFiles: File[] = [];
  let videoFile: File | null = null;
  // Separate images and video, only allow 1 video
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('image/')) {
      if (imageFiles.length < 5) imageFiles.push(file);
    } else if (file.type.startsWith('video/') && !videoFile) {
      videoFile = file;
    }
  }
  // Handle images
  if (imageFiles.length > 0) {
    handleImageUpload({ target: { files: imageFiles } } as any);
  }
  // Handle video
  if (videoFile) {
    handleVideoUpload({ target: { files: [videoFile] } } as any);
  }
}

const formData = reactive({
  name: "",
  email: "",
  rating: 0,
  reviewTitle: "",
  reviewDescription: "",
});

const errors = reactive<Record<string, string>>({});
const hoverRating = ref(0);
const isSubmitting = ref(false);

// File uploads
const imageInput = ref<HTMLInputElement>();
const videoInput = ref<HTMLInputElement>();
const selectedImages = ref<File[]>([]);
const selectedVideo = ref<File | null>(null);
const imagePreviews = ref<string[]>([]);
const videoPreview = ref<string | null>(null);

// Handle image file selection
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;

  const files = Array.from(target.files);
  
  // Validate
  const validationErrors = validateImages(files);
  if (validationErrors.length > 0) {
    errors.images = validationErrors[0].error;
    return;
  }

  // Clear previous error
  delete errors.images;

  // Check total count
  if (selectedImages.value.length + files.length > 5) {
    errors.images = "Maximum 5 images allowed";
    return;
  }

  // Add files and create previews
  selectedImages.value.push(...files);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        imagePreviews.value.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  });

  // Reset input
  if (target) target.value = "";
};

// Handle video file selection
const handleVideoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];

  // Validate
  const validationErrors = validateVideo(file);
  if (validationErrors.length > 0) {
    errors.video = validationErrors[0].error;
    return;
  }

  // Clear previous error
  delete errors.video;

  // Set video and create preview
  selectedVideo.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      videoPreview.value = e.target.result as string;
    }
  };
  reader.readAsDataURL(file);
};

// Remove image
const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1);
  imagePreviews.value.splice(index, 1);
};

// Remove video
const removeVideo = () => {
  selectedVideo.value = null;
  videoPreview.value = null;
  if (videoInput.value) {
    videoInput.value.value = "";
  }
};

// Validate form
const validateForm = (): boolean => {
  // Clear previous errors
  Object.keys(errors).forEach((key) => delete errors[key]);

  let isValid = true;

  console.log('Validating form data:', formData);

  if (!formData.name.trim()) {
    errors.name = "Name is required";
    isValid = false;
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Please enter a valid email";
    isValid = false;
  }

  console.log('Current rating value:', formData.rating, 'Type:', typeof formData.rating);
  
  if (!formData.rating || formData.rating === 0) {
    errors.rating = "Please select a rating";
    isValid = false;
  }

  if (!formData.reviewTitle.trim()) {
    errors.reviewTitle = "Review title is required";
    isValid = false;
  }

  if (!formData.reviewDescription.trim()) {
    errors.reviewDescription = "Review description is required";
    isValid = false;
  } else if (formData.reviewDescription.trim().length < 10) {
    errors.reviewDescription = "Review description must be at least 10 characters";
    isValid = false;
  }

  console.log('Validation result:', isValid, 'Errors:', errors);
  return isValid;
};

// Handle form submission
const handleSubmit = async () => {
  console.log('Submit button clicked, validating form...');
  
  if (!validateForm()) {
    console.log('Form validation failed:', errors);
    return;
  }

  console.log('Form validated successfully, submitting review...');
  isSubmitting.value = true;
  delete errors.general;

  try {
    console.log('Calling submitReview with data:', {
      name: formData.name,
      email: formData.email,
      rating: formData.rating,
      reviewTitle: formData.reviewTitle,
      reviewDescription: formData.reviewDescription,
      productId: props.productId,
      hasImages: selectedImages.value.length > 0,
      hasVideo: !!selectedVideo.value
    });
    
    const result = await submitReview(
      {
        name: formData.name,
        email: formData.email,
        rating: formData.rating,
        reviewTitle: formData.reviewTitle,
        reviewDescription: formData.reviewDescription,
        productId: props.productId,
      },
      selectedImages.value.length > 0 ? selectedImages.value : undefined,
      selectedVideo.value || undefined
    );

    console.log('Submit result:', result);

    if (result.success) {
      console.log('Review submitted successfully!');
      emit("success");
      resetForm();
      closeModal();
    } else {
      console.error('Submit failed:', result.error);
      errors.general = result.error || "Failed to submit review";
    }
  } catch (error: any) {
    console.error('Submit error:', error);
    errors.general = error.message || "An unexpected error occurred";
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form
const resetForm = () => {
  formData.name = "";
  formData.email = "";
  formData.rating = 0;
  formData.reviewTitle = "";
  formData.reviewDescription = "";
  selectedImages.value = [];
  selectedVideo.value = null;
  imagePreviews.value = [];
  videoPreview.value = null;
  Object.keys(errors).forEach((key) => delete errors[key]);
};

// Close modal
const closeModal = () => {
  if (!isSubmitting.value) {
    emit("close");
  }
};

// Reset form when modal closes
watch(
  () => props.isOpen,
  (newValue) => {
    if (!newValue) {
      setTimeout(resetForm, 300); // Delay to allow transition to complete
    }
  }
);
</script>

<style scoped lang="scss">
    /* 2-column grid for first two rows */
.form-row {
  display: flex;
  gap: 1.5rem;
}
.form-row .form-group {
  flex: 1 1 0;
}

/* Responsive: stack on mobile */
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 80%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid $color-gray-500;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: $color-text;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: $color-text;
    cursor: pointer;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;

    &:hover {
      color: $color-primary-dark;
    }
  }
}

.review-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: $color-text-light;
    font-size: 0.875rem;

    .required {
      color: #ef4444;
    }
  }

  .field-hint {
    font-size: 0.75rem;
    color: $color-text-light;
    margin-bottom: 0.5rem;
  }

  input[type="text"],
  input[type="email"],
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid $color-gray-500;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: var(--brand-color, $color-primary-dark);
    }

    &.error {
      border-color: #ef4444;
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
}

.star-rating {
  display: flex;
  gap: 0.5rem;

  .star-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: $color-gray-500;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;

    &.active,
    &.hover {
      color: #fbbf24;
    }
  }
}

.file-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  cursor: pointer;

  &::-webkit-file-upload-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background: var(--brand-color, $color-primary-dark);
    color: white;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: var(--brand-color, $color-secondary);
    }
  }
}

.image-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.image-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e5e7eb;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-btn {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.875rem;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.9);
    }
  }
}

.video-preview {
  position: relative;
  margin-top: 1rem;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e5e7eb;

  video {
    width: 100%;
    max-height: 300px;
  }

  .remove-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1rem;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.9);
    }
  }
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;

  &.general-error {
    background: #fee2e2;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
}

.checking-purchase {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  
  .spinner-small {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid #e5e7eb;
    border-top-color: #007ba7;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

.verified-purchase-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #d1fae5;
  color: #059669;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  
  svg {
    width: 16px;
    height: 16px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;

  button {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;

    &:hover:not(:disabled) {
      background: #e5e7eb;
    }
  }

  .btn-primary {
  display: inline-block;
  background: $color-primary;
  color: white;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-2px);
  }
}
}

// Modal transitions
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal-container {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.9);
  }
}
</style>
