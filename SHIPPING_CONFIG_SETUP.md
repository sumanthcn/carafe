# Shipping Configuration Setup Guide

This guide explains how to configure shipping options in the Strapi admin panel.

## Access Strapi Admin

1. Navigate to: http://localhost:1337/admin
2. Login with your admin credentials

## Configure Shipping Options

### Step 1: Navigate to Content Manager

1. In the left sidebar, click **Content Manager**
2. Under **Single Types**, click **Shipping Configuration**

### Step 2: Set Free Shipping Threshold

- Set `freeShippingThreshold` to: **25.00** (GBP)
- This means orders over £25 will get free shipping (if carrier is eligible)

### Step 3: Set Processing Configuration

- `processingDays`: **2** (working days to process orders)
- `excludeWeekends`: **true** (don't count Sat/Sun)
- `excludeBankHolidays`: **true** (don't count UK bank holidays)
- `allowedCountries`: **["GB"]** (UK mainland only)

### Step 4: Add Shipping Option 1 - Royal Mail Tracked 24

Click **Add an entry** under Shipping Options and fill in:

```
Carrier Name: Royal Mail
Service Name: Tracked 24
Cost: 3.50
Free Eligible: true ✓
Estimated Days: 1
Description: Royal Mail Tracked 24 - Next working day delivery
Is Active: true ✓
Display Order: 0
```

### Step 5: Add Shipping Option 2 - DPD Next Day

Click **Add an entry** again and fill in:

```
Carrier Name: DPD
Service Name: Next Day
Cost: 7.95
Free Eligible: false ✗
Estimated Days: 1
Description: DPD Next Day - Premium delivery service
Is Active: true ✓
Display Order: 1
```

### Step 6: Optional - Add More Options

You can add additional shipping options like:

**Standard Delivery (Royal Mail 48)**
```
Carrier Name: Royal Mail
Service Name: Tracked 48
Cost: 2.95
Free Eligible: true ✓
Estimated Days: 2-3
Description: Royal Mail Tracked 48 - Standard delivery
Is Active: true ✓
Display Order: 2
```

### Step 7: Save and Publish

1. Click **Save** button (top right)
2. Click **Publish** to make it live

## Verify Configuration

Test the API endpoint:
```bash
curl http://localhost:1337/api/shipping-config
```

Expected response:
```json
{
  "data": {
    "freeShippingThreshold": 25.00,
    "processingDays": 2,
    "excludeWeekends": true,
    "excludeBankHolidays": true,
    "allowedCountries": ["GB"],
    "shippingOptions": [
      {
        "carrierName": "Royal Mail",
        "serviceName": "Tracked 24",
        "cost": 3.50,
        "freeEligible": true,
        "estimatedDays": 1,
        "description": "Royal Mail Tracked 24 - Next working day delivery",
        "isActive": true,
        "displayOrder": 0
      },
      {
        "carrierName": "DPD",
        "serviceName": "Next Day",
        "cost": 7.95,
        "freeEligible": false,
        "estimatedDays": 1,
        "description": "DPD Next Day - Premium delivery service",
        "isActive": true,
        "displayOrder": 1
      }
    ]
  }
}
```

## Business Rules

### Free Shipping Logic
- Only applies to carriers with `freeEligible: true`
- Cart subtotal must be ≥ £25.00
- Royal Mail options qualify for free shipping
- DPD and premium options do NOT qualify (always charged)

### Delivery Estimates
- Calculated as: `processingDays + estimatedDays`
- Excludes weekends and bank holidays
- Example: Order on Friday → Process Mon-Tue → Ship Wed (if estimatedDays = 1)

### UK Mainland Only
- Excludes: Northern Ireland (BT), Guernsey (GY), Jersey (JE), Isle of Man (IM)
- These postcodes will be rejected during checkout validation

## Updating Shipping Options

To add/edit/disable shipping options:

1. Go to Content Manager → Shipping Configuration
2. Edit existing entries or add new ones
3. Set `isActive: false` to temporarily disable an option
4. Adjust `displayOrder` to change the order shown to customers
5. Save and Publish changes

The frontend will automatically fetch the updated configuration on next page load.
