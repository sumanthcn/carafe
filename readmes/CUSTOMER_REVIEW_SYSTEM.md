# Customer Review System Implementation

## Overview
Complete customer review system allowing users to write reviews with media uploads, view approved reviews, and mark reviews as helpful.

## Backend Implementation

### 1. Customer Review Collection Type
**File:** `/strapi-backend/src/api/customer-review/content-types/customer-review/schema.json`

**Fields:**
- `name` (string, required): Customer name
- `email` (email, required): Customer email
- `rating` (integer, required): 1-5 star rating
- `reviewTitle` (string, required): Review headline
- `reviewDescription` (text, required): Detailed review
- `images` (media, multiple): Up to 5 images (5MB each)
- `video` (media, single): 1 video (25MB max)
- `product` (relation): Many-to-one relation with Product
- `status` (enum): approved/rejected (default: approved - auto-published)
- `isVerifiedPurchase` (boolean): Verified purchase badge
- `helpfulCount` (integer): Count of helpful votes

### 2. API Routes
**File:** `/strapi-backend/src/api/customer-review/routes/customer-review.ts`

- `GET /api/customer-reviews` - List all reviews
- `GET /api/customer-reviews/:id` - Get single review
- `POST /api/customer-reviews` - Create new review
- `PUT /api/customer-reviews/:id` - Update review
- `DELETE /api/customer-reviews/:id` - Delete review

### 3. Controller & Service
- **Controller:** `/strapi-backend/src/api/customer-review/controllers/customer-review.ts`
- **Service:** `/strapi-backend/src/api/customer-review/services/customer-review.ts`

### 4. Product Schema Update
**File:** `/strapi-backend/src/api/product/content-types/product/schema.json`

Updated `reviews` relation:
```json
"reviews": {
  "type": "relation",
  "relation": "oneToMany",
  "target": "api::customer-review.customer-review",
  "mappedBy": "product"
}
```

## Frontend Implementation

### 1. TypeScript Types
**File:** `/nuxt-frontend/types/strapi.ts`

Added `CustomerReview` interface with all fields and relation types.

### 2. Review Composable
**File:** `/nuxt-frontend/composables/useCustomerReviews.ts`

**Functions:**
- `submitReview()` - Submit new review with media
- `fetchProductReviews()` - Get approved reviews for a product
- `markReviewHelpful()` - Increment helpful count
- `validateImages()` - Client-side image validation (5 images, 5MB each)
- `validateVideo()` - Client-side video validation (1 video, 25MB max)
- `uploadMedia()` - Upload files to Strapi

**Validation Rules:**
- Images: JPG, PNG, WebP formats, max 5 files, 5MB each
- Video: MP4, MOV, WebM formats, max 1 file, 25MB

### 3. WriteReviewModal Component
**File:** `/nuxt-frontend/components/product/WriteReviewModal.vue`

**Features:**
- Modal dialog with form
- Star rating selector (1-5 stars)
- Name, email, review title, review description fields
- Image upload with preview thumbnails (max 5)
- Video upload with preview player (max 1)
- Client-side validation before submission
- File size validation with error messages
- Loading state during submission
- Success/error feedback

**Form Validation:**
- All fields required except media
- Email format validation
- Minimum 10 characters for description
- Rating must be selected (1-5)
- File size and type validation

### 4. CustomerReviews Component
**File:** `/nuxt-frontend/components/product/CustomerReviews.vue`

**Features:**

#### Header Section
- "Write a Review" button
- Average rating display with stars
- Total review count

#### Empty State
- Displays when no reviews exist
- Call-to-action to write first review

#### Review List
- Each review card shows:
  - Reviewer avatar (first letter of name)
  - Reviewer name
  - Verified purchase badge (if applicable)
  - Star rating
  - Review date (relative format)
  - Review title and description
  - Review images (clickable thumbnails)
  - Review video (embedded player)
  - "Helpful" button with count

#### Image Gallery
- Full-screen image viewer
- Navigation arrows for multiple images
- Image counter (e.g., "2 / 5")
- Close button

#### Helpful Button
- Mark reviews as helpful
- Stored in localStorage to prevent duplicate votes
- Visual feedback when marked helpful

