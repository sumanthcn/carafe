<script setup lang="ts">
import type { GlobalSettings } from "~/types/strapi";

const props = defineProps<{
  settings?: GlobalSettings | null;
}>();

const { getStrapiMediaUrl } = useStrapi();
const route = useRoute();

// Mobile menu state
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

// Cart
const cartStore = useCartStore();

// Handle scroll
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
  };

  window.addEventListener("scroll", handleScroll);
  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
  });
});

// Close mobile menu on route change
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  }
);

const navigation = computed(
  () =>
    props.settings?.navigation || [
      { label: "Shop Coffee", url: "/shop" },
      { label: "Visit Café", url: "/visit-cafe" },
      { label: "Art & Culture", url: "/art-culture" },
      { label: "Wholesale", url: "/wholesale" },
      { label: "About", url: "/about" },
    ]
);
</script>

<template>
  <header
    class="header"
    :class="{
      'header--scrolled': isScrolled,
      'header--menu-open': isMobileMenuOpen,
    }"
  >
    <div class="header__container">
      <!-- Logo -->
      <NuxtLink to="/" class="header__logo" aria-label="Carafe Coffee - Home">
        <img
          v-if="settings?.logo"
          :src="getStrapiMediaUrl(settings.logo)"
          :alt="settings?.siteName || 'Carafe Coffee'"
          width="120"
          height="40"
        />
        <span v-else class="header__logo-text">CARAFE</span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="header__nav" aria-label="Main navigation">
        <ul class="header__nav-list">
          <li
            v-for="item in navigation"
            :key="item.url"
            class="header__nav-item"
          >
            <NuxtLink
              :to="item.url"
              class="header__nav-link"
              :class="{ 'header__nav-link--active': route.path === item.url }"
            >
              {{ item.label }}
            </NuxtLink>

            <!-- Dropdown for children -->
            <ul v-if="item.children?.length" class="header__dropdown">
              <li v-for="child in item.children" :key="child.url">
                <NuxtLink :to="child.url" class="header__dropdown-link">
                  {{ child.label }}
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- Actions -->
      <div class="header__actions">
        <!-- Cart button -->
        <button
          class="header__cart-btn"
          aria-label="Open cart"
          @click="$emit('toggle-cart')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
            ></path>
          </svg>
          <span v-if="cartStore.itemCount > 0" class="header__cart-badge">
            {{ cartStore.itemCount }}
          </span>
        </button>

        <!-- Mobile menu toggle -->
        <button
          class="header__menu-toggle"
          :aria-expanded="isMobileMenuOpen"
          aria-label="Toggle menu"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <span class="header__menu-icon"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <nav
      class="header__mobile-nav"
      :class="{ 'header__mobile-nav--open': isMobileMenuOpen }"
      aria-label="Mobile navigation"
    >
      <ul class="header__mobile-list">
        <li v-for="item in navigation" :key="item.url">
          <NuxtLink :to="item.url" class="header__mobile-link">
            {{ item.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: transparent;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &--scrolled {
    background: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    .header__nav-link,
    .header__logo-text {
      color: $color-text;
    }
  }

  &__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__logo {
    display: flex;
    align-items: center;
    text-decoration: none;

    img {
      height: 40px;
      width: auto;
    }
  }

  &__logo-text {
    font-family: $font-heading;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    letter-spacing: 0.1em;
  }

  &__nav {
    display: none;

    @media (min-width: 1024px) {
      display: block;
    }
  }

  &__nav-list {
    display: flex;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__nav-item {
    position: relative;

    &:hover .header__dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }

  &__nav-link {
    font-family: $font-body;
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: white;
    text-decoration: none;
    padding: 0.5rem 0;
    transition: color 0.2s ease;

    &:hover,
    &--active {
      color: $color-primary;
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 200px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 0.5rem 0;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    list-style: none;
  }

  &__dropdown-link {
    display: block;
    padding: 0.75rem 1.5rem;
    color: $color-text;
    text-decoration: none;
    font-size: 0.875rem;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: $color-background-alt;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &__cart-btn {
    position: relative;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    padding: 0.5rem;

    svg {
      color: white;
    }

    .header--scrolled & svg {
      color: $color-text;
    }
  }

  &__cart-badge {
    position: absolute;
    top: 0;
    right: 0;
    background: $color-primary;
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: none;
    border: none;
    cursor: pointer;

    @media (min-width: 1024px) {
      display: none;
    }
  }

  &__menu-icon {
    position: relative;
    width: 24px;
    height: 2px;
    background: white;
    transition: background 0.2s ease;

    .header--scrolled & {
      background: $color-text;
    }

    &::before,
    &::after {
      content: "";
      position: absolute;
      left: 0;
      width: 100%;
      height: 2px;
      background: inherit;
      transition: transform 0.3s ease;
    }

    &::before {
      top: -8px;
    }

    &::after {
      bottom: -8px;
    }

    .header--menu-open & {
      background: transparent;

      &::before {
        transform: translateY(8px) rotate(45deg);
        background: $color-text;
      }

      &::after {
        transform: translateY(-8px) rotate(-45deg);
        background: $color-text;
      }
    }
  }

  &__mobile-nav {
    display: none;
    background: white;
    border-top: 1px solid #eee;

    &--open {
      display: block;
    }

    @media (min-width: 1024px) {
      display: none !important;
    }
  }

  &__mobile-list {
    list-style: none;
    margin: 0;
    padding: 1rem 2rem;
  }

  &__mobile-link {
    display: block;
    padding: 0.75rem 0;
    color: $color-text;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px solid #eee;
  }
}
</style>
