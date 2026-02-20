/**
 * Worldpay Webhook Handler
 * 
 * This endpoint receives asynchronous notifications from Worldpay about payment status changes.
 * Worldpay will POST to this endpoint when payment events occur.
 * 
 * Security Notes:
 * - MUST be publicly accessible (Worldpay needs to reach it)
 * - Should validate webhook signature (if configured)
 * - Should be idempotent (handle duplicate events)
 * - MUST return 200 OK quickly (under 10 seconds)
 * - Process events asynchronously if needed
 * 
 * Event Types:
 * - payment.authorized: Payment successfully authorized
 * - payment.captured: Payment successfully captured
 * - payment.failed: Payment failed
 * - payment.cancelled: Payment cancelled by customer
 * - payment.refunded: Payment refunded
 * - payment.settled: Payment settled
 * 
 * Setup in Worldpay:
 * 1. Login to Worldpay Business Gateway
 * 2. Go to Account > Webhooks
 * 3. Add webhook URL: https://yourdomain.com/api/worldpay/webhook
 * 4. Select events to receive
 * 5. Save and activate
 */

import type { WorldpayWebhookEvent, WebhookPaymentDetails } from '~/types/worldpay';

// Store processed event IDs to prevent duplicate processing
// In production, use Redis or database
const processedEvents = new Set<string>();

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  console.log('=== Worldpay Webhook Received ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Headers:', getHeaders(event));

  // ============================================
  // 1. READ WEBHOOK PAYLOAD
  // ============================================
  
  let webhookData: WorldpayWebhookEvent;
  
  try {
    webhookData = await readBody<WorldpayWebhookEvent>(event);
    console.log('Webhook payload:', JSON.stringify(webhookData, null, 2));
  } catch (error) {
    console.error('Failed to parse webhook payload:', error);
    throw createError({
      statusCode: 400,
      message: 'Invalid webhook payload',
    });
  }

  // ============================================
  // 2. VALIDATE WEBHOOK STRUCTURE
  // ============================================
  
  if (!webhookData.eventId || !webhookData.eventType) {
    console.error('Invalid webhook structure - missing eventId or eventType');
    throw createError({
      statusCode: 400,
      message: 'Invalid webhook structure',
    });
  }

  console.log('Event ID:', webhookData.eventId);
  console.log('Event Type:', webhookData.eventType);
  console.log('Payment Status:', webhookData.paymentStatus);

  // ============================================
  // 3. CHECK FOR DUPLICATE EVENTS (IDEMPOTENCY)
  // ============================================
  
  if (processedEvents.has(webhookData.eventId)) {
    console.log('Event already processed, returning 200 OK');
    return {
      received: true,
      message: 'Event already processed',
      eventId: webhookData.eventId,
    };
  }

  // Mark as processed
  processedEvents.add(webhookData.eventId);

  // Clean up old events (keep only last 1000 in memory)
  if (processedEvents.size > 1000) {
    const firstItem = processedEvents.values().next().value;
    if (firstItem) {
      processedEvents.delete(firstItem);
    }
  }

  // ============================================
  // 4. FETCH PAYMENT DETAILS FROM WORLDPAY
  // ============================================
  
  let paymentDetails: WebhookPaymentDetails | null = null;

  if (webhookData._links?.['payments:events']?.href) {
    try {
      const worldpayUsername = config.worldpayUsername;
      const worldpayPassword = config.worldpayPassword;
      
      if (worldpayUsername && worldpayPassword) {
        const credentials = `${worldpayUsername}:${worldpayPassword}`;
        const base64Credentials = Buffer.from(credentials).toString('base64');
        
        console.log('Fetching payment details from:', webhookData._links['payments:events'].href);

        paymentDetails = await $fetch<WebhookPaymentDetails>(
          webhookData._links['payments:events'].href,
          {
            headers: {
              'Accept': 'application/vnd.worldpay.payments-v7.hal+json',
              'Authorization': `Basic ${base64Credentials}`,
            },
          }
        );

        console.log('Payment details fetched:', paymentDetails);
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
      // Continue processing even if details fetch fails
    }
  }

  // ============================================
  // 5. PROCESS WEBHOOK EVENT
  // ============================================
  
  try {
    await processWebhookEvent(webhookData, paymentDetails, config);
  } catch (error) {
    console.error('Error processing webhook event:', error);
    // Still return 200 to prevent Worldpay retries
    // Log error for manual investigation
  }

  // ============================================
  // 6. RETURN SUCCESS RESPONSE
  // ============================================
  
  // CRITICAL: Must return 200 OK quickly
  // Worldpay will retry if not 200 or timeout
  console.log('Webhook processed successfully');
  console.log('===================================');

  return {
    received: true,
    eventId: webhookData.eventId,
    eventType: webhookData.eventType,
    processedAt: new Date().toISOString(),
  };
});

/**
 * Process webhook event based on event type
 */