**Review Display Logic:**
- Only shows approved reviews (status: "approved")
- Sorted by newest first (createdAt:desc)
- Relative date formatting (e.g., "2 days ago", "1 week ago")
- Auto-loads reviews on component mount

### 5. Product Page Integration
**File:** `/nuxt-frontend/pages/shop-coffee/[slug].vue`

Added CustomerReviews component below Related Products:
```vue
<section v-if="product.documentId" class="container reviews-section">
  <CustomerReviews :product-id="product.documentId" />
</section>
```

## User Workflows

### Writing a Review

1. **Customer clicks "Write a Review" button**
   - Opens WriteReviewModal

2. **Customer fills out form**
   - Name and email (required)
   - Star rating (required)
   - Review title (required)
   - Review description (required, min 10 chars)
   - Images (optional, up to 5, 5MB each)
   - Video (optional, 1 file, 25MB max)

3. **Client-side validation**
   - Checks all required fields
   - Validates email format
   - Validates file sizes and types
   - Shows inline error messages

4. **Media upload**
   - Images and video uploaded to Strapi media library
   - Upload progress handled
   - Error handling for failed uploads

5. **Review submission**
   - Review created with status: "approved" (auto-published)
   - Associated with product
   - Success message shown
   - Modal closes
   - Review appears immediately on product page

6. **Admin moderation (in Strapi) - Optional**
   - Admin can review published reviews
   - Changes status to "rejected" to hide inappropriate reviews
   - Can delete reviews permanently
   - Can mark as verified purchase

### Viewing Reviews

1. **Reviews automatically loaded** when product page loads
2. **All approved reviews shown** (auto-approved on submission)
3. **Reviews sorted by newest first**
4. **Customer can:**
   - Read review text
   - View reviewer details
   - See verified purchase badge
   - Click image thumbnails to view full-size in gallery
   - Watch video reviews
   - Mark reviews as helpful (once per review)

### Image Gallery

1. **Click any review image** thumbnail
2. **Full-screen gallery opens** with:
   - Current image displayed
   - Navigation arrows (if multiple images)
   - Image counter
   - Close button
3. **Navigate between images** with arrow buttons
4. **Close gallery** by clicking close button or overlay

## Admin Tasks

### In Strapi Admin Panel

1. **Access customer reviews:**
   - Navigate to "Customer Review" collection type
   - View all published reviews

2. **Review moderation (optional):**
   - Check review content for appropriateness
   - Verify review images and videos
   - Change status:
     - `approved` → `rejected` (hide inappropriate content)
   - Or delete reviews permanently

3. **Mark verified purchases:**
   - Check `isVerifiedPurchase` checkbox
   - Adds verified badge on frontend

4. **Manage reviews:**
   - Edit review content if needed
   - Delete spam/inappropriate reviews
   - View review statistics

**Note:** Reviews are auto-approved and published immediately. Admins can disable (reject) or delete them later if needed.

## File Upload Specifications

### Images
- **Formats:** JPG, JPEG, PNG, WebP
- **Max count:** 5 images per review
- **Max size:** 5MB per image
- **Validation:** Client-side before upload
- **Display:** Thumbnail grid, clickable for full-size

### Video
- **Formats:** MP4, MOV, WebM
- **Max count:** 1 video per review
- **Max size:** 25MB
- **Validation:** Client-side before upload
- **Display:** Embedded HTML5 video player with controls

## Styling

### Design Elements
- Modal with smooth transitions
- Star rating with hover effects
- Image preview grid with remove buttons
- Video preview with remove button
- Form validation error messages (red)
- Success feedback (via alert - can be replaced with toast)
- Responsive design (mobile-friendly)

### Color Scheme
- Primary color: `#8b4513` (coffee brown)
- Hover color: `#6b3410` (darker brown)
- Border color: `#e5e7eb` (light gray)
- Background: White with subtle gray accents

## Testing Checklist

### Backend
- [x] Customer review collection type created
- [x] API routes configured
- [x] Product relation established
- [ ] Test review creation via API
- [ ] Test status filtering (only approved shown)
- [ ] Test media upload to Strapi

