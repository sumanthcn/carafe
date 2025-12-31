# Quick Start: Product Variants

## 🎯 Goal
Add product variants (weight, grind, roast) to your coffee products.

## ⚡ 5-Minute Setup

### 1. Start Strapi (1 min)
```bash
cd strapi-backend
npm run develop
```
→ Go to http://localhost:1337/admin

### 2. Configure Product (2 min)

Edit any product:

**Scroll to bottom, find these fields:**

**Available Weights** (JSON field):
```json
["250g", "500g"]
```

**Available Roast Types** (JSON field):
```json
["Espresso"]
```

**Available Grind Sizes** (JSON field):
```json
["Whole Bean", "Espresso", "Filter"]
```

**Click "+ Add an entry" under Variants**, add each combination:

| Weight | Roast | Grind | Price | SKU | Stock |
|--------|-------|-------|-------|-----|-------|
| 250g | Espresso | Whole Bean | 12.00 | SKU-1 | 50 |
| 250g | Espresso | Espresso | 12.00 | SKU-2 | 50 |
| 250g | Espresso | Filter | 12.00 | SKU-3 | 50 |
| 500g | Espresso | Whole Bean | 22.00 | SKU-4 | 30 |
| 500g | Espresso | Espresso | 22.00 | SKU-5 | 30 |
| 500g | Espresso | Filter | 22.00 | SKU-6 | 30 |

**Fill Attributes section:**
- Taste: "Chocolate, Caramel"
- Origin: "Colombia"
- Region: "Huila"
- Varietal: "Caturra"
- Process: "Washed"
- Altitude: "1,600 MASL"
- Best Served: "Espresso, Filter"

**Save & Publish**

### 3. Test Frontend (2 min)

```bash
cd nuxt-frontend
npm run dev
```

1. Visit product page → See variant selectors
2. Click weight buttons → Price updates
3. Select grind → Click "Add to Cart"
4. Open cart → See variant tags
5. Scroll down product page → See attributes section

## ✅ Done!

You now have:
- ✅ Multiple weight options
- ✅ Multiple grind options  
- ✅ Dynamic pricing per variant
- ✅ Stock tracking per variant
- ✅ Beautiful product attributes display

## 🎨 Pro Tips

### Keep It Simple
- Start with 2 weights only
- Start with 1 roast type only
- Start with 3 grind sizes
- = Only 6 variants to create!

### Mix & Match
- Some products: Espresso only, with variants
- Some products: Filter only, with variants
- Some products: Both roasts, with variants
- Some products: No variants at all (works as before!)

### Pricing Strategy
```
250g → €12.00
500g → €22.00 (not double, incentivize larger)
1kg  → €40.00
2kg  → €75.00
```

## 🐛 Troubleshooting

**Variant selector not showing?**
- Check product has `variants` array filled
- Check each variant has required fields
- Restart frontend dev server

**Can't see new fields in Strapi?**
- Clear browser cache
- Hard reload (Cmd/Ctrl + Shift + R)
- Restart Strapi

**Strapi won't start?**
- Check terminal for errors
- Verify component JSON files exist
- Check PostgreSQL is running

## 📚 More Info

- **Full Guide**: `docs/PRODUCT_VARIANTS_IMPLEMENTATION.md`
- **Summary**: `docs/PRODUCT_VARIANTS_SUMMARY.md`

---

**That's it!** You're ready to roll out variants across all products. 🎉
