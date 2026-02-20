import crypto from "crypto";

interface WorldpayPaymentRequest {
  orderId: number;
  orderNumber: string;
  amount: number;
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

interface WorldpayResponse {
  redirectUrl?: string;
  error?: string;
  orderCode?: string;
}

/**
 * Worldpay Hosted Payment Pages Integration
 *
 * Architecture:
 * 1. Frontend creates order in Strapi first
 * 2. Frontend requests payment URL from this route
 * 3. Server generates Worldpay hosted payment page URL with order details
 * 4. Frontend redirects customer to Worldpay's hosted page
 * 5. Customer completes payment on Worldpay
 * 6. Worldpay redirects to success/failure URL on your site
 * 7. Webhook confirms payment status (optional)
 */
export default defineEventHandler(async (event): Promise<WorldpayResponse> => {
  const config = useRuntimeConfig();
  const body = await readBody<WorldpayPaymentRequest>(event);

  // Validate required fields
  if (!body.orderId || !body.orderNumber || !body.amount || !body.customer?.email) {
    throw createError({
      statusCode: 400,
      message: "Missing required payment fields",
    });
  }

  // Get Worldpay credentials from environment
  const merchantCode = config.worldpayMerchantCode;
  const installationId = config.worldpayInstallationId;
  const isProduction = process.env.WORLDPAY_ENV === "live";

  // Validate credentials
  if (!merchantCode || !installationId) {
    console.error("Missing Worldpay credentials:", { 
      merchantCode: merchantCode ? "set" : "missing", 
      installationId: installationId ? "set" : "missing",
    });
    throw createError({
      statusCode: 500,
      message: "Worldpay credentials not configured",
    });
  }

  console.log("Payment initiation request:", {
    orderId: body.orderId,
    orderNumber: body.orderNumber,
    amount: body.amount,
    currency: body.currency,
    merchantCode: merchantCode,
    installationId: installationId,
  });

  // Worldpay Hosted Payment Page URL
  const worldpayUrl = isProduction
    ? "https://secure.worldpay.com/wcc/purchase"
    : "https://secure-test.worldpay.com/wcc/purchase";

  console.log("Using Worldpay Hosted Payment Page:", worldpayUrl);

  // Generate unique Worldpay order code
  const worldpayOrderCode = `${body.orderNumber}-${Date.now()}`;

  // Convert amount to major units (pounds/euros with 2 decimal places)
  const amountFormatted = body.amount.toFixed(2);

  // Build success/failure URLs
  const siteUrl = config.public.siteUrl || 'http://localhost:3000';
  const successUrl = `${siteUrl}/checkout/success?orderId=${body.orderId}`;
  const failureUrl = `${siteUrl}/checkout?error=payment_failed`;
  const cancelUrl = `${siteUrl}/checkout?error=payment_cancelled`;

  console.log("Redirect URLs:", { successUrl, failureUrl, cancelUrl });

  try {
    // Update order in Strapi with Worldpay order code
    await updateOrderWithWorldpayCode(event, {
      orderId: body.orderId,
      worldpayOrderCode,
    });

    // Build Worldpay hosted payment page URL with query parameters
    const paymentParams = new URLSearchParams({
      instId: installationId,
      cartId: worldpayOrderCode,
      amount: amountFormatted,
      currency: body.currency || "GBP",
      desc: `Order ${body.orderNumber}`,
      name: `${body.customer.firstName} ${body.customer.lastName}`,
      email: body.customer.email,
      address1: body.customer.address.line1,
      address2: body.customer.address.line2 || "",
      town: body.customer.address.city,
      postcode: body.customer.address.postcode,
      country: body.customer.address.country,
      tel: body.customer.phone || "",
      // Callback URLs
      MC_callback: successUrl,
      MC_cancel: cancelUrl,
      MC_error: failureUrl,
    });

    // Only add testMode for production (0 = use test cards in production environment)
    // For test environment (secure-test.worldpay.com), don't include testMode parameter
    if (isProduction) {
      paymentParams.append('testMode', '0');
    }


    const redirectUrl = `${worldpayUrl}?${paymentParams.toString()}`;

    console.log("Generated payment URL (first 100 chars):", redirectUrl.substring(0, 100));

    return {
      redirectUrl,
      orderCode: worldpayOrderCode,
    };
  } catch (error: any) {
    console.error("Payment initiation error:", {
      message: error.message,
      stack: error.stack,
    });
    throw createError({
      statusCode: 500,
      message: `Payment initiation failed: ${error.message || "Unknown error"}`,
    });
  }
});

/**
 * Update order in Strapi with Worldpay order code
 */
async function updateOrderWithWorldpayCode(
  event: any,
  data: {
    orderId: number;
    worldpayOrderCode: string;
  }
) {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;
  const strapiToken = config.strapiApiToken;

  try {
    await $fetch(`${strapiUrl}/api/orders/${data.orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${strapiToken}`,
      },
      body: {
        data: {
          worldpayOrderCode: data.worldpayOrderCode,
          paymentStatus: "pending",
        },
      },
    });
  } catch (error) {
    console.error("Failed to update order with Worldpay code:", error);
    // Don't throw - payment can still proceed
  }
}
