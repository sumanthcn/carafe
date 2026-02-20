/**
 * Worldpay Hosted Payment Pages - Create Payment
 * 
 * This endpoint creates a payment session with Worldpay and returns a redirect URL.
 * The customer will be redirected to Worldpay's hosted payment page to complete payment.
 * 
 * Security: Credentials are kept server-side only. Never expose to frontend.
 * 
 * Flow:
 * 1. Frontend calls this endpoint with order details
 * 2. Server authenticates with Worldpay using Basic Auth
 * 3. Server creates payment session via Worldpay REST API
 * 4. Server returns redirect URL to frontend
 * 5. Frontend redirects customer to Worldpay hosted page
 * 6. Customer completes payment on Worldpay
 * 7. Worldpay redirects back to success/failure URL
 * 8. Webhook receives async notification (handled separately)
 */

import type { 
  CreatePaymentRequest, 
  WorldpayPaymentRequest, 
  WorldpayPaymentResponse,
  PaymentInitiationResponse,
  WorldpayErrorResponse 
} from '~/types/worldpay';

export default defineEventHandler(async (event): Promise<PaymentInitiationResponse> => {
  const config = useRuntimeConfig();
  
  // ============================================
  // 1. VALIDATE REQUEST BODY
  // ============================================
  
  let body: CreatePaymentRequest;
  
  try {
    body = await readBody<CreatePaymentRequest>(event);
  } catch (error) {
    console.error('Invalid request body:', error);
    throw createError({
      statusCode: 400,
      message: 'Invalid request body',
    });
  }

  // Validate required fields
  if (!body.orderId || !body.orderNumber || !body.amount || !body.customer?.email) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields: orderId, orderNumber, amount, customer.email',
    });
  }

  if (body.amount <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Amount must be greater than 0',
    });
  }

  console.log('=== Worldpay Payment Initiation ===');
  console.log('Order ID:', body.orderId);
  console.log('Order Number:', body.orderNumber);
  console.log('Amount:', body.amount, body.currency);
  
  // ============================================
  // 2. GET WORLDPAY CREDENTIALS FROM ENV
  // ============================================
  
  const worldpayUsername = config.worldpayUsername;
  const worldpayPassword = config.worldpayPassword;
  const worldpayBaseUrl = config.worldpayBaseUrl;
  const worldpayMerchantEntity = config.worldpayMerchantEntity;

  // Validate credentials are configured
  if (!worldpayUsername || !worldpayPassword || !worldpayBaseUrl || !worldpayMerchantEntity) {
    console.error('Missing Worldpay credentials:', {
      username: worldpayUsername ? 'SET' : 'MISSING',
      password: worldpayPassword ? 'SET' : 'MISSING',
      baseUrl: worldpayBaseUrl ? 'SET' : 'MISSING',
      merchantEntity: worldpayMerchantEntity ? 'SET' : 'MISSING',
    });
    throw createError({
      statusCode: 500,
      message: 'Worldpay credentials not configured',
    });
  }

  console.log('Using Worldpay base URL:', worldpayBaseUrl);
  console.log('Merchant Entity:', worldpayMerchantEntity);

  // ============================================
  // 3. PREPARE BASIC AUTH HEADER
  // ============================================
  
  // Encode credentials as base64 for Basic Auth
  const credentials = `${worldpayUsername}:${worldpayPassword}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  const authHeader = `Basic ${base64Credentials}`;

  console.log('Authentication: Basic Auth configured');

  // ============================================
  // 4. GENERATE TRANSACTION REFERENCE
  // ============================================
  
  // Unique transaction reference for Worldpay
  const transactionReference = `${body.orderNumber}-${Date.now()}`;
  
  // ============================================
  // 5. CONVERT AMOUNT TO MINOR UNITS
  // ============================================
  
  // Worldpay expects amount in minor units (pence, cents, etc.)
  // Example: £45.99 = 4599 pence
  const amountInMinorUnits = Math.round(body.amount * 100);
  
  if (amountInMinorUnits <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid amount after conversion to minor units',
    });
  }

  console.log(`Amount conversion: ${body.amount} ${body.currency} = ${amountInMinorUnits} minor units`);

  // ============================================
  // 6. BUILD RESULT URLs
  // ============================================
  
  const siteUrl = config.public.siteUrl || 'http://localhost:3000';
  
  const resultURLs = {
    successURL: `${siteUrl}/payment/success?orderId=${body.orderId}&ref=${transactionReference}`,
    failureURL: `${siteUrl}/payment/failure?orderId=${body.orderId}&ref=${transactionReference}`,
    cancelURL: `${siteUrl}/payment/cancelled?orderId=${body.orderId}`,
    pendingURL: `${siteUrl}/payment/pending?orderId=${body.orderId}`,
  };

  console.log('Result URLs configured:', {
    success: resultURLs.successURL,
    failure: resultURLs.failureURL,
  });

  // ============================================
  // 7. BUILD WORLDPAY PAYMENT REQUEST
  // ============================================
  
  // Ensure country code is 2-letter uppercase (ISO 3166-1 alpha-2)
  const countryCode = body.customer.address.country?.toUpperCase().substring(0, 2) || 'GB';
  
  // Narrative line1 has max 24 characters - use simple merchant name
  const narrativeLine1 = 'Carafe Coffee'.substring(0, 24);
  
  const worldpayRequest: WorldpayPaymentRequest = {
    transactionReference,
    merchant: {
      entity: worldpayMerchantEntity,
    },
    narrative: {
      line1: narrativeLine1,
    },
    value: {
      currency: body.currency || 'GBP',
      amount: amountInMinorUnits,
    },
    description: `${body.customer.firstName} ${body.customer.lastName}`,
    billingAddress: {
      firstName: body.customer.firstName,
      lastName: body.customer.lastName,
      address1: body.customer.address.line1,
      ...(body.customer.address.line2 && { address2: body.customer.address.line2 }),
      city: body.customer.address.city,
      postalCode: body.customer.address.postcode,
      countryCode: countryCode,
    },
    resultURLs,
  };

  console.log('Worldpay request prepared:', JSON.stringify(worldpayRequest, null, 2));

  // ============================================
  // 8. UPDATE ORDER IN STRAPI (OPTIONAL)
  // ============================================
  
  try {
    const strapiUrl = config.public.strapiUrl;
    const strapiToken = config.strapiApiToken;

    if (strapiUrl && strapiToken) {
      await $fetch(`${strapiUrl}/api/orders/${body.orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${strapiToken}`,
        },
        body: {
          data: {
            transactionReference,
            paymentStatus: 'initiated',
          },
        },
      });
      console.log('Order updated in Strapi with transaction reference');
    }
  } catch (error) {
    console.warn('Failed to update order in Strapi (non-critical):', error);
    // Don't throw - payment can proceed
  }

  // ============================================
  // 9. CALL WORLDPAY HPP API (Hosted Payment Pages v1)
  // ============================================
  
  try {
    // CORRECT endpoint for HPP API
    const worldpayEndpoint = `${worldpayBaseUrl}/payment_pages`;
    
    console.log('Calling Worldpay HPP API:', worldpayEndpoint);
    console.log('Request payload:', JSON.stringify(worldpayRequest, null, 2));

    // Generate unique correlation ID (required by HPP API)
    const correlationId = `${transactionReference}-${Date.now()}`;

    const response = await $fetch<WorldpayPaymentResponse>(worldpayEndpoint, {
      method: 'POST',
      headers: {
        // REQUIRED headers for HPP API v1
        'WP-CorrelationId': correlationId,
        'Content-Type': 'application/vnd.worldpay.payment_pages-v1.hal+json',
        'Accept': 'application/vnd.worldpay.payment_pages-v1.hal+json',
        'Authorization': authHeader,
        'User-Agent': 'Carafe-Coffee-Nuxt/1.0',
      },
      body: worldpayRequest,
    });

    console.log('Worldpay API response received');
    console.log('Response:', JSON.stringify(response, null, 2));

    // ============================================
    // 10. EXTRACT REDIRECT URL
    // ============================================
    
    // HPP API returns the redirect URL in the 'url' field
    const redirectUrl = response.url;

    if (!redirectUrl) {
      console.error('No redirect URL in Worldpay response:', response);
      throw createError({
        statusCode: 500,
        message: 'No redirect URL received from Worldpay',
      });
    }

    console.log('Payment session created successfully');
    console.log('Redirect URL:', redirectUrl);
    console.log('===================================');

    // ============================================
    // 11. RETURN SUCCESS RESPONSE
    // ============================================
    
    return {
      success: true,
      redirectUrl,
      orderId: body.orderId,
      transactionReference,
    };

  } catch (error: any) {
    // ============================================
    // ERROR HANDLING
    // ============================================
    
    console.error('=== Worldpay API Error ===');
    console.error('Error:', error);

    // Handle Worldpay-specific errors
    if (error.data) {
      const worldpayError = error.data as WorldpayErrorResponse;
      console.error('Worldpay error response:', worldpayError);
      
      throw createError({
        statusCode: error.status || 500,
        message: worldpayError.message || 'Payment initiation failed',
        data: {
          errorName: worldpayError.errorName,
          description: worldpayError.description,
          customCode: worldpayError.customCode,
        },
      });
    }

    // Handle network/timeout errors
    if (error.cause) {
      console.error('Network error:', error.cause);
      throw createError({
        statusCode: 503,
        message: 'Unable to connect to payment provider',
      });
    }

    // Generic error
    throw createError({
      statusCode: 500,
      message: `Payment initiation failed: ${error.message || 'Unknown error'}`,
    });
  }
});
