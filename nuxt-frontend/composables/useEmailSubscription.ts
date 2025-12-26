/**
 * Composable for email subscription functionality
 * Handles API calls, validation, and error states
 */
export function useEmailSubscription() {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Subscribe an email to the newsletter
   * @param email - The email address to subscribe
   * @param source - Where the subscription originated (footer, popup, homepage, etc.)
   * @returns Success status and message
   */
  async function subscribe(email: string, source: string = "footer") {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{
        message: string;
        code: string;
        subscriber?: {
          email: string;
          subscribedAt: string;
        };
      }>(`${strapiUrl}/api/email-subscribers/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: email.toLowerCase().trim(),
          source,
        },
      });

      isLoading.value = false;

      return {
        success:
          response.code === "SUCCESS" || response.code === "ALREADY_SUBSCRIBED",
        code: response.code,
        message: response.message,
        alreadySubscribed: response.code === "ALREADY_SUBSCRIBED",
      };
    } catch (err: any) {
      isLoading.value = false;

      // Handle different error types
      if (err.response?.status === 400) {
        const errorData = err.response._data;
        error.value = errorData.message || "Invalid email address";
        return {
          success: false,
          code: errorData.code || "VALIDATION_ERROR",
          message: error.value,
        };
      }

      // Generic error
      error.value = "Failed to subscribe. Please try again.";
      return {
        success: false,
        code: "NETWORK_ERROR",
        message: error.value,
      };
    }
  }

  /**
   * Validate email format
   */
  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  return {
    subscribe,
    validateEmail,
    isLoading: readonly(isLoading),
    error: readonly(error),
  };
}
