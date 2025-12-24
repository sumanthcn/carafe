import crypto from "crypto";

interface WorldpayPaymentRequest {
  orderCode: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description: string;
  successUrl: string;
  failureUrl: string;
  cancelUrl: string;
}

interface WorldpayResponse {
  redirectUrl?: string;
  error?: string;
  orderCode?: string;
}

/**
 * Worldpay Payment Initiation Server Route
 *
 * Architecture:
 * 1. Frontend submits order to this server route
 * 2. Server creates payment request with Worldpay
 * 3. Server returns redirect URL to hosted payment page
 * 4. Customer completes payment on Worldpay
 * 5. Worldpay redirects to success/failure URL
 * 6. Webhook confirms payment status
 */
export default defineEventHandler(async (event): Promise<WorldpayResponse> => {
  const config = useRuntimeConfig();
  const body = await readBody<WorldpayPaymentRequest>(event);

  // Validate required fields
  if (!body.orderCode || !body.amount || !body.customerEmail) {
    throw createError({
      statusCode: 400,
      message: "Missing required payment fields",
    });
  }

  // Get Worldpay credentials from environment
  const merchantCode = config.worldpayMerchantCode;
  const xmlPassword = config.worldpayXmlPassword;
  const isProduction = process.env.WORLDPAY_ENV === "live";

  // Worldpay API URLs
  const worldpayUrl = isProduction
    ? "https://secure.worldpay.com/jsp/merchant/xml/paymentService.jsp"
    : "https://secure-test.worldpay.com/jsp/merchant/xml/paymentService.jsp";

  // Generate unique order code if not provided
  const orderCode =
    body.orderCode ||
    `CARAFE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Convert amount to minor units (cents/pence)
  const amountInMinorUnits = Math.round(body.amount * 100);

  // Build Worldpay XML request
  const xmlRequest = buildWorldpayXml({
    merchantCode,
    orderCode,
    amount: amountInMinorUnits,
    currency: body.currency || "EUR",
    customerEmail: body.customerEmail,
    customerName: body.customerName,
    description: body.description || "Carafe Coffee Order",
    successUrl: body.successUrl,
    failureUrl: body.failureUrl,
    cancelUrl: body.cancelUrl,
  });

  try {
    // Make request to Worldpay
    const response = await $fetch(worldpayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        Authorization: `Basic ${Buffer.from(
          `${merchantCode}:${xmlPassword}`
        ).toString("base64")}`,
      },
      body: xmlRequest,
    });

    // Parse Worldpay response
    const redirectUrl = extractRedirectUrl(response as string);

    if (!redirectUrl) {
      console.error("Worldpay response:", response);
      throw new Error("Failed to get redirect URL from Worldpay");
    }

    // Store order in Strapi with pending status
    await createPendingOrder(event, {
      orderCode,
      amount: body.amount,
      currency: body.currency,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
    });

    return {
      redirectUrl,
      orderCode,
    };
  } catch (error) {
    console.error("Worldpay payment error:", error);
    throw createError({
      statusCode: 500,
      message: "Payment initiation failed",
    });
  }
});

/**
 * Build Worldpay XML payment request
 */
function buildWorldpayXml(params: {
  merchantCode: string;
  orderCode: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description: string;
  successUrl: string;
  failureUrl: string;
  cancelUrl: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE paymentService PUBLIC "-//WorldPay//DTD WorldPay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
<paymentService version="1.4" merchantCode="${params.merchantCode}">
  <submit>
    <order orderCode="${params.orderCode}">
      <description>${escapeXml(params.description)}</description>
      <amount currencyCode="${params.currency}" exponent="2" value="${
    params.amount
  }"/>
      <orderContent>
        <![CDATA[Carafe Coffee - Online Order]]>
      </orderContent>
      <paymentMethodMask>
        <include code="ALL"/>
      </paymentMethodMask>
      <shopper>
        <shopperEmailAddress>${escapeXml(
          params.customerEmail
        )}</shopperEmailAddress>
      </shopper>
    </order>
  </submit>
</paymentService>`;
}

/**
 * Extract redirect URL from Worldpay XML response
 */
function extractRedirectUrl(xmlResponse: string): string | null {
  // Simple regex extraction - in production use proper XML parser
  const match = xmlResponse.match(/<reference id="[^"]*">([^<]+)<\/reference>/);
  return match ? match[1] : null;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Create pending order in Strapi
 */
async function createPendingOrder(
  event: any,
  orderData: {
    orderCode: string;
    amount: number;
    currency: string;
    customerEmail: string;
    customerName: string;
  }
) {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;
  const strapiToken = config.strapiApiToken;

  try {
    await $fetch(`${strapiUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${strapiToken}`,
      },
      body: {
        data: {
          orderNumber: orderData.orderCode,
          status: "pending",
          customerEmail: orderData.customerEmail,
          customerName: orderData.customerName,
          total: orderData.amount,
          currency: orderData.currency,
          paymentStatus: "pending",
          worldpayOrderCode: orderData.orderCode,
        },
      },
    });
  } catch (error) {
    console.error("Failed to create pending order:", error);
    // Don't throw - payment can still proceed
  }
}
