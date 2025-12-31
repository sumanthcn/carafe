# Product Variants System - Schema Cleanup

## Overview
This document describes the cleanup performed to remove duplicate fields from the Product schema and implement a cleaner, variants-first data model for the e-commerce system.

## Problem Identified
The initial implementation had duplicate fields between Product and ProductVariant:
- `price`, `salePrice`, `sku` existed in both Product and Variant
- `weight`, `weightUnit`, `stockQuantity`, `inStock` existed in both places
- `returnPolicy` and `shippingInfo` were per-product instead of global
- `availableWeights`, `availableGrindSizes`, `availableRoastTypes` JSON fields were redundant (could be derived from variants)

This caused:
- Admin confusion (entering data in two places)
- Data inconsistency risk
- Maintenance overhead
- Unclear source of truth

## Solution Implemented

### 1. Backend Schema Changes

#### Product Schema (`strapi-backend/src/api/product/content-types/product/schema.json`)
**REMOVED FIELDS:**
- `price` - moved to variants only
- `salePrice` - moved to variants only
- `sku` - moved to variants only
- `weight` - moved to variants only
- `weightUnit` - moved to variants only
- `stockQuantity` - moved to variants only
- `inStock` - moved to variants only
- `returnPolicy` - moved to global shop-setting
- `shippingInfo` - moved to global shop-setting
- `availableWeights` - now derived from variants
- `availableGrindSizes` - now derived from variants
- `availableRoastTypes` - now derived from variants

**KEPT FIELDS:**
- Metadata: `name`, `slug`, `subtitle`, `description`, `shortDescription`
- Display: `currency`, `displayOrder`
- Flags: `isTopSeller`, `isLimitedEdition`, `isWhatsNew`
- Coffee info: `roastDate`, `origin`, `tastingNotes`, `variety`
- Media: `images`
- Components: `variants` (repeatable), `attributes` (single)
- Relations: `category`, `relatedProducts`
- SEO: `seo` component

#### Product Variant Component (`strapi-backend/src/components/product/variant.json`)
**Contains ALL SKU-specific data:**
```json
{
  "weight": "250g|500g|1kg|2kg",
  "grindSize": "Espresso|Filter|Whole Bean|...",
  "roastType": "Filter|Espresso",
  "price": "decimal (required)",
  "salePrice": "decimal (optional)",
  "sku": "string (required, unique)",
  "stockQuantity": "integer",
  "inStock": "boolean"
}
```

#### Shop Settings Single Type (`strapi-backend/src/api/shop-setting/content-types/shop-setting/schema.json`)
**NEW - Global shop policies:**
```json
{
  "returnPolicy": "richtext (required)",
  "shippingInfo": "richtext (required)",
  "freeShippingThreshold": "decimal (default: 50)",
  "standardShippingCost": "decimal (default: 5)",
  "currency": "enum (EUR|GBP|USD)"
}
```

### 2. Frontend Changes

#### TypeScript Interfaces (`nuxt-frontend/types/strapi.ts`)
Updated interfaces to match new schema:
- `Product` interface: removed 12 duplicate fields
- `ProductVariant` interface: contains all SKU data
- `ProductAttributes` interface: coffee characteristics
- `ShopSettings` interface: global policies
- `CartItem` interface: added `selectedVariant?: ProductVariant`

#### Smart Variant Selector (`nuxt-frontend/components/product/VariantSelector.vue`)
**Changed from props-based to computed-based:**
- **BEFORE:** Received `availableWeights`, `availableGrindSizes`, `availableRoastTypes` as props
- **AFTER:** Derives these options from the `variants` array automatically

```typescript
const availableWeights = computed(() => {
  const weights = [...new Set(props.variants.map(v => v.weight))];
  return weights.sort((a, b) => {
    const order = ['250g', '500g', '1kg', '2kg'];
    return order.indexOf(a) - order.indexOf(b);
  });
});
```

**Benefits:**
- No duplicate data entry
- Options always match actual variants
- Admin can't create mismatches between declared options and actual variants

