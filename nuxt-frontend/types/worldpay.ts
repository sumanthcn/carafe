/**
 * Worldpay Hosted Payment Pages - TypeScript Interfaces
 * 
 * Based on official Worldpay Payment Pages API v1
 * Documentation: https://developer.worldpay.com/docs/wpg/hostedintegration
 */

// ============================================
// REQUEST TYPES
// ============================================

export interface WorldpayPaymentRequest {
  transactionReference: string;
  merchant: {
    entity: string; // Merchant entity ID
  };
  instruction: {
    narrative: {
      line1: string; // Order description
      line2?: string;
    };
    value: {
      currency: string; // ISO 4217 currency code (e.g., "GBP")
      amount: number; // Amount in minor units (e.g., 4599 = £45.99)
    };
    debtorAccount?: {
      accountNumber: string;
      sortCode: string;
    };
  };
  customer?: {
    customerIdentifiers: {
      customerReference: string;
    };
    email?: string;
    name?: {
      givenName: string;
      familyName: string;
    };
    address?: {
      address1: string;
      address2?: string;
      address3?: string;
      postalCode: string;
      city: string;
      state?: string;
      countryCode: string; // ISO 3166-1 alpha-2
    };
  };
  resultURLs: {
    successURL: string;
    failureURL: string;
    cancelURL: string;
    pendingURL?: string;
    errorURL?: string;
  };
}

export interface CreatePaymentRequest {
  orderId: number;
  orderNumber: string;
  amount: number; // Amount in major units (e.g., 45.99)
  currency: string;
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      postcode: string;
      country: string;
    };
  };
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface WorldpayPaymentResponse {
  outcome: string; // "authorized" | "referred" | "refused" | etc.
  _links: {
    "payments:redirect": {
      href: string; // URL to redirect customer to
    };
    self: {
      href: string;
    };
    "curies": Array<{
      name: string;
      href: string;
      templated: boolean;
    }>;
  };
}

export interface PaymentInitiationResponse {
  success: boolean;
  redirectUrl?: string;
  orderId?: number;
  transactionReference?: string;
  error?: string;
  details?: any;
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface WorldpayWebhookEvent {
  eventId: string;
  eventTimestamp: string;
  eventType: string; // "payment.authorized", "payment.captured", "payment.failed", etc.
  merchantId: string;
  paymentStatus: string;
  paymentMethod?: string;
  _links: {
    "payments:events": {
      href: string;
    };
  };
}

export interface WebhookPaymentDetails {
  outcome: string;
  riskFactors?: {
    risk: string;
  };
  issuer?: {
    authorizationCode: string;
  };
  scheme?: {
    reference: string;
  };
  paymentInstrument?: {
    type: string;
    cardNumber: string;
    expiryDate: {
      month: number;
      year: number;
    };
  };
}

// ============================================
// ERROR TYPES
// ============================================

export interface WorldpayError {
  errorName: string;
  message: string;
  validationErrors?: Array<{
    propertyName: string;
    message: string;
  }>;
}

export interface WorldpayErrorResponse {
  httpStatusCode: number;
  customCode: string;
  message: string;
  description: string;
  errorName?: string;
}

// ============================================
// ENVIRONMENT CONFIGURATION
// ============================================

export type WorldpayEnvironment = 'sandbox' | 'production';

export interface WorldpayConfig {
  username: string;
  password: string;
  baseUrl: string;
  merchantEntity: string;
  environment: WorldpayEnvironment;
}
