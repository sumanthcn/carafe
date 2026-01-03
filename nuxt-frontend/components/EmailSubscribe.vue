<template>
  <section class="email-subscribe">
    <div class="container">
      <div class="subscribe-content">
        <div class="subscribe-text">
          <h2 class="subscribe-title">{{ title }}</h2>
          <p v-if="description" class="subscribe-description">
            {{ description }}
          </p>
        </div>
        <form @submit.prevent="handleSubscribe" class="subscribe-form">
          <div class="input-wrapper">
            <input
              v-model="email"
              type="email"
              :placeholder="placeholder"
              class="subscribe-input"
              :disabled="isLoading"
              required
              @input="validateOnInput"
              @blur="validateOnBlur"
            />
            <button
              type="submit"
              class="subscribe-button"
              :disabled="isLoading || !isEmailValid"
            >
              <span v-if="!isLoading">{{ buttonText }}</span>
              <span v-else>Subscribing...</span>
            </button>
          </div>
          <span class="error-message">
            {{ validationError || "&nbsp;" }}
          </span>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface EmailSubscribeProps {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  source?: string;
}

const props = withDefaults(defineProps<EmailSubscribeProps>(), {
  title: "JOIN OUR COFFEE CIRCLE",
  description:
    "Be the first to discover new roasts, exclusive offers, and Carafe events. Stay connected with our coffee journey.",
  placeholder: "Enter your email address",
  buttonText: "SUBSCRIBE",
  source: "footer",
});

const { subscribe, validateEmail, isLoading } = useEmailSubscription();
const toast = useToast();

const email = ref("");
const validationError = ref("");

/**
 * Check if email is valid in real-time
 */
const isEmailValid = computed(() => {
  return email.value.length > 0 && validateEmail(email.value);
});

/**
 * Validate email as user types
 */
function validateOnInput() {
  if (email.value.length > 0 && !validateEmail(email.value)) {
    validationError.value = "Please enter a valid email address";
  } else {
    validationError.value = "";
  }
}

/**
 * Validate email on blur
 */
function validateOnBlur() {
  if (email.value && !validateEmail(email.value)) {
    validationError.value = "Please enter a valid email address";
  } else {
    validationError.value = "";
  }
}

/**
 * Handle form submission
 */
async function handleSubscribe() {
  // Clear previous errors
  validationError.value = "";

  // Validate email
  if (!email.value) {
    validationError.value = "Email is required";
    return;
  }

  if (!validateEmail(email.value)) {
    validationError.value = "Please enter a valid email address";
    return;
  }

  // Subscribe
  const result = await subscribe(email.value, props.source);

  if (result.success) {
    // Show success toast
    if (result.alreadySubscribed) {
      toast.add({
        title: "Already Subscribed",
        description: "You're already part of our Coffee Circle!",
        color: "red",
        icon: "i-heroicons-check-circle",
        timeout: 0,
      });
    } else {
      toast.add({
        title: "Welcome to Our Coffee Circle!",
        description: "Thanks for subscribing. Check your inbox for updates.",
        color: "green",
        icon: "i-heroicons-check-circle",
      });
    }

    // Clear form
    email.value = "";
  } else {
    // Show error toast
    toast.add({
      title: "Subscription Failed",
      description: result.message,
      color: "red",
      icon: "i-heroicons-exclamation-circle",
    });
    validationError.value = result.message;
  }
}
</script>

<style lang="scss" scoped>
.email-subscribe {
  padding: 4rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.subscribe-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 4rem;
  }
}

.subscribe-text {
  flex: 1;
}

.subscribe-title {
  font-family: $font-heading;
  font-size: $font-size-2xl;
  margin-bottom: 1rem;
  text-transform: uppercase;
  font-weight: bold;
}

.subscribe-description {
  font-size: 1rem;
  max-width: 600px;
}

.subscribe-form {
  flex: 1;
  max-width: 600px;
  width: 100%;
}

.input-wrapper {
  display: flex;
  gap: 0;
  background: $color-dark;
  border-radius: 50px;
  padding: 4px;
  backdrop-filter: blur(10px);
  border: 1px solid $color-primary-dark;
}

.subscribe-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 1rem 1.5rem;
  color: white;
  font-size: 1rem;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.subscribe-button {
  background: $color-primary;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  @media (max-width: 767px) {
    position: absolute;
        bottom: -65px;
        left: 0;
        right: 0;
  }

  &:hover:not(:disabled) {
    background: $color-primary-dark;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($color-primary, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}

.error-message {
  display: block;
  min-height: 1.5rem;
  color: #ff6b6b;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding-left: 1.5rem;
  line-height: 1.5rem;
  transition: opacity 0.2s ease;

  &:empty {
    opacity: 0;
  }
}
</style>
