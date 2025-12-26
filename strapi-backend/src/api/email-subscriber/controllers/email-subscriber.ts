/**
 * email-subscriber controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::email-subscriber.email-subscriber",
  ({ strapi }) => ({
    /**
     * Custom subscribe endpoint
     * Handles email validation, duplicate prevention, and proper error responses
     */
    async subscribe(ctx) {
      try {
        const { email, source = "footer" } = ctx.request.body;

        // Validation: Check if email is provided
        if (!email) {
          return ctx.badRequest("Email is required", {
            code: "EMAIL_REQUIRED",
          });
        }

        // Validation: Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return ctx.badRequest("Invalid email format", {
            code: "INVALID_EMAIL",
          });
        }

        // Normalize email (lowercase)
        const normalizedEmail = email.toLowerCase().trim();

        // Check if email already exists
        const existingSubscriber = await strapi.db
          .query("api::email-subscriber.email-subscriber")
          .findOne({
            where: { email: normalizedEmail },
          });

        if (existingSubscriber) {
          // Email already subscribed
          return ctx.send(
            {
              message: "This email is already subscribed",
              code: "ALREADY_SUBSCRIBED",
              subscriber: {
                email: existingSubscriber.email,
                subscribedAt: existingSubscriber.createdAt,
              },
            },
            200
          );
        }

        // Create new subscriber
        const subscriber = await strapi.db
          .query("api::email-subscriber.email-subscriber")
          .create({
            data: {
              email: normalizedEmail,
              source,
              isActive: true,
            },
          });

        // Success response
        return ctx.send(
          {
            message: "Successfully subscribed to our Coffee Circle!",
            code: "SUCCESS",
            subscriber: {
              email: subscriber.email,
              subscribedAt: subscriber.createdAt,
            },
          },
          201
        );
      } catch (error) {
        strapi.log.error("Email subscription error:", error);

        // Handle unique constraint violation (database level)
        if (error.code === "ER_DUP_ENTRY" || error.code === "23505") {
          return ctx.send(
            {
              message: "This email is already subscribed",
              code: "ALREADY_SUBSCRIBED",
            },
            200
          );
        }

        // Generic error
        return ctx.internalServerError("Failed to process subscription", {
          code: "SERVER_ERROR",
        });
      }
    },
  })
);
