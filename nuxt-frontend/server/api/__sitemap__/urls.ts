/**
 * Dynamic sitemap URL generation from Strapi
 * Fetches all products, pages, and categories for sitemap
 */
export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  const urls: Array<{
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: number;
  }> = [];

  try {
    // Fetch products
    const productsResponse = await $fetch<{
      data: Array<{ slug: string; updatedAt: string }>;
    }>(
      `${strapiUrl}/api/products?fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=100`
    );

    if (productsResponse?.data) {
      productsResponse.data.forEach((product) => {
        urls.push({
          loc: `/shop-coffee/${product.slug}`,
          lastmod: product.updatedAt,
          changefreq: "weekly",
          priority: 0.8,
        });
      });
    }

    // Fetch product categories
    const categoriesResponse = await $fetch<{
      data: Array<{ slug: string; updatedAt: string }>;
    }>(
      `${strapiUrl}/api/product-categories?fields[0]=slug&fields[1]=updatedAt`
    );

    if (categoriesResponse?.data) {
      categoriesResponse.data.forEach((category) => {
        urls.push({
          loc: `/shop?category=${category.slug}`,
          lastmod: category.updatedAt,
          changefreq: "weekly",
          priority: 0.7,
        });
      });
    }

    // Fetch pages
    const pagesResponse = await $fetch<{
      data: Array<{ slug: string; updatedAt: string }>;
    }>(`${strapiUrl}/api/pages?fields[0]=slug&fields[1]=updatedAt`);

    if (pagesResponse?.data) {
      pagesResponse.data.forEach((page) => {
        urls.push({
          loc: `/${page.slug}`,
          lastmod: page.updatedAt,
          changefreq: "monthly",
          priority: 0.6,
        });
      });
    }

    // Fetch subscriptions
    const subscriptionsResponse = await $fetch<{
      data: Array<{ slug: string; updatedAt: string }>;
    }>(`${strapiUrl}/api/subscriptions?fields[0]=slug&fields[1]=updatedAt`);

    if (subscriptionsResponse?.data) {
      subscriptionsResponse.data.forEach((subscription) => {
        urls.push({
          loc: `/subscriptions/${subscription.slug}`,
          lastmod: subscription.updatedAt,
          changefreq: "weekly",
          priority: 0.7,
        });
      });
    }
  } catch (error) {
    console.error("Error fetching sitemap URLs from Strapi:", error);
  }

  return urls;
});
