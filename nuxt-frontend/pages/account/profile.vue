<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-page__header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div class="profile-page__content">
        <div class="profile-card">
          <div class="profile-card__header">
            <div class="profile-card__avatar">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              </svg>
            </div>
            <div class="profile-card__info">
              <h2>{{ user?.username }}</h2>
              <p>{{ user?.email }}</p>
            </div>
          </div>

          <div class="profile-card__body">
            <div class="profile-field">
              <label>Username</label>
              <p>{{ user?.username }}</p>
            </div>

            <div class="profile-field">
              <label>Email</label>
              <p>{{ user?.email }}</p>
            </div>

            <div class="profile-field">
              <label>Account Status</label>
              <p>
                <span v-if="user?.confirmed" class="status-badge status-badge--success">
                  ✓ Verified
                </span>
                <span v-else class="status-badge status-badge--warning">
                  Pending Verification
                </span>
              </p>
            </div>
          </div>

          <div class="profile-card__actions">
            <NuxtLink to="/account/orders" class="btn btn--primary">
              View My Orders
            </NuxtLink>
            <button @click="logout" class="btn btn--outline">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth();

definePageMeta({
  middleware: ['auth'],
});

useHead({
  title: 'My Profile | Carafe Coffee',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.profile-page {
  padding: $spacing-8 0 $spacing-16;
  min-height: calc(100vh - 200px);
  background: $color-gray-50;

  &__header {
    margin-bottom: $spacing-8;

    h1 {
      font-family: $font-family-heading;
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
      color: $color-text;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }

    p {
      color: $color-text-light;
      margin: 0;
    }
  }

  &__content {
    max-width: 600px;
    margin: 0 auto;
  }
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  &__header {
    padding: $spacing-6;
    background: linear-gradient(135deg, $color-primary, darken($color-primary, 10%));
    color: white;
    text-align: center;
  }

  &__avatar {
    width: 80px;
    height: 80px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    margin: 0 auto $spacing-4;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      color: white;
    }
  }

  &__info {
    h2 {
      font-size: 1.5rem;
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.875rem;
    }
  }

  &__body {
    padding: $spacing-6;
  }

  &__actions {
    padding: $spacing-4 $spacing-6 $spacing-6;
    display: flex;
    gap: $spacing-3;
    flex-wrap: wrap;

    .btn {
      flex: 1;
      min-width: 150px;
      justify-content: center;
    }
  }
}

.profile-field {
  margin-bottom: $spacing-5;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $color-text-light;
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0;
    font-size: 1rem;
    color: $color-text;
    font-weight: 500;
  }
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;

  &--success {
    background: #d1fae5;
    color: #065f46;
  }

  &--warning {
    background: #fef3c7;
    color: #92400e;
  }
}
</style>
