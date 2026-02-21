/**
 * Sample Orders Seed Script
 * Creates sample orders with completed payment status for testing
 * 
 * Run with: node database/seeds/sample-orders.js
 */

const sampleOrders = [
  {
    orderNumber: 'ORD-2024-1001',
    status: 'delivered',
    customerEmail: 'shruthisumanth25@gmail.com',
    customerName: 'Shruthi Sumanth',
    customerPhone: '+353 1 234 5678',
    shippingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Dublin',
      county: 'Dublin',
      postalCode: 'D02 X285',
      country: 'Ireland',
      phone: '+353 1 234 5678'
    },
    billingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Dublin',
      county: 'Dublin',
      postalCode: 'D02 X285',
      country: 'Ireland',
      phone: '+353 1 234 5678'
    },
    items: [
      {
        productId: 1,
        productName: 'Ethiopian Yirgacheffe',
        productSlug: 'ethiopian-yirgacheffe',
        sku: 'ETH-YIRG-250',
        quantity: 2,
        unitPrice: 12.50,
        totalPrice: 25.00,
        weight: '250g'
      },
      {
        productId: 2,
        productName: 'Colombian Supremo',
        productSlug: 'colombian-supremo',
        sku: 'COL-SUPR-250',
        quantity: 1,
        unitPrice: 11.00,
        totalPrice: 11.00,
        weight: '250g'
      }
    ],
    subtotal: 36.00,
    shippingCost: 4.95,
    tax: 0,
    discount: 0,
    total: 40.95,
    currency: 'EUR',
    paymentMethod: 'Worldpay',
    paymentStatus: 'captured',
    paymentId: 'pay_abc123def456',
    worldpayOrderCode: 'WP-12345678',
    shippingMethod: 'Standard Shipping',
    carrier: 'An Post',
    trackingNumber: 'RL123456789IE',
    dispatchedAt: new Date('2024-02-18T10:30:00Z'),
    deliveredAt: new Date('2024-02-20T14:15:00Z'),
    notes: 'Please leave at the front door if not home',
    isGuestOrder: false
  },
  {
    orderNumber: 'ORD-2024-1002',
    status: 'shipped',
    customerEmail: 'shruthisumanth25@gmail.com',
    customerName: 'Shruthi Sumanth',
    customerPhone: '+353 1 234 5678',
    shippingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Dublin',
      county: 'Dublin',
      postalCode: 'D02 X285',
      country: 'Ireland',
      phone: '+353 1 234 5678'
    },
    billingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Dublin',
      county: 'Dublin',
      postalCode: 'D02 X285',
      country: 'Ireland',
      phone: '+353 1 234 5678'
    },
    items: [
      {
        productId: 3,
        productName: 'Brazilian Santos',
        productSlug: 'brazilian-santos',
        sku: 'BRA-SANT-500',
        quantity: 1,
        unitPrice: 18.50,
        totalPrice: 18.50,
        weight: '500g'
      },
      {
        productId: 4,
        productName: 'Costa Rican Tarrazu',
        productSlug: 'costa-rican-tarrazu',
        sku: 'CRI-TARR-250',
        quantity: 2,
        unitPrice: 13.00,
        totalPrice: 26.00,
        weight: '250g'
      },
      {
        productId: 5,
        productName: 'House Blend',
        productSlug: 'house-blend',
        sku: 'HOUSE-1KG',
        quantity: 1,
        unitPrice: 28.00,
        totalPrice: 28.00,
        weight: '1kg'
      }
    ],
    subtotal: 72.50,
    shippingCost: 0, // Free shipping over €50
    tax: 0,
    discount: 5.00,
    total: 67.50,
    currency: 'EUR',
    paymentMethod: 'Worldpay',
    paymentStatus: 'captured',
    paymentId: 'pay_xyz789ghi012',
    worldpayOrderCode: 'WP-12345679',
    shippingMethod: 'Express Shipping',
    carrier: 'DPD',
    trackingNumber: 'DPD123456789IE',
    dispatchedAt: new Date('2024-02-19T09:00:00Z'),
    notes: null,
    isGuestOrder: false
  },
  {
    orderNumber: 'ORD-2024-1003',
    status: 'order_received',
    customerEmail: 'shruthisumanth25@gmail.com',
    customerName: 'Shruthi Sumanth',
    customerPhone: '+353 1 234 5678',
    shippingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Dublin',
      county: 'Dublin',
      postalCode: 'D02 X285',
      country: 'Ireland',
      phone: '+353 1 234 5678'
    },
    billingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Dublin',
      county: 'Dublin',
      postalCode: 'D02 X285',
      country: 'Ireland',
      phone: '+353 1 234 5678'
    },
    items: [
      {
        productId: 1,
        productName: 'Ethiopian Yirgacheffe',
        productSlug: 'ethiopian-yirgacheffe',
        sku: 'ETH-YIRG-1KG',
        quantity: 1,
        unitPrice: 42.00,
        totalPrice: 42.00,
        weight: '1kg'
      }
    ],
    subtotal: 42.00,
    shippingCost: 4.95,
    tax: 0,
    discount: 0,
    total: 46.95,
    currency: 'EUR',
    paymentMethod: 'Worldpay',
    paymentStatus: 'captured',
    paymentId: 'pay_mno345pqr678',
    worldpayOrderCode: 'WP-12345680',
    shippingMethod: 'Standard Shipping',
    carrier: null,
    trackingNumber: null,
    dispatchedAt: null,
    deliveredAt: null,
    notes: null,
    isGuestOrder: false
  },
  {
    orderNumber: 'ORD-2024-1004',
    status: 'delivered',
    customerEmail: 'shruthisumanth25@gmail.com',
    customerName: 'Shruthi Sumanth',
    customerPhone: '+353 1 234 5678',
    shippingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Dublin',
      county: 'Dublin',
      postalCode: 'D02 X285',
      country: 'Ireland',
      phone: '+353 1 234 5678'
    },
    billingAddress: {
      fullName: 'Shruthi Sumanth',
      addressLine1: '123 Main Street',
      addressLine2: 'Apartment 4B',
      city: 'Dublin',
      county: 'Dublin',
      postalCode: 'D02 X285',
      country: 'Ireland',
      phone: '+353 1 234 5678'
    },
    items: [
      {
        productId: 2,
        productName: 'Colombian Supremo',
        productSlug: 'colombian-supremo',
        sku: 'COL-SUPR-500',
        quantity: 2,
        unitPrice: 20.00,
        totalPrice: 40.00,
        weight: '500g'
      },
      {
        productId: 6,
        productName: 'Decaf Swiss Water Process',
        productSlug: 'decaf-swiss-water',
        sku: 'DECAF-250',
        quantity: 1,
        unitPrice: 14.50,
        totalPrice: 14.50,
        weight: '250g'
      }
    ],
    subtotal: 54.50,
    shippingCost: 0, // Free shipping
    tax: 0,
    discount: 0,
    total: 54.50,
    currency: 'EUR',
    paymentMethod: 'Worldpay',
    paymentStatus: 'captured',
    paymentId: 'pay_stu901vwx234',
    worldpayOrderCode: 'WP-12345681',
    shippingMethod: 'Standard Shipping',
    carrier: 'An Post',
    trackingNumber: 'RL987654321IE',
    dispatchedAt: new Date('2024-01-15T11:00:00Z'),
    deliveredAt: new Date('2024-01-17T16:30:00Z'),
    notes: null,
    isGuestOrder: false
  }
];

module.exports = { sampleOrders };
