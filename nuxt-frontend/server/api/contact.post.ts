/**
 * Contact Form Handler
 * Sends contact form submissions via email
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    type?: "general" | "wholesale" | "feedback";
  }>(event);

  // Validation
  if (!body.name || !body.email || !body.message) {
    throw createError({
      statusCode: 400,
      message: "Name, email, and message are required",
    });
  }

  if (!isValidEmail(body.email)) {
    throw createError({
      statusCode: 400,
      message: "Valid email address required",
    });
  }

  try {
    // Log the contact form submission
    console.log("Contact form submission:", {
      name: body.name,
      email: body.email,
      subject: body.subject,
      type: body.type || "general",
      timestamp: new Date().toISOString(),
    });

    // TODO: Send email notification
    // This could be via:
    // 1. Strapi email plugin
    // 2. SendGrid, Mailgun, etc.
    // 3. AWS SES
    // 4. Nodemailer

    // TODO: Store in Strapi as Contact Submission
    // const config = useRuntimeConfig();
    // await $fetch(`${config.public.strapiUrl}/api/contact-submissions`, {...});

    return {
      success: true,
      message: "Thank you for your message. We will get back to you soon.",
    };
  } catch (error) {
    console.error("Contact form error:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to send message. Please try again or email us directly.",
    });
  }
});

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
