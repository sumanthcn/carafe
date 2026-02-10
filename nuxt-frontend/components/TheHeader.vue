<script setup lang="ts">
import type { NavItem } from "~/types/strapi";

// Emits
const emit = defineEmits<{
  (e: "toggle-cart"): void;
}>();

// Composables
const { getStrapiMediaUrl } = useStrapi();
const { fetchSettings, headerNavigation, logo, siteName, isLoading } =
  useGlobalSettings();
const { user, isAuthenticated, logout } = useAuth();
const route = useRoute();
const cartStore = useCartStore();

// Mobile menu state
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);
const isUserMenuOpen = ref(false);

// Fetch global settings on mount (if not already cached)
await fetchSettings();

// Handle scroll for sticky header styling
onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__user-menu')) {
      isUserMenuOpen.value = false;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("click", handleClickOutside);
  
  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
    document.removeEventListener("click", handleClickOutside);
  });
});

// Close mobile menu on route change
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
  }
);

/**
 * Resolves the correct URL for a navigation item
 * Handles both internal and external links, and page relations
 */
function resolveNavUrl(
  item:
    | NavItem
    | { url: string; page?: { slug?: string } | null; linkType?: string }
): string {
  // If linked to a CMS page, use the page slug
  if (item.page?.slug) {
    return `/${item.page.slug}`;
  }
  return item.url || "/";
}

/**
 * Determines if link should open in new tab
 */
function shouldOpenInNewTab(
  item: NavItem | { linkType?: string; openInNewTab?: boolean }
): boolean {
  // External links should open in new tab by default
  if (item.linkType === "external") {
    return true;
  }
  return item.openInNewTab || false;
}

/**
 * Get link target attribute
 */
function getLinkTarget(
  item: NavItem | { linkType?: string; openInNewTab?: boolean }
): string | undefined {
  return shouldOpenInNewTab(item) ? "_blank" : undefined;
}

/**
 * Get rel attribute for external links
 */
function getLinkRel(
  item: NavItem | { linkType?: string; openInNewTab?: boolean }
): string | undefined {
  return shouldOpenInNewTab(item) ? "noopener noreferrer" : undefined;
}

/**
 * Check if a nav item is currently active
 */
