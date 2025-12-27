# NuxtRating Component Usage

The `nuxt-rating` component has been integrated into the project for displaying and collecting star ratings.

## Installation

Already installed and configured in `nuxt.config.ts`.

## Current Usage

### Product Details Page - Display Rating

Located in `/pages/shop-coffee/[slug].vue`:

```vue
<NuxtRating
  :rating-value="reviewStats.averageRating"
  :read-only="true"
  :rating-size="24"
  :rating-count="5"
  active-color="#ffc107"
  inactive-color="#ddd"
/>
```

**Props:**
- `rating-value`: The current rating (e.g., 4.5)
- `read-only`: true for display-only
- `rating-size`: Size of each star in pixels
- `rating-count`: Total number of stars (usually 5)
- `active-color`: Color of filled stars
- `inactive-color`: Color of empty stars

## Future Usage

### Review Form - User Input

Example component created at `/components/reviews/ReviewForm.vue`:

```vue
<NuxtRating
  v-model="formData.rating"
  :rating-size="32"
  :rating-count="5"
  active-color="#ffc107"
  inactive-color="#ddd"
  :read-only="false"
/>
```

**Props for Interactive Mode:**
- `v-model`: Binds to reactive data
- `read-only`: false for user input
- `rating-size`: Larger size (32px) for better clickability

## Component Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ratingValue` | Number | 0 | Initial rating value |
| `ratingCount` | Number | 5 | Number of stars |
| `ratingSize` | Number | 24 | Size of stars in pixels |
| `activeColor` | String | '#ffc107' | Color of filled stars |
| `inactiveColor` | String | '#ddd' | Color of empty stars |
| `readOnly` | Boolean | false | Whether rating is interactive |
| `showRating` | Boolean | false | Show numerical rating |
| `ratingContent` | String | '★' | Custom content for stars |

## Example: Review Submission Flow

1. User clicks "Write a Review" button
2. ReviewForm component opens with interactive NuxtRating
3. User selects rating (1-5 stars)
4. User fills in title and review text
5. Form validates rating is not 0
6. Submit to API using `useProductReviews` composable

## Next Steps

To implement full review functionality:

1. **Create Review Submission Endpoint** in `useProductReviews.ts`:
   ```typescript
   async function submitReview(data: {
     productId: number;
     rating: number;
     reviewTitle: string;
     reviewText: string;
   }) {
     // API call to Strapi
   }
   ```

2. **Add Review Form to Product Page**:
   - Import ReviewForm component
   - Show below existing reviews
   - Require authentication (check JWT token)

3. **Strapi Configuration**:
   - Enable authenticated users to create reviews
   - Implement purchase verification
   - Add review moderation workflow

## Documentation

Full documentation: https://github.com/TonyFresneau/nuxt-rating
