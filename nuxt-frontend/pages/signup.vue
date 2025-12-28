<template>
  <div class="auth-page">
    <div class="container">
      <div class="auth-card">
        <div class="auth-header">
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join Carafe Coffee and start your coffee journey.</p>
        </div>

        <form @submit.prevent="handleSignup" class="auth-form">
          <!-- Username -->
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              class="form-input"
              :class="{ 'form-input--error': errors.username }"
              placeholder="Choose a username"
              required
              autocomplete="username"
            />
            <span v-if="errors.username" class="form-error">{{ errors.username }}</span>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ 'form-input--error': errors.email }"
              placeholder="Enter your email"
              required
              autocomplete="email"
            />
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="form-input"
              :class="{ 'form-input--error': errors.password }"
              placeholder="Create a password (min 6 characters)"
              required
              autocomplete="new-password"
            />
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'form-input--error': errors.confirmPassword }"
              placeholder="Confirm your password"
              required
              autocomplete="new-password"
            />
            <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert--error">
            {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn btn--primary btn--full"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <!-- Login Link -->
        <div class="auth-footer">
          <p>Already have an account? <NuxtLink :to="{ path: '/login', query: redirectPath ? { redirect: redirectPath } : {} }" class="auth-link">Login</NuxtLink></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { register, handlePostLoginRedirect } = useAuth();
const route = useRoute();

definePageMeta({
  layout: 'default',
});

// Get redirect parameter for passing to login
const redirectPath = computed(() => route.query.redirect as string || '');

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const errorMessage = ref('');
const isLoading = ref(false);

function validateForm(): boolean {
  let isValid = true;
  errors.username = '';
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';
  errorMessage.value = '';

  // Username validation
  if (!formData.username.trim()) {
    errors.username = 'Username is required';
    isValid = false;
  } else if (formData.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
    isValid = false;
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email';
    isValid = false;
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (formData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    isValid = false;
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
}

async function handleSignup() {
  if (!validateForm()) return;

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );

    if (result.success) {
      console.log('Signup successful, redirect query:', route.query.redirect);
      // Redirect to intended page (checkout) or home
      handlePostLoginRedirect();
    } else {
      errorMessage.value = result.error || 'Registration failed';
    }
  } catch (error) {
    console.error('Signup error:', error);
    errorMessage.value = 'An unexpected error occurred';
  } finally {
    isLoading.value = false;
  }
}

useHead({
  title: 'Sign Up | Carafe Coffee',
  meta: [
    { name: 'description', content: 'Create your Carafe Coffee account' },
  ],
});
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  padding: 4rem 0;
  background: #f9f9f9;
}

.container {
  max-width: 500px;
  margin: 0 auto;
  padding: 0 2rem;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 3rem 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: $color-text;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 1rem;
  color: #666;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: $color-text;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007ba7;
  }

  &--error {
    border-color: #d32f2f;
  }
}

.form-error {
  font-size: 0.875rem;
  color: #d32f2f;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9375rem;

  &--error {
    background: #ffebee;
    color: #d32f2f;
    border: 1px solid #ef9a9a;
  }
}

.btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &--primary {
    background: #007ba7;
    color: white;

    &:hover:not(:disabled) {
      background: #005f85;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 123, 167, 0.3);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &--full {
    width: 100%;
  }
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;

  p {
    font-size: 0.9375rem;
    color: #666;
  }
}

.auth-link {
  color: #007ba7;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