async function processWebhookEvent(
  webhookData: WorldpayWebhookEvent,
  paymentDetails: WebhookPaymentDetails | null,
  config: any
) {
  const eventType = webhookData.eventType;
  
  console.log(`Processing event type: ${eventType}`);

  // Extract transaction reference from webhook
  // This should match the transactionReference sent when creating payment
  const transactionReference = extractTransactionReference(webhookData);
  
  if (!transactionReference) {
    console.warn('No transaction reference found in webhook');
  } else {
    console.log('Transaction reference:', transactionReference);
  }

  // ============================================
  // UPDATE ORDER IN STRAPI
  // ============================================
  
  const strapiUrl = config.public.strapiUrl;
  const strapiToken = config.strapiApiToken;

  if (!strapiUrl || !strapiToken) {
    console.warn('Strapi not configured, skipping order update');
    return;
  }

  // Determine payment status based on event type
  let paymentStatus: string;
  let orderStatus: string;

  switch (eventType) {
    case 'payment.authorized':
      paymentStatus = 'authorized';
      orderStatus = 'processing';
      console.log('✅ Payment authorized successfully');
      break;

    case 'payment.captured':
      paymentStatus = 'captured';
      orderStatus = 'paid';
      console.log('✅ Payment captured successfully');
      break;

    case 'payment.failed':
      paymentStatus = 'failed';
      orderStatus = 'payment_failed';
      console.log('❌ Payment failed');
      break;

    case 'payment.cancelled':
      paymentStatus = 'cancelled';
      orderStatus = 'cancelled';
      console.log('❌ Payment cancelled');
      break;

    case 'payment.refunded':
      paymentStatus = 'refunded';
      orderStatus = 'refunded';
      console.log('🔄 Payment refunded');
      break;

    case 'payment.settled':
      paymentStatus = 'settled';
      orderStatus = 'completed';
      console.log('✅ Payment settled');
      break;

    default:
      console.log(`ℹ️ Unhandled event type: ${eventType}`);
      return;
  }

  // ============================================
  // FIND ORDER BY TRANSACTION REFERENCE
  // ============================================
  
  try {
    // First, find the order by transaction reference
    const ordersResponse = await $fetch<any>(`${strapiUrl}/api/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
      },
      params: {
        'filters[transactionReference][$eq]': transactionReference,
      },
    });

    if (!ordersResponse.data || ordersResponse.data.length === 0) {
      console.warn(`No order found with transaction reference: ${transactionReference}`);
      return;
    }

    const order = ordersResponse.data[0];
    const orderId = order.id;

    console.log(`Found order ID: ${orderId}`);

    // ============================================
    // UPDATE ORDER STATUS
    // ============================================
    
    const updateData: any = {
      paymentStatus,
      status: orderStatus,
      updatedAt: new Date().toISOString(),
    };

    // Add payment details if available
    if (paymentDetails) {
      updateData.worldpayOutcome = paymentDetails.outcome;
      
      if (paymentDetails.issuer?.authorizationCode) {
        updateData.authorizationCode = paymentDetails.issuer.authorizationCode;
      }

      if (paymentDetails.scheme?.reference) {
        updateData.schemeReference = paymentDetails.scheme.reference;
      }

      if (paymentDetails.paymentInstrument) {
        updateData.paymentMethod = paymentDetails.paymentInstrument.type;
        updateData.cardLast4 = paymentDetails.paymentInstrument.cardNumber?.slice(-4);
      }
    }

    await $fetch(`${strapiUrl}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${strapiToken}`,
      },
      body: {
        data: updateData,
      },
    });

    console.log(`✅ Order ${orderId} updated successfully`);
    console.log('Update data:', updateData);

    // ============================================
    // TRIGGER ADDITIONAL ACTIONS
    // ============================================
    
    if (eventType === 'payment.captured' || eventType === 'payment.settled') {
      // TODO: Send order confirmation email
      // TODO: Trigger fulfillment process
      // TODO: Update inventory
      console.log('TODO: Send confirmation email and trigger fulfillment');
    }

    if (eventType === 'payment.failed') {
      // TODO: Send payment failed notification
      console.log('TODO: Send payment failed notification');
    }

  } catch (error: any) {
    console.error('Failed to update order in Strapi:', error);
    console.error('Error details:', error.data || error.message);
    throw error;
  }
}

/**
 * Extract transaction reference from webhook data
 * The location of this may vary depending on Worldpay response structure
 */
function extractTransactionReference(webhookData: WorldpayWebhookEvent): string | null {
  // Try to extract from various possible locations
  // Adjust based on actual webhook payload structure
  
  // Option 1: Direct property (adjust property name as needed)
  if ((webhookData as any).transactionReference) {
    return (webhookData as any).transactionReference;
  }

  // Option 2: From payment reference
  if ((webhookData as any).paymentReference) {
    return (webhookData as any).paymentReference;
  }

  // Option 3: From links
  if ((webhookData as any)._links?.self?.href) {
    // Extract from URL if present
    const match = (webhookData as any)._links.self.href.match(/([A-Z0-9-]+)$/);
    if (match) return match[1];
  }

  return null;
}
