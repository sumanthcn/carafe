# Product Variants & Attributes Implementation Guide

## Overview

This implementation adds comprehensive product variant support (weight, grind size, roast type) and detailed product attributes to the Carafe Coffee e-commerce platform.

## ✅ What's Been Implemented

### Backend (Strapi)

#### 1. New Component: Product Variant
**File**: `strapi-backend/src/components/product/variant.json`

Fields:
- `weight`: 250g, 500g, 1kg, 2kg (required)
- `grindSize`: Espresso, Filter, Whole Bean, Moka Pot, Aeropress, V60, Chemex, Cafetiere (optional)
- `roastType`: Filter, Espresso (optional)
- `price`: Decimal (required)
- `salePrice`: Decimal (optional)
- `sku`: String (required, unique per variant)
- `stockQuantity`: Integer
- `inStock`: Boolean

#### 2. New Component: Product Attributes
**File**: `strapi-backend/src/components/product/attributes.json`

Fields:
- `taste`: Text description
- `origin`: Country/origin
- `region`: Specific region
- `varietal`: Coffee varietal
- `process`: Processing method
- `altitude`: Growing altitude
- `bestServed`: Serving recommendations

#### 3. Updated Product Schema
**File**: `strapi-backend/src/api/product/content-types/product/schema.json`

Added fields:
- `availableWeights`: JSON array (defaults: ["250g", "500g", "1kg", "2kg"])
- `availableGrindSizes`: JSON array (defaults: all grind sizes)
- `availableRoastTypes`: JSON array (defaults: ["Filter", "Espresso"])
- `variants`: Component (repeatable) - product.variant
- `attributes`: Component (single) - product.attributes

### Frontend (Nuxt)

#### 1. Updated TypeScript Types
**File**: `nuxt-frontend/types/strapi.ts`

New interfaces:
```typescript
interface ProductVariant {
  id: number;
  weight: "250g" | "500g" | "1kg" | "2kg";
  grindSize?: "Espresso" | "Filter" | "Whole Bean" | ...;
  roastType?: "Filter" | "Espresso";
  price: number;
  salePrice?: number;
  sku: string;
  stockQuantity: number;
  inStock: boolean;
}

interface ProductAttributes {
  taste?: string;
  origin?: string;
  region?: string;
  varietal?: string;
  process?: string;
  altitude?: string;
  bestServed?: string;
}
```

Updated `Product` interface with:
- `availableWeights?: string[]`
- `availableGrindSizes?: string[]`
- `availableRoastTypes?: string[]`
- `variants?: ProductVariant[]`
- `attributes?: ProductAttributes`

Updated `CartItem` interface with:
- `selectedVariant?: ProductVariant`

#### 2. New Component: VariantSelector
**File**: `nuxt-frontend/components/product/VariantSelector.vue`

Features:
- Visual button-based selection for Weight, Roast Type, and Grind Size
- Dynamic price display based on selected variant
- Discount badge for sale prices
- Stock status indicator
- Automatic initialization with first available options
- Emits selected variant to parent component

#### 3. New Component: ProductAttributes
**File**: `nuxt-frontend/components/product/ProductAttributes.vue`

Features:
- Grid layout displaying all product attributes
- Icon for each attribute type
- Hover effects with subtle animations
- Responsive design (single column on mobile)
- Only displays attributes that have values

#### 4. Updated Product Detail Page
**File**: `nuxt-frontend/pages/shop-coffee/[slug].vue`

Changes:
- Imports and uses `VariantSelector` component
- Imports and uses `ProductAttributes` component
- Shows variant selector when product has variants
- Shows traditional price display when no variants
- Validates variant selection before add to cart
- Passes selected variant to cart store
- Computed property `canAddToCart` checks variant stock

#### 5. Updated Cart Store
**File**: `nuxt-frontend/stores/cart.ts`

Changes:
- `addItem()` now accepts optional `variant` parameter
- Subtotal calculation uses variant price if selected
- Cart items can have different variants of same product
- Unique cart keys for product + variant combinations