function isNavActive(item: NavItem): boolean {
  const url = resolveNavUrl(item);
  if (url === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(url);
}
</script>

<template>
  <header
    class="header"
    :class="{
      'header--scrolled': isScrolled,
      'header--menu-open': isMobileMenuOpen,
    }"
    role="banner"
  >
    <div class="header__container">
      <!-- Logo -->
      <NuxtLink to="/" class="header__logo" :aria-label="`${siteName} - Home`">
        <img
          v-if="logo"
          :src="getStrapiMediaUrl(logo)"
          :alt="siteName"
          width="120"
          height="40"
          loading="eager"
          fetchpriority="high"
        />
        <span v-else class="header__logo-text">CARAFE</span>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="header__nav" aria-label="Main navigation" role="navigation">
        <ul class="header__nav-list" role="menubar">
          <li
            v-for="item in headerNavigation"
            :key="item.id || item.url"
            class="header__nav-item"
            role="none"
          >
            <!-- Internal Link -->
            <NuxtLink
              v-if="item.linkType !== 'external'"
              :to="resolveNavUrl(item)"
              class="header__nav-link"
              :class="{ 'header__nav-link--active': isNavActive(item) }"
              role="menuitem"
              :aria-current="isNavActive(item) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>

            <!-- External Link -->
            <a
              v-else
              :href="resolveNavUrl(item)"
              class="header__nav-link"
              :target="getLinkTarget(item)"
              :rel="getLinkRel(item)"
              role="menuitem"
            >
              {{ item.label }}
              <span class="sr-only">(opens in new tab)</span>
            </a>

            <!-- Dropdown for children -->
            <ul
              v-if="item.children?.length"
              class="header__dropdown"
              role="menu"
              :aria-label="`${item.label} submenu`"
            >
              <li
                v-for="child in item.children"
                :key="child.id || child.url"
                role="none"
              >
                <NuxtLink
                  v-if="child.linkType !== 'external'"
                  :to="resolveNavUrl(child)"
                  class="header__dropdown-link"
                  role="menuitem"
                >
                  {{ child.label }}
                </NuxtLink>
                <a
                  v-else
                  :href="resolveNavUrl(child)"
                  class="header__dropdown-link"
                  :target="getLinkTarget(child)"
                  :rel="getLinkRel(child)"
                  role="menuitem"
                >
                  {{ child.label }}
                </a>
              </li>
            </ul>
          </li>

          <!-- Cart button in nav -->
          <li class="header__nav-item header__nav-item--cart" role="none">
            <button
              class="header__cart-btn"
              aria-label="Open shopping cart"
              @click="emit('toggle-cart')"
            >
              <img
                src="~/assets/images/shopping-cart.svg"
                alt=""
                width="24"
                height="24"
                aria-hidden="true"
              />
              <span
                v-if="cartStore.itemCount > 0"
                class="header__cart-badge"
                aria-label="items in cart"
              >
                {{ cartStore.itemCount }}
              </span>
            </button>
            <div v-if="isAuthenticated" class="header__user-menu">
              <button
                class="header__user-btn"
                aria-label="User menu"
                @click.stop="isUserMenuOpen = !isUserMenuOpen"
              >
                <FontAwesomeIcon icon="user" />
                <!-- <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                </svg> -->
              </button>

              <div v-if="isUserMenuOpen" class="header__user-dropdown">
                <div class="header__user-info">
                  <p class="header__user-name">{{ user?.username }}</p>
                  <p class="header__user-email">{{ user?.email }}</p>
                </div>
                <ul class="header__user-links">
                  <li>
                    <NuxtLink to="/account/profile" @click="isUserMenuOpen = false">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                      </svg>
                      View Profile
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink to="/account/orders" @click="isUserMenuOpen = false">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <path d="M9 12h6M9 16h6"/>
                      </svg>
                      My Orders
                    </NuxtLink>
                  </li>
                  <li>
                    <button @click="logout(); isUserMenuOpen = false">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      <!-- Actions -->
      <div class="header__actions">
        <!-- Mobile menu toggle -->
        <button
          class="header__menu-toggle"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="mobile-navigation"
          aria-label="Toggle mobile menu"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <span class="header__menu-icon" aria-hidden="true"></span>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <nav
      id="mobile-navigation"
      class="header__mobile-nav"
      :class="{ 'header__mobile-nav--open': isMobileMenuOpen }"
      aria-label="Mobile navigation"
      role="navigation"
      :hidden="!isMobileMenuOpen"
    >
      <ul class="header__mobile-list" role="menu">
        <li
          v-for="item in headerNavigation"
          :key="`mobile-${item.id || item.url}`"
          role="none"
        >
          <NuxtLink
            v-if="item.linkType !== 'external'"
            :to="resolveNavUrl(item)"
            class="header__mobile-link"
            :class="{ 'header__mobile-link--active': isNavActive(item) }"
            role="menuitem"
          >
            {{ item.label }}
          </NuxtLink>
          <a
            v-else
            :href="resolveNavUrl(item)"
            class="header__mobile-link"
            :target="getLinkTarget(item)"
            :rel="getLinkRel(item)"
            role="menuitem"
          >
            {{ item.label }}
          </a>

          <!-- Mobile dropdown children -->
          <ul
            v-if="item.children?.length"
            class="header__mobile-children"
            role="menu"
          >
            <li
              v-for="child in item.children"
              :key="`mobile-child-${child.id || child.url}`"
              role="none"
            >
              <NuxtLink
                v-if="child.linkType !== 'external'"
                :to="resolveNavUrl(child)"
                class="header__mobile-child-link"
                role="menuitem"
              >
                {{ child.label }}
              </NuxtLink>
              <a
                v-else
                :href="resolveNavUrl(child)"
                class="header__mobile-child-link"
                :target="getLinkTarget(child)"
                :rel="getLinkRel(child)"
                role="menuitem"
              >
                {{ child.label }}
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="header__loading" aria-hidden="true"></div>
  </header>
