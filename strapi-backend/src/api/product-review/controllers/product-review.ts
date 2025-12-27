/**
 * product-review controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product-review.product-review",
  ({ strapi }) => ({
    /**
     * Create a new product review with purchase verification
     */
    async create(ctx) {
      const { productId, rating, reviewTitle, reviewText } = ctx.request.body;
      const user = ctx.state.user;

      // Require authentication
      if (!user) {
        return ctx.unauthorized("You must be logged in to submit a review");
      }

      // Validate required fields
      if (!productId || !rating || !reviewTitle || !reviewText) {
        return ctx.badRequest("Missing required fields");
      }

      // Validate rating range
      if (rating < 1 || rating > 5) {
        return ctx.badRequest("Rating must be between 1 and 5");
      }

      try {
        // Check if product exists
        const product = await strapi.entityService.findOne(
          "api::product.product",
          productId,
          { populate: "*" }
        );

        if (!product) {
          return ctx.notFound("Product not found");
        }

        // Check if user already reviewed this product
        const existingReview = await strapi.db
          .query("api::product-review.product-review")
          .findOne({
            where: {
              product: productId,
              user: user.id,
            },
          });

        if (existingReview) {
          return ctx.badRequest(
            "You have already reviewed this product. Please edit your existing review instead."
          );
        }

        // Verify purchase - Check if user has an order containing this product
        const orders = await strapi.db.query("api::order.order").findMany({
          where: {
            customerEmail: user.email,
            status: {
              $in: ["paid", "processing", "shipped", "delivered"],
            },
          },
          populate: ["items"],
        });

        let isVerifiedPurchase = false;

        // Check if any order contains this product
        for (const order of orders) {
          if (order.items && Array.isArray(order.items)) {
            const hasProduct = order.items.some(
              (item: any) => item.product === productId || item.productId === productId
            );
            if (hasProduct) {
              isVerifiedPurchase = true;
              break;
            }
          }
        }

        // Create the review
        const review = await strapi.entityService.create(
          "api::product-review.product-review",
          {
            data: {
              product: productId,
              user: user.id,
              customerEmail: user.email,
              customerName: user.username || user.email.split("@")[0],
              rating,
              reviewTitle,
              reviewText,
              isVerifiedPurchase,
            },
          }
        );

        return ctx.send({ data: review });
      } catch (error) {
        console.error("Error creating review:", error);
        return ctx.internalServerError("Failed to create review");
      }
    },

    /**
     * Get reviews for a specific product
     */
    async findByProduct(ctx) {
      const { productId } = ctx.params;
      const { page = 1, pageSize = 10, sort = "createdAt:desc" } = ctx.query;

      try {
        const reviews = await strapi.entityService.findMany(
          "api::product-review.product-review",
          {
            filters: {
              product: {
                id: productId,
              },
            },
            populate: ["user"],
            sort: [sort],
            pagination: {
              page,
              pageSize,
            },
          }
        );

        // Calculate rating statistics
        const allReviews = await strapi.db
          .query("api::product-review.product-review")
          .findMany({
            where: {
              product: productId,
            },
            select: ["rating"],
          });

        const ratingStats = {
          total: allReviews.length,
          average: 0,
          distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
        };

        if (allReviews.length > 0) {
          const sum = allReviews.reduce(
            (acc: number, review: any) => acc + review.rating,
            0
          );
          ratingStats.average = sum / allReviews.length;

          // Calculate distribution
          allReviews.forEach((review: any) => {
            ratingStats.distribution[review.rating as keyof typeof ratingStats.distribution]++;
          });
        }

        return ctx.send({
          data: reviews,
          stats: ratingStats,
        });
      } catch (error) {
        console.error("Error fetching reviews:", error);
        return ctx.internalServerError("Failed to fetch reviews");
      }
    },

    /**
     * Update a review (only by the author)
     */
    async update(ctx) {
      const { id } = ctx.params;
      const { rating, reviewTitle, reviewText } = ctx.request.body;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to update a review");
      }

      try {
        // Find the review
        const review: any = await strapi.entityService.findOne(
          "api::product-review.product-review",
          id,
          {
            populate: ["user"],
          }
        );

        if (!review) {
          return ctx.notFound("Review not found");
        }

        // Check if user is the author
        if (review.user?.id !== user.id) {
          return ctx.forbidden("You can only update your own reviews");
        }

        // Update the review
        const updatedReview = await strapi.entityService.update(
          "api::product-review.product-review",
          id,
          {
            data: {
              rating,
              reviewTitle,
              reviewText,
            },
          }
        );

        return ctx.send({ data: updatedReview });
      } catch (error) {
        console.error("Error updating review:", error);
        return ctx.internalServerError("Failed to update review");
      }
    },

    /**
     * Delete a review (only by the author)
     */
    async delete(ctx) {
      const { id } = ctx.params;
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("You must be logged in to delete a review");
      }

      try {
        // Find the review
        const review: any = await strapi.entityService.findOne(
          "api::product-review.product-review",
          id,
          {
            populate: ["user"],
          }
        );

        if (!review) {
          return ctx.notFound("Review not found");
        }

        // Check if user is the author
        if (review.user?.id !== user.id) {
          return ctx.forbidden("You can only delete your own reviews");
        }

        // Delete the review
        await strapi.entityService.delete(
          "api::product-review.product-review",
          id
        );

        return ctx.send({ data: { id } });
      } catch (error) {
        console.error("Error deleting review:", error);
        return ctx.internalServerError("Failed to delete review");
      }
    },
  })
);
