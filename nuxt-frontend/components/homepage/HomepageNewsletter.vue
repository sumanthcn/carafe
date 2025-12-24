<template>
  <section class="newsletter">
    <div class="container">
      <div class="newsletter__inner">
        <div class="newsletter__content">
          <span v-if="badge" class="newsletter__badge">{{ badge }}</span>
          <h2 class="newsletter__title">
            {{ title || "Join Our Coffee Community" }}
          </h2>
          <p v-if="description" class="newsletter__description">
            {{ description }}
          </p>
        </div>

        <form class="newsletter__form" @submit.prevent="subscribe">
          <div class="newsletter__input-group">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email address"
              required
              :disabled="isLoading"
            />
            <button
              type="submit"
              class="btn btn--primary"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Subscribe</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>

          <Transition name="fade">
            <p
              v-if="message"
              :class="[
                'newsletter__message',
                {
                  'newsletter__message--success': isSuccess,
                  'newsletter__message--error': !isSuccess,
                },
              ]"
            >
              {{ message }}
            </p>
          </Transition>

          <p class="newsletter__privacy">
            By subscribing, you agree to our
            <NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface NewsletterProps {
  title?: string;
  description?: string;
  badge?: string;
}

withDefaults(defineProps<NewsletterProps>(), {
  title: "Join Our Coffee Community",
});

const email = ref("");
const isLoading = ref(false);
const message = ref("");
const isSuccess = ref(false);

const subscribe = async () => {
  if (!email.value) return;

  isLoading.value = true;
  message.value = "";

  try {
    await $fetch("/api/newsletter/subscribe", {
      method: "POST",
      body: { email: email.value },
    });

    isSuccess.value = true;
    message.value =
      "Thank you for subscribing! Check your email for confirmation.";
    email.value = "";
  } catch (error: any) {
    isSuccess.value = false;
    message.value =
      error.data?.message || "Something went wrong. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.newsletter {
  padding: $spacing-16 0;
  background: $color-primary;
  color: $color-white;

  &__inner {
    display: grid;
    gap: $spacing-8;
    align-items: center;

    @include tablet {
      grid-template-columns: 1fr 1fr;
      gap: $spacing-12;
    }
  }

  &__badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    padding: $spacing-1 $spacing-3;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: $spacing-4;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-2xl;
    margin-bottom: $spacing-3;

    @include tablet {
      font-size: $font-size-3xl;
    }
  }

  &__description {
    opacity: 0.9;
    line-height: 1.7;
  }

  &__form {
    background: rgba(0, 0, 0, 0.2);
    padding: $spacing-6;
    border-radius: $border-radius-lg;
  }

  &__input-group {
    display: flex;
    gap: $spacing-3;

    input {
      flex: 1;
      padding: $spacing-3 $spacing-4;
      border: none;
      border-radius: $border-radius-md;
      font-size: $font-size-base;
      background: $color-white;
      color: $color-dark;

      &::placeholder {
        color: $color-gray-400;
      }

      &:focus {
        outline: 2px solid rgba(255, 255, 255, 0.5);
        outline-offset: 2px;
      }

      &:disabled {
        opacity: 0.7;
      }
    }

    .btn {
      white-space: nowrap;
      background: $color-dark;

      &:hover {
        background: darken($color-dark, 10%);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }

  &__message {
    margin-top: $spacing-3;
    padding: $spacing-2 $spacing-3;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;

    &--success {
      background: rgba($color-success, 0.2);
      color: lighten($color-success, 20%);
    }

    &--error {
      background: rgba($color-error, 0.2);
      color: lighten($color-error, 20%);
    }
  }

  &__privacy {
    margin-top: $spacing-4;
    font-size: $font-size-xs;
    opacity: 0.7;

    a {
      color: inherit;
      text-decoration: underline;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
