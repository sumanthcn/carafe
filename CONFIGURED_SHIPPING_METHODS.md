# Configured Shipping Methods

Based on your current Strapi configuration, here are the **exact** shipping method values to use in API requests:

## Available Shipping Methods

### 1. Royal Mail Tracked 24®
```json
{
  "shippingMethod": "Royal Mail - Royal Mail Tracked 24®"
}
```
- **Carrier Name:** Royal Mail
- **Service Name:** Royal Mail Tracked 24®
- **Cost:** £3.85
- **Free Eligible:** Yes (free over £25)
- **Estimated Days:** 2
- **Active:** Yes

### 2. DPD Next Day (Standard)
```json
{
  "shippingMethod": "DPD - DPD Next Day (Standard)"
}
```
- **Carrier Name:** DPD
- **Service Name:** DPD Next Day (Standard)
- **Cost:** £7.95
- **Free Eligible:** No (always charged)
- **Estimated Days:** 2
- **Active:** Yes

## Important Notes

⚠️ **The shipping method string must match EXACTLY:**
- Format: `"{carrierName} - {serviceName}"`
- Include all special characters (®, parentheses, etc.)
- Case-sensitive
- Spaces matter

## Example Order JSON

```json
{
  "customerEmail": "test@example.com",
  "customerName": "John Doe",
  "customerPhone": "07123456789",
  "shippingAddress": {
    "street": "123 Test Street",
    "city": "London",
    "postcode": "SW1A 1AA",
    "country": "GB"
  },
  "items": [
    {
      "productId": 1,
      "productName": "Ethiopian Coffee",
      "quantity": 2,
      "unitPrice": 12.50,
      "totalPrice": 25.00
    }
  ],
  "subtotal": 25.00,
  "shippingCost": 0.00,
  "shippingMethod": "Royal Mail - Royal Mail Tracked 24®",
  "tax": 5.00,
  "total": 30.00
}
```

## How to Get Current Shipping Methods

Run this command to see all configured shipping methods:

```bash
curl http://localhost:1337/api/shipping-config | python3 -m json.tool
```

Or in your frontend, the `useCheckout()` composable will fetch these automatically and format them as:
```javascript
`${option.carrierName} - ${option.serviceName}`
```

## Troubleshooting

If you get **"Invalid shipping method"** error:
1. Check the exact spelling in Strapi Admin → Shipping Configuration
2. Verify carrier name and service name match exactly
3. Make sure the option is marked as "Active"
4. Check the Strapi logs for available options (they're now logged on error)