#### Shop Settings Composable (`nuxt-frontend/composables/useShopSettings.ts`)
**NEW - Fetches global shop settings:**
```typescript
export const useShopSettings = () => {
  const settings = ref<ShopSettings | null>(null);
  const fetchShopSettings = async () => { ... };
  return { settings, fetchShopSettings };
};
```

#### Product Detail Page (`nuxt-frontend/pages/shop-coffee/[slug].vue`)
**Updated to use new architecture:**
- Removed references to `product.price`, `product.salePrice`, `product.inStock`
- Updated `canAddToCart` to check `selectedVariant.inStock` instead
- Removed `getDisplayPrice()` and `isOnSale()` functions (now handled by VariantSelector)
- Integrated `useShopSettings()` composable
- Display return/shipping policies from global shop settings
- Show message if product has no variants (admin needs to add them)

#### Cart System (`nuxt-frontend/stores/cart.ts`)
**Updated to support variants:**
- `addItem()` accepts optional `variant` parameter
- Cart items with same product but different variants are separate line items
- Unique key: product ID + variant ID

#### Cart Sidebar (`nuxt-frontend/components/CartSidebar.vue`)
**Displays variant information:**
- Shows weight, roast type, grind size as small tags
- Uses variant price if selected
- Clear visual indication of selected options

## Data Model

### Before (Problematic)
```
Product {
  price: 15.00           ← DUPLICATE
  salePrice: 12.00       ← DUPLICATE
  sku: "COF-001"         ← DUPLICATE
  weight: 250            ← DUPLICATE
  stockQuantity: 50      ← DUPLICATE
  inStock: true          ← DUPLICATE
  returnPolicy: "..."    ← PER-PRODUCT
  shippingInfo: "..."    ← PER-PRODUCT
  variants: [
    { 
      price: 15.00,      ← DUPLICATE
      weight: "250g",
      sku: "COF-001-250"
    }
  ]
}
```

### After (Clean)
```
Product {
  name: "Ethiopia Yirgacheffe"
  slug: "ethiopia-yirgacheffe"
  description: "..."
  currency: "EUR"
  variants: [              ← ALL PRICING/STOCK DATA
    {
      weight: "250g",
      grindSize: "Filter",
      roastType: "Filter",
      price: 12.00,
      salePrice: 10.00,
      sku: "COF-001-250-F",
      stockQuantity: 50,
      inStock: true
    },
    {
      weight: "1kg",
      grindSize: "Whole Bean",
      roastType: "Espresso",
      price: 40.00,
      sku: "COF-001-1KG-WB",
      stockQuantity: 20,
      inStock: true
    }
  ],
  attributes: {            ← COFFEE CHARACTERISTICS
    taste: "Floral, Citrus",
    origin: "Ethiopia",
    region: "Yirgacheffe"
  }
}

ShopSettings {             ← GLOBAL POLICIES
  returnPolicy: "..."
  shippingInfo: "..."
  freeShippingThreshold: 50
  standardShippingCost: 5
}
```

## Admin Workflow

### Adding a New Product (Simplified)
1. Create Product entry
   - Enter name, description, images
   - Add coffee attributes if applicable
   
2. Add Variants (for each weight/grind/roast combination)
   - Click "Add component" in Variants
   - Enter: weight, grind size, roast type, price, SKU, stock
   - Repeat for each combination
   
3. No need to:
   - Enter price at product level
   - Maintain separate lists of available options
   - Enter return/shipping policies per product
   
4. VariantSelector automatically shows available options based on actual variants

### Managing Shop Settings (One-Time Setup)
1. Go to Content Manager → Shop Setting (single type)
2. Enter return policy (rich text)
3. Enter shipping info (rich text)
4. Set free shipping threshold
5. These apply to ALL products

## Benefits

### For Admins
- ✅ Single source of truth for pricing/stock (variants only)
- ✅ No duplicate data entry
- ✅ Can't create mismatches between declared options and actual variants
- ✅ Global policies edited once, applied everywhere
- ✅ Cleaner, more intuitive content structure