#### 6. Updated Cart Sidebar
**File**: `nuxt-frontend/components/CartSidebar.vue`

Changes:
- Displays variant information (weight, roast, grind) as tags
- Uses variant price for display if variant is selected
- Unique keys for cart items include variant ID

## 🎯 How It Works

### Product Without Variants (Legacy)
If a product has no variants defined, it works exactly as before:
- Traditional price display
- Simple add to cart
- No variant selection needed

### Product With Variants
If a product has variants:
1. **Available options** are defined at product level (e.g., which weights this product comes in)
2. **Variants** are created for each valid combination (e.g., 250g Espresso, 500g Filter, etc.)
3. **Variant Selector** displays only the available options
4. **User must select** weight (required), roast type (if multiple), grind size (if multiple)
5. **Price updates** based on selected variant
6. **Stock is checked** from the selected variant
7. **Add to cart** includes the variant information

### Flexible Configuration
- Products can have only Filter OR only Espresso (set in availableRoastTypes)
- Products can have limited grind sizes (e.g., only Whole Bean)
- Each variant can have its own price and sale price
- Each variant tracks its own stock level

## 📋 Setting Up Products in Strapi

### Step 1: Define Available Options

In the product editor:

1. **Available Weights**: `["250g", "500g"]` (JSON array)
2. **Available Roast Types**: `["Espresso"]` (single option) or `["Filter", "Espresso"]` (both)
3. **Available Grind Sizes**: `["Whole Bean", "Espresso", "Filter"]` (example)

### Step 2: Create Variants

For each valid combination, create a variant:

**Example for 250g product with both roast types:**

Variant 1:
- Weight: 250g
- Roast Type: Filter
- Grind Size: Whole Bean
- Price: 12.00
- SKU: PROD-250-FILTER-WHOLE
- Stock: 50

Variant 2:
- Weight: 250g
- Roast Type: Espresso
- Grind Size: Whole Bean
- Price: 12.00
- SKU: PROD-250-ESPRESSO-WHOLE
- Stock: 35

...and so on for each combination.

### Step 3: Add Product Attributes

Fill in the Attributes component:
- Taste: "Chocolate, Caramel, Nutty"
- Origin: "Colombia"
- Region: "Huila"
- Varietal: "Caturra, Castillo"
- Process: "Washed"
- Altitude: "1,600-1,900 MASL"
- Best Served: "Espresso, Filter"

## 🧪 Testing

### Test Scenario 1: Product with Full Variants
1. Create product with all weight options
2. Set both roast types available
3. Set all grind sizes available
4. Create 32 variants (4 weights × 2 roasts × 4 grinds)
5. Visit product page
6. Verify all selectors appear
7. Select each option and verify price updates
8. Add to cart and check variant info displays

### Test Scenario 2: Limited Options
1. Create product with only 250g and 500g
2. Set only Espresso roast type
3. Set only Whole Bean and Espresso grind sizes
4. Create 4 variants
5. Verify only applicable options show
6. Verify roast selector shows but disabled (single option auto-selected)

### Test Scenario 3: Simple Product (No Variants)
1. Create product without variants array
2. Set price directly on product
3. Visit product page
4. Verify traditional price display shows
5. Verify add to cart works without variant selection

### Test Scenario 4: Cart Functionality
1. Add product with variant A to cart
2. Add same product with variant B to cart
3. Verify two separate line items in cart
4. Verify each shows correct variant tags
5. Verify each uses correct price

## 🚀 Deployment Steps

### 1. Restart Strapi
```bash
cd strapi-backend
npm run develop
```

Strapi will detect new components and update the database schema automatically.

### 2. Verify Components in Strapi Admin
- Navigate to Content-Type Builder
- Check "Components" section
- Verify "Product Variant" and "Product Attributes" components exist

