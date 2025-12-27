# Customer Reviews Component System

Complete review system with reusable components, filtering, pagination, and a dedicated reviews page.

## Components Created

### 1. `ReviewItem.vue`
Individual review card component displaying:
- Reviewer avatar and name
- Star rating with NuxtRating
- Review date
- Verified purchase badge
- Review title and text
- Helpful and Report buttons

### 2. `CustomerReviews.vue`
Main reviews container component with:
- Overall rating summary
- Rating distribution bars (clickable to filter)
- Reviews list
- Load More functionality
- View All Reviews link
- Filter by star rating

### 3. Reviews Page: `/pages/shop-coffee/reviews/[id].vue`
Dedicated full reviews page with:
- Breadcrumb navigation
- Search functionality
- Sort options (Recent, Helpful, Highest, Lowest)
- Filter by verified purchase
- Full pagination

## Usage Examples

### On Product Details Page (Current Implementation)

```vue
<CustomerReviews 
  v-if="product.id"
  :product-id="product.id"
  :initial-count="2"
  :load-more-count="3"
  :show-view-all="true"
/>
```

**Props:**
- `product-id` (number, required): The product ID to fetch reviews for
- `initial-count` (number, default: 2): Number of reviews to show initially
- `load-more-count` (number, default: 3): Number of reviews to load when clicking "Load More"
- `show-view-all` (boolean, default: true): Show "View All Reviews" button
- `is-view-all-page` (boolean, default: false): Set to true on dedicated reviews page

### On Dedicated Reviews Page

```vue
<CustomerReviews 
  :product-id="productId"
  :initial-count="10"
  :load-more-count="10"
  :show-view-all="false"
  :is-view-all-page="true"
/>
```

### Standalone Review Item

```vue
<ReviewItem :review="reviewData" />
```

## Features

### ✅ Rating Summary
- Average rating display with stars
- Total review count
- Rating distribution bars (5, 4, 3, 2, 1 stars)
- Percentage calculation for each rating level

### ✅ Filtering
- Click on any star rating bar to filter reviews by that rating
- Click again to clear filter
- Visual indication of active filter (blue background)

### ✅ Pagination
- **Initial Load**: Shows `initialCount` reviews (default: 2)
- **Load More**: Loads `loadMoreCount` additional reviews (default: 3)
- **Button Visibility**: "Load More" only shows when more reviews are available
- **View All**: Link to dedicated reviews page

### ✅ Review Display
- Reviewer avatar (FontAwesome user icon)
- Reviewer name (from customerName or user.username)
- Review date (formatted as "14 August 2024")
- Star rating (NuxtRating component)
- Verified purchase badge (if applicable)
- Review title (optional)
- Review text
- Helpful counter
- Report button

### ✅ Dedicated Reviews Page
- Full URL: `/shop-coffee/reviews/[productId]`
- Breadcrumb navigation
- Search bar for finding specific reviews
- Sort dropdown (Most Recent, Most Helpful, Highest Rating, Lowest Rating)
- Filter by verified purchase only
- Full pagination (10 reviews per load)

## API Integration

The components use the `useProductReviews` composable which fetches from:
```
GET /api/product-reviews/product/:productId
```

**Response format:**
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "xxx",
      "rating": 5,
      "reviewTitle": "Great coffee!",
      "reviewText": "Love it...",
      "isVerifiedPurchase": true,
      "createdAt": "2024-08-14T00:00:00.000Z",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "isHelpful": 4,
      "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com"
      }
    }
  ],
  "meta": {
    "averageRating": 4.5,
    "totalReviews": 100,
    "ratingDistribution": {
      "5": 68,
      "4": 19,
      "3": 9,
      "2": 3,
      "1": 1
    }
  }
}
```

## Styling

All components use:
- SCSS with centralized variables
- Responsive design (mobile-first)
- Consistent color scheme:
  - Primary: #007ba7 (blue)
  - Border: #db8403 (orange/gold)
  - Text: From $color-text variable
- Smooth transitions and hover effects

## Future Enhancements

### TODO: Implement Backend API Calls

Currently, the following features need backend integration:

1. **Mark Helpful** - POST to increment helpful count
2. **Report Review** - POST to flag inappropriate reviews
3. **Search Reviews** - Backend filtering by search query
4. **Sort Reviews** - Backend sorting implementation
5. **Filter by Verified** - Backend query parameter

### Example API Implementations Needed

```typescript
// In useProductReviews.ts
async function markReviewHelpful(reviewId: number) {
  return await $fetch(`/api/product-reviews/${reviewId}/helpful`, {
    method: 'POST'
  });
}

async function reportReview(reviewId: number, reason: string) {
  return await $fetch(`/api/product-reviews/${reviewId}/report`, {
    method: 'POST',
    body: { reason }
  });
}
```

## Testing Checklist

- [x] Component renders without errors
- [x] Reviews load from API
- [x] Rating summary displays correctly
- [x] Load More shows correct number of reviews
- [x] Load More hides when no more reviews
- [x] Star filter works correctly
- [x] View All link points to correct URL
- [ ] Helpful button increments count (needs API)
- [ ] Report button submits report (needs API)
- [ ] Search filters reviews (needs API)
- [ ] Sort changes review order (needs API)

## File Structure

```
components/
  reviews/
    CustomerReviews.vue    # Main container component
    ReviewItem.vue         # Individual review card
    ReviewForm.vue         # (Already exists) For submitting reviews

pages/
  shop-coffee/
    reviews/
      [id].vue             # Dedicated reviews page

composables/
  useProductReviews.ts     # API integration composable
```

## Notes

- Reviews are only displayed if `product.id` exists
- The component automatically handles empty states
- All FontAwesome icons are pre-configured
- NuxtRating component is used consistently across all rating displays
- The system is fully responsive and works on all screen sizes
