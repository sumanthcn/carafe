/**
 * Newsletter Subscription Handler
 * Stores email in Strapi or sends to email marketing service
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string }>(event);

  if (!body.email || !isValidEmail(body.email)) {
    throw createError({
      statusCode: 400,
      message: "Valid email address required",
    });
  }

  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  try {
    // Option 1: Store in Strapi (create a Newsletter Subscribers collection)
    // await $fetch(`${strapiUrl}/api/newsletter-subscribers`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: {
    //     data: {
    //       email: body.email,
    //       subscribedAt: new Date().toISOString(),
    //       source: 'website',
    //     },
    //   },
    // });

    // Option 2: Send to email marketing service (Mailchimp, ConvertKit, etc.)
    // This is a placeholder - implement your preferred service
    console.log(`Newsletter subscription: ${body.email}`);

    return {
      success: true,
      message: "Successfully subscribed to newsletter",
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to subscribe. Please try again.",
    });
  }
});

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