### 3. Update Existing Products (Optional)
For products you want to keep simple:
- Leave `variants` array empty
- Leave `attributes` empty
- They will continue working as before

For products you want to add variants to:
- Fill in `availableWeights`, `availableRoastTypes`, `availableGrindSizes`
- Create variant entries for each valid combination
- Fill in attributes component

### 4. Test Frontend
```bash
cd nuxt-frontend
npm run dev
```

Visit a product page and verify:
- ✅ Variant selectors display correctly
- ✅ Price updates based on selection
- ✅ Stock status shows correctly
- ✅ Add to cart requires variant selection
- ✅ Cart displays variant information
- ✅ Attributes section displays at bottom

## 📊 Data Migration Script (Optional)

If you want to convert existing products to use variants, here's a sample script:

```javascript
// Run in Strapi admin or via API
async function convertProductToVariants(productId) {
  const product = await strapi.entityService.findOne('api::product.product', productId);
  
  // Create default variant using existing product data
  const defaultVariant = {
    weight: '250g',
    roastType: 'Filter',
    grindSize: 'Whole Bean',
    price: product.price,
    salePrice: product.salePrice,
    sku: product.sku || `${product.slug}-250-filter-whole`,
    stockQuantity: product.stockQuantity || 0,
    inStock: product.inStock
  };

  // Update product with variant
  await strapi.entityService.update('api::product.product', productId, {
    data: {
      variants: [defaultVariant],
      availableWeights: ['250g'],
      availableRoastTypes: ['Filter'],
      availableGrindSizes: ['Whole Bean']
    }
  });
}
```

## 🎨 Customization

### Adding New Weight Options
1. Edit `strapi-backend/src/components/product/variant.json`
2. Add to `weight` enum: `["250g", "500g", "1kg", "2kg", "5kg"]`
3. Restart Strapi
4. Frontend will automatically support the new option

### Adding New Grind Sizes
1. Edit `strapi-backend/src/components/product/variant.json`
2. Add to `grindSize` enum
3. Restart Strapi
4. Frontend will automatically support the new option

### Styling Variants
Edit `nuxt-frontend/components/product/VariantSelector.vue`:
- `.selector-option` class controls button styling
- `.selector-option.active` class controls selected state
- `.variant-price` class controls price display

### Styling Attributes
Edit `nuxt-frontend/components/product/ProductAttributes.vue`:
- `.attribute-item` class controls attribute cards
- `.attribute-icon` class controls icon styling
- Swap SVG icons for different visuals

## 🐛 Troubleshooting

### Strapi Won't Start
- Check component JSON files have `"kind": "component"`
- Verify no syntax errors in JSON files
- Check logs: `cd strapi-backend && npm run develop`

### Variants Not Showing in Strapi Admin
- Clear browser cache
- Restart Strapi server
- Check Content-Type Builder for components

### Frontend Shows No Variant Selector
- Verify product has `variants` array populated in Strapi
- Check browser console for errors
- Verify API response includes variant data

### Cart Not Showing Variant Info
- Clear browser localStorage: `localStorage.clear()`
- Restart frontend dev server
- Check cart store is properly initialized

### Price Not Updating
- Verify variants have `price` field set
- Check browser console for errors in computed properties
- Verify variant selector is emitting events correctly

## 📈 Future Enhancements

Potential additions:
- [ ] Bulk variant creation tool in Strapi admin
- [ ] CSV import for variants
- [ ] Variant images (different image per weight/roast)
- [ ] Quantity-based pricing (discounts for larger weights)
- [ ] Subscription options per variant
- [ ] Variant-specific inventory alerts
- [ ] Analytics tracking by variant popularity

## 🤝 Support

For questions or issues:
1. Check this documentation
2. Review component code comments
3. Test with simple products first
4. Use browser dev tools to inspect API responses
5. Check Strapi admin content-type builder

---

**Version**: 1.0.0  
**Last Updated**: December 30, 2024  
**Compatibility**: Strapi 5.x, Nuxt 3.x