### Frontend
- [x] WriteReviewModal component created
- [x] CustomerReviews component created
- [x] Composable with validation created
- [x] Integration with product page
- [ ] Test form validation
- [ ] Test image upload (5 files, 5MB limit)
- [ ] Test video upload (1 file, 25MB limit)
- [ ] Test review submission
- [ ] Test review display
- [ ] Test helpful button
- [ ] Test image gallery
- [ ] Test mobile responsiveness

### Edge Cases to Test
- [ ] Review submission with no media
- [ ] Review submission with images only
- [ ] Review submission with video only
- [ ] Review submission with both images and video
- [ ] File size validation (over limit)
- [ ] File type validation (wrong format)
- [ ] Network error during upload
- [ ] Product with no reviews (empty state)
- [ ] Marking same review helpful twice
- [ ] Long review text (text overflow)
- [ ] Multiple images in gallery navigation

## Next Steps

1. **Test the complete flow:**
   - Create a product in Strapi
   - Submit a review through the frontend
   - Approve it in Strapi admin
   - Verify it appears on the product page

2. **Optional enhancements:**
   - Replace `alert()` with toast notification library
   - Add loading skeleton for reviews
   - Add pagination for many reviews
   - Add filter/sort options (newest, highest rated, etc.)
   - Add review response feature (shop owner replies)
   - Add email notification for new reviews
   - Add review photos lightbox with zoom
   - Add video thumbnail generation

3. **Admin improvements:**
   - Create custom Strapi admin view for review moderation
   - Add bulk approve/reject actions
   - Add email templates for review status changes
   - Add analytics dashboard for review insights

## API Endpoints Reference

### Frontend to Backend

**Create Review:**
```http
POST /api/customer-reviews
Content-Type: application/json

{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "rating": 5,
    "reviewTitle": "Excellent Coffee",
    "reviewDescription": "Best coffee I've ever had...",
    "product": "product-document-id",
    "images": [1, 2, 3],  // Media IDs after upload
    "video": 4             // Media ID after upload
  }
}
```

**Upload Media:**
```http
POST /api/upload
Content-Type: multipart/form-data

files: [File, File, ...]
```

**Get Product Reviews:**
```http
GET /api/customer-reviews?filters[product][documentId][$eq]=product-id&filters[status][$eq]=approved&populate[images]=true&populate[video]=true&sort[0]=createdAt:desc
```

**Mark Review Helpful:**
```http
PUT /api/customer-reviews/:id
Content-Type: application/json

{
  "data": {
    "helpfulCount": 5
  }
}
```

## Files Created/Modified

### Backend
- ✅ `/strapi-backend/src/api/customer-review/content-types/customer-review/schema.json` (NEW)
- ✅ `/strapi-backend/src/api/customer-review/routes/customer-review.ts` (NEW)
- ✅ `/strapi-backend/src/api/customer-review/controllers/customer-review.ts` (NEW)
- ✅ `/strapi-backend/src/api/customer-review/services/customer-review.ts` (NEW)
- ✅ `/strapi-backend/src/api/product/content-types/product/schema.json` (UPDATED)

### Frontend
- ✅ `/nuxt-frontend/types/strapi.ts` (UPDATED - added CustomerReview interface)
- ✅ `/nuxt-frontend/composables/useCustomerReviews.ts` (NEW)
- ✅ `/nuxt-frontend/components/product/WriteReviewModal.vue` (NEW)
- ✅ `/nuxt-frontend/components/product/CustomerReviews.vue` (NEW)
- ✅ `/nuxt-frontend/pages/shop-coffee/[slug].vue` (UPDATED - added CustomerReviews component)

## Status: ✅ IMPLEMENTATION COMPLETE

The customer review system is fully implemented with:
- ✅ Backend schema, routes, controllers, and services
- ✅ Frontend components for writing and viewing reviews
- ✅ Media upload with validation (images and video)
- ✅ Review moderation system (pending/approved/rejected)
- ✅ Helpful button with vote tracking
- ✅ Image gallery with full-screen view
- ✅ Responsive design
- ✅ Form validation and error handling

**Ready for testing!** 🎉
