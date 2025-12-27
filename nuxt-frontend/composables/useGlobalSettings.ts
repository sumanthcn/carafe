import type { GlobalSettings, NavChild, NavItem } from "~/types/strapi";

// Default navigation items when CMS data is not available
const DEFAULT_NAVIGATION: NavItem[] = [
  {
    label: "Shop Coffee",
    url: "/shop-coffee",
    linkType: "internal",
    order: 1,
    isVisible: true,
  },
  {
    label: "Visit Café",
    url: "/visit-cafe",
    linkType: "internal",
    order: 2,
    isVisible: true,
  },
  {
    label: "Art & Culture",
    url: "/art-culture",
    linkType: "internal",
    order: 3,
    isVisible: true,
  },
  {
    label: "Wholesale",
    url: "/wholesale",
    linkType: "internal",
    order: 4,
    isVisible: true,
  },
  {
    label: "About",
    url: "/about",
    linkType: "internal",
    order: 5,
    isVisible: true,
  },
];

/**
 * Composable for fetching and caching global settings from Strapi
 *
 * Uses Nuxt's useState for SSR-compatible state management with hydration
 * Data is fetched once and shared across all components
 */
export function useGlobalSettings() {
  // Use useState for SSR-safe caching across the app
  const globalSettings = useState<GlobalSettings | null>(
    "global-settings",
    () => null
  );
  const isLoading = useState<boolean>("global-settings-loading", () => false);
  const error = useState<string | null>("global-settings-error", () => null);

  const { getGlobalSettings } = useStrapi();

  /**
   * Fetch global settings from Strapi
   * Returns cached data if already fetched
   */
  async function fetchSettings(): Promise<GlobalSettings | null> {
    // Return cached data if available
    if (globalSettings.value) {
      return globalSettings.value;
    }

    // Prevent duplicate fetches
    if (isLoading.value) {
      return globalSettings.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await getGlobalSettings();
      globalSettings.value = data;
      return data;
    } catch (err) {
      console.error("Failed to fetch global settings:", err);
      error.value =
        err instanceof Error ? err.message : "Failed to fetch settings";
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Force refresh global settings (bypasses cache)
   */
  async function refreshSettings(): Promise<GlobalSettings | null> {
    globalSettings.value = null;
    return fetchSettings();
  }

  /**
   * Get header navigation items sorted by order and filtered by visibility
   * Falls back to default navigation if CMS data is not available
   */
  const headerNavigation = computed(() => {
    const navItems = globalSettings.value?.navigation;

    // Use default navigation if no CMS data
    if (!navItems || navItems.length === 0) {
      return DEFAULT_NAVIGATION;
    }

    return [...navItems]
      .filter((item) => item.isVisible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map((item) => ({
        ...item,
        // Filter visible children and sort them
        children: item.children
          ?.filter((child: NavChild) => child.isVisible !== false)
          .sort((a: NavChild, b: NavChild) => (a.order || 0) - (b.order || 0)),
      }));
  });

  /**
   * Get the site logo
   */
  const logo = computed(() => globalSettings.value?.logo);

  /**
   * Get site name
   */
  const siteName = computed(
    () => globalSettings.value?.siteName || "Carafe Coffee"
  );

  /**
   * Get favicon
   */
  const favicon = computed(() => globalSettings.value?.favicon);

  /**
   * Get social links
   */
  const socialLinks = computed(() => globalSettings.value?.socialLinks || []);

  /**
   * Get opening hours
   */
  const openingHours = computed(() => globalSettings.value?.openingHours || []);

  /**
   * Get address
   */
  const address = computed(() => globalSettings.value?.address);

  /**
   * Get contact info
   */
  const contactInfo = computed(() => ({
    email: globalSettings.value?.contactEmail,
    phone: globalSettings.value?.contactPhone,
  }));

  /**
   * Get default SEO settings
   */
  const defaultSeo = computed(() => globalSettings.value?.defaultSeo);

  return {
    // State
    globalSettings: readonly(globalSettings),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Methods
    fetchSettings,
    refreshSettings,

    // Computed getters
    headerNavigation,
    logo,
    siteName,
    favicon,
    socialLinks,
    openingHours,
    address,
    contactInfo,
    defaultSeo,
  };
}