</template>

<style lang="scss" scoped>
// Screen reader only utility
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

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
    flex-shrink: 0;

    img {
      height: 40px;
      width: auto;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 4px;
      border-radius: 4px;
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

    @include desktop {
      display: block;
    }
  }

  &__nav-list {
    display: flex;
    align-items: center;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__nav-item {
    position: relative;

    &:hover .header__dropdown,
    &:focus-within .header__dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  }

  &__nav-link {
    font-family: $font-body;
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-decoration: none;
    padding: 0.5rem 0;
    transition: color 0.2s ease;
    display: inline-block;

    &:hover,
    &--active {
      color: $color-primary;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 4px;
      border-radius: 2px;
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    min-width: 220px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 0.5rem 0;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    list-style: none;
    margin: 0;
    z-index: 10;
  }

  &__dropdown-link {
    display: block;
    padding: 0.75rem 1.5rem;
    color: $color-text;
    text-decoration: none;
    font-size: 0.875rem;
    transition: background-color 0.2s ease, color 0.2s ease;
    white-space: nowrap;

    &:hover {
      background-color: $color-background-alt;
      color: $color-primary;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: -2px;
    }
  }

  &__nav-item--cart {
    margin-left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 1rem;

    @include desktop {
      display: none;
    }
  }

  &__cart-btn {
    position: relative;
    background: #ccd0d1;
    border: none;
    cursor: pointer;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    img {
      width: 24px;
      height: 24px;
      display: block;
    }

    &:hover {
      background-color: #c0c0c0;
      transform: scale(1.05);
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
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
    border-radius: 4px;
    transition: background-color 0.2s ease;

    @include desktop {
      display: none;
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);

      .header--scrolled & {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__menu-icon {
    position: relative;
    width: 24px;
    height: 2px;
    background: #001219;
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
    max-height: calc(100vh - 80px);
    overflow-y: auto;

    &--open {
      display: block;
    }

    @include desktop {
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
    transition: color 0.2s ease;

    &:hover,
    &--active {
      color: $color-primary;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__mobile-children {
    list-style: none;
    margin: 0;
    padding: 0 0 0 1rem;
  }

  &__mobile-child-link {
    display: block;
    padding: 0.5rem 0;
    color: $color-text-light;
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s ease;

    &:hover {
      color: $color-primary;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      $color-primary,
      transparent
    );
    animation: loading 1.5s infinite;
  }

  // User menu styles
  &__user-menu {
    position: relative;
  }

  &__user-btn {
    position: relative;
    background: #ccd0d1;
    border: none;
    cursor: pointer;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
      color: $color-primary;
    }

    svg {
      width: 24px;
      height: 24px;
    }
  }

  &__user-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: white;
    border: 1px solid #e5e5e5;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 220px;
    z-index: 1000;
    animation: fadeInDown 0.2s ease;
  }

  &__user-info {
    padding: 1rem;
    border-bottom: 1px solid #e5e5e5;
  }

  &__user-name {
    font-weight: 600;
    color: $color-text;
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
  }

  &__user-email {
    font-size: 0.75rem;
    color: $color-text-light;
    margin: 0;
  }

  &__user-links {
    list-style: none;
    margin: 0;
    padding: 0.5rem 0;

    li {
      margin: 0;
    }

    a,
    button {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: $color-text;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background-color 0.2s ease, color 0.2s ease;
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;

      svg {
        flex-shrink: 0;
      }

      &:hover {
        background-color: #f5f5f5;
        color: $color-primary;
      }
    }

    button {
      color: #dc2626;

      &:hover {
        background-color: #fee2e2;
      }
    }
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