### For Developers
- ✅ Clear data ownership (variants own SKU data, product owns metadata)
- ✅ Type-safe interfaces
- ✅ Simplified logic (no conditional checks for "which price to use")
- ✅ Easier to maintain and extend
- ✅ Better performance (less data transferred)

### For Customers
- ✅ Accurate pricing always matches selected variant
- ✅ Correct stock availability per variant
- ✅ Clear display of selected options in cart
- ✅ Consistent policies across all products

## Testing Checklist

### Backend (Strapi)
- [ ] Run `npm run develop` in strapi-backend
- [ ] Verify Product content type has no duplicate fields
- [ ] Verify Shop Setting single type exists
- [ ] Create a Shop Setting entry with policies
- [ ] Create a product with 3-4 variants
- [ ] Verify variants have all required fields (price, SKU, stock)

### Frontend (Nuxt)
- [ ] Run `npm run dev` in nuxt-frontend
- [ ] Visit product detail page
- [ ] Verify VariantSelector shows correct options
- [ ] Select different variants, verify price updates
- [ ] Verify return/shipping policies display from global settings
- [ ] Add variant product to cart
- [ ] Verify cart shows variant tags (weight, roast, grind)
- [ ] Test checkout with variant products
- [ ] Verify order confirmation shows correct variant details

### Edge Cases
- [ ] Product with no variants shows appropriate message
- [ ] Product with single variant works correctly
- [ ] Multiple items with same product but different variants in cart
- [ ] Out of stock variant cannot be added to cart
- [ ] Shop settings fallback text shows if not configured

## Migration Notes

### For Existing Products
If you have existing products with data in the old fields:
1. Variants should already have correct data
2. Old product-level price/stock fields will be ignored (removed from schema)
3. Create Shop Setting entry with global policies
4. No data migration needed (variants already contain correct data)

### API Changes
- Product API response no longer includes: `price`, `salePrice`, `sku`, `weight`, `weightUnit`, `stockQuantity`, `inStock`, `returnPolicy`, `shippingInfo`
- All SKU data now in `product.variants[]` array
- Global policies in separate `/api/shop-setting` endpoint

## Files Modified

### Backend
- ✅ `/strapi-backend/src/api/product/content-types/product/schema.json` - Removed 12 duplicate fields
- ✅ `/strapi-backend/src/components/product/variant.json` - All SKU data
- ✅ `/strapi-backend/src/components/product/attributes.json` - Coffee characteristics
- ✅ `/strapi-backend/src/api/shop-setting/content-types/shop-setting/schema.json` - NEW global settings

### Frontend
- ✅ `/nuxt-frontend/types/strapi.ts` - Updated all interfaces
- ✅ `/nuxt-frontend/components/product/VariantSelector.vue` - Smart computed options
- ✅ `/nuxt-frontend/components/product/ProductAttributes.vue` - Attribute display
- ✅ `/nuxt-frontend/composables/useShopSettings.ts` - NEW composable
- ✅ `/nuxt-frontend/pages/shop-coffee/[slug].vue` - Updated to use variants + shop settings
- ✅ `/nuxt-frontend/stores/cart.ts` - Variant support
- ✅ `/nuxt-frontend/components/CartSidebar.vue` - Variant display

## Next Steps

1. **Test with Strapi** - Start backend and populate data
2. **Update Product Listings** - Show price ranges in product cards
3. **Create Admin Guide** - Document variant creation workflow
4. **Add Validation** - Ensure SKU uniqueness across variants
5. **Optimize Queries** - Populate variants in product list queries

## Architecture Benefits

This cleanup establishes a solid foundation for future enhancements:
- **Inventory Management**: Stock levels per variant
- **Analytics**: Sales tracking by weight/grind/roast
- **Pricing Rules**: Bulk discounts, variant-specific sales
- **Subscription Products**: Different frequencies per variant
- **Bundle Products**: Mix variants from different products
- **Multi-currency**: Variant prices in different currencies

---

**Date**: January 2025  
**Status**: ✅ Complete - Ready for testing  
**Breaking Changes**: API response structure changed (no product-level price fields)
