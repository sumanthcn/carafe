# Hero Carousel Features Implementation

## Overview
The hero carousel on the homepage is now fully configurable through Strapi CMS with support for button icons and customizable navigation styling.

## Features Implemented

### 1. Button Icon Support
- **Strapi Component**: `shared.button` now includes:
  - `icon` (media field) - Upload icons from media library
  - `iconPosition` (enum) - Choose between "left" or "right" positioning
  
- **Frontend Rendering**: Buttons in carousel slides now render icons:
  - Icons positioned left or right based on `iconPosition`
  - Icons automatically styled (white for colored buttons, adapt on hover)
  - Applied to both `primaryCta` and `secondaryCta` buttons

### 2. Carousel Settings Component
Created new Strapi component: `shared.carousel-settings` with configurable options:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `autoplay` | Boolean | true | Enable/disable automatic slide transition |
| `autoplayDelay` | Integer | 5000 | Delay between slides (1000-30000ms) |
| `showNavigation` | Boolean | true | Show/hide arrow navigation buttons |
| `showPagination` | Boolean | true | Show/hide pagination dots |
| `loop` | Boolean | true | Enable infinite loop |
| `effect` | Enum | "fade" | Transition effect: fade, slide, cube, flip |
| `speed` | Integer | 600 | Transition speed (300-3000ms) |
| `pauseOnHover` | Boolean | true | Pause autoplay when hovering |

### 3. Custom Navigation Styling
- **Arrow Buttons**: Circular white buttons with shadow
  - 48px diameter
  - White background with 95% opacity
  - Dark text color
  - Hover effects: scale up, increase shadow
  
- **Pagination Dots**:
  - Inactive: 12px circles, semi-transparent white (60% opacity)
  - Active: 32px wide rounded pill, solid white

### 4. Homepage Schema Updates
- Added `carouselSettings` component to homepage content type
- Updated populate parameters to fetch:
  - Button icons for both primary and secondary CTAs
  - Carousel settings configuration

## File Changes

### Strapi Backend
1. `/src/components/shared/button.json` - Added icon and iconPosition fields
2. `/src/components/shared/carousel-settings.json` - New component created
3. `/src/api/homepage/content-types/homepage/schema.json` - Added carouselSettings

### Nuxt Frontend
1. `/composables/useStrapi.ts`:
   - Updated populate parameters for button icons
   - Added carousel settings population
   
2. `/pages/index.vue`:
   - Dynamic Swiper configuration based on Strapi settings
   - Button icon rendering with position support
   - Custom carousel navigation styling
   - Enhanced hover states and transitions

## Usage in Strapi Admin

### Setting Up Carousel Settings
1. Navigate to Homepage content type
2. Expand "Carousel Settings" section
3. Configure:
   - Toggle autoplay on/off
   - Set autoplay delay (in milliseconds)
   - Enable/disable navigation arrows
   - Enable/disable pagination dots
   - Choose transition effect
   - Set transition speed
   - Configure pause on hover behavior

### Adding Button Icons
1. Edit any hero slide
2. In Primary CTA or Secondary CTA:
   - Click "Icon" field
   - Upload or select icon from media library
   - Choose "Icon Position": left or right
3. Save changes

## Technical Details

### Swiper Configuration
The carousel now uses computed properties to make all settings dynamic:

```vue
:autoplay="carouselSettings.autoplay ? {
  delay: carouselSettings.autoplayDelay,
  disableOnInteraction: false,
  pauseOnMouseEnter: carouselSettings.pauseOnHover
} : false"
:navigation="carouselSettings.showNavigation"
:pagination="carouselSettings.showPagination ? { clickable: true } : false"
:effect="carouselSettings.effect"
:loop="carouselSettings.loop"
:speed="carouselSettings.speed"
```

### Icon Styling
- Icons are 20x20px
- White color filter for primary buttons
- Adapt to button text color on hover
- 0.25rem margin for spacing

## Next Steps

To use these features:

1. **Restart Strapi** (if not already running):
   ```bash
   cd strapi-backend
   npm run develop
   ```

2. **Add Carousel Settings**:
   - Edit Homepage content type
   - Fill in Carousel Settings component
   - Save and publish

3. **Add Button Icons**:
   - Edit hero carousel slides
   - Upload icons to button CTAs
   - Set icon positions
   - Save and publish

4. **Test Frontend**:
   - The Nuxt app will automatically fetch and apply settings
   - Navigation buttons will show with custom rounded style
   - Button icons will render in configured positions
