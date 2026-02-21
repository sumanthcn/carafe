<template>
  <div class="profile-page">
    <!-- Hero Section -->
    <div class="profile-hero">
      <div class="profile-hero__background"></div>
      <div class="container">
        <div class="profile-hero__content">
          <!-- Breadcrumb -->
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <NuxtLink to="/">Home</NuxtLink>
            <span class="breadcrumb__separator">/</span>
            <NuxtLink to="/account">Account</NuxtLink>
            <span class="breadcrumb__separator">/</span>
            <span class="breadcrumb__current">Profile</span>
          </nav>

          <!-- Hero Title -->
          <h1 class="profile-hero__title">My Profile</h1>
          <p class="profile-hero__subtitle">Manage your account information and preferences</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="profile-page__content">
        <!-- Profile Card -->
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
              <label>Email Address</label>
              <p>{{ user?.email }}</p>
            </div>

            <div class="profile-field">
              <label>Account Status</label>
              <p>
                <span v-if="user?.confirmed" class="status-badge status-badge--success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Verified
                </span>
                <span v-else class="status-badge status-badge--warning">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Pending Verification
                </span>
              </p>
            </div>
          </div>

          <div class="profile-card__divider"></div>

          <div class="profile-card__actions">
            <h3 class="actions-title">Quick Actions</h3>
            <div class="actions-grid">
              <NuxtLink to="/account/orders" class="action-btn">
                <div class="action-btn__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M9 12h6M9 16h6"/>
                  </svg>
                </div>
                <div class="action-btn__content">
                  <span class="action-btn__title">My Orders</span>
                  <span class="action-btn__subtitle">View order history</span>
                </div>
              </NuxtLink>

              <NuxtLink to="/account/addresses" class="action-btn">
                <div class="action-btn__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div class="action-btn__content">
                  <span class="action-btn__title">Addresses</span>
                  <span class="action-btn__subtitle">Manage delivery addresses</span>
                </div>
              </NuxtLink>

              <NuxtLink to="/account" class="action-btn">
                <div class="action-btn__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18M9 21V9"/>
                  </svg>
                </div>
                <div class="action-btn__content">
                  <span class="action-btn__title">Dashboard</span>
                  <span class="action-btn__subtitle">Account overview</span>
                </div>
              </NuxtLink>

              <button @click="logout" class="action-btn action-btn--logout">
                <div class="action-btn__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                <div class="action-btn__content">
                  <span class="action-btn__title">Logout</span>
                  <span class="action-btn__subtitle">Sign out of account</span>
                </div>
              </button>
            </div>
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
  min-height: 100vh;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
  padding-bottom: $spacing-16;
}

// Hero Section
.profile-hero {
  position: relative;
  padding: 140px 0 $spacing-12;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%);
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 120px 0 $spacing-8;
  }

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    opacity: 0.6;
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: 3rem;
    font-weight: 700;
    color: white;
    margin: $spacing-4 0 $spacing-3;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  &__subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    max-width: 600px;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

// Breadcrumb
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: $spacing-2;

  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: white;
    }
  }

  &__separator {
    color: rgba(255, 255, 255, 0.5);
  }

  &__current {
    color: white;
    font-weight: 500;
  }
}

// Main Content
.profile-page__content {
  max-width: 800px;
  margin: -60px auto 0;
  padding: 0 $spacing-4;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    margin-top: -40px;
  }
}

// Profile Card
.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  &__header {
    padding: $spacing-8 $spacing-6;
    background: linear-gradient(135deg, $color-primary 0%, darken($color-primary, 10%) 100%);
    color: white;
    text-align: center;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.3) 0%, 
        rgba(255, 255, 255, 0.1) 50%, 
        rgba(255, 255, 255, 0.3) 100%
      );
    }
  }

  &__avatar {
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    margin: 0 auto $spacing-4;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);

    svg {
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
  }

  &__info {
    h2 {
      font-size: 1.75rem;
      margin: 0 0 0.5rem 0;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    p {
      margin: 0;
      opacity: 0.95;
      font-size: 1rem;
    }
  }

  &__body {
    padding: $spacing-8 $spacing-6;
    background: white;
  }

  &__divider {
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      #e5e7eb 20%, 
      #e5e7eb 80%, 
      transparent 100%
    );
  }

  &__actions {
    padding: $spacing-6;
    background: #f9fafb;
  }
}

// Profile Fields
.profile-field {
  margin-bottom: $spacing-6;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $color-text-light;
    margin-bottom: $spacing-2;
  }

  p {
    margin: 0;
    font-size: 1.125rem;
    color: $color-text;
    font-weight: 500;
    padding: $spacing-3 $spacing-4;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
}

// Status Badge
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;

  svg {
    flex-shrink: 0;
  }

  &--success {
    background: #d1fae5;
    color: #065f46;
  }

  &--warning {
    background: #fef3c7;
    color: #92400e;
  }
}

// Actions Section
.actions-title {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-text-light;
  margin: 0 0 $spacing-4 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: $spacing-3;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-4;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  text-decoration: none;
  color: $color-text;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;

  &:hover {
    border-color: $color-primary;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);

    .action-btn__icon {
      background: $color-primary;
      color: white;
    }
  }

  &--logout {
    .action-btn__icon {
      background: #fee2e2;
      color: #dc2626;
    }

    &:hover {
      border-color: #dc2626;

      .action-btn__icon {
        background: #dc2626;
        color: white;
      }
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    background: #f3f4f6;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    svg {
      display: block;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    text-align: left;
  }

  &__title {
    font-weight: 600;
    font-size: 0.9375rem;
    color: $color-text;
  }

  &__subtitle {
    font-size: 0.75rem;
    color: $color-text-light;
  }
}

// Container
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-4;
}
</style>
