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
 * Worldpay Payment Initiation Server Route
 *
 * Architecture:
 * 1. Frontend creates order in Strapi first
 * 2. Frontend submits payment request to this route with orderId
 * 3. Server creates payment request with Worldpay
 * 4. Server updates order with Worldpay order code
 * 5. Server returns redirect URL to hosted payment page
 * 6. Customer completes payment on Worldpay
 * 7. Worldpay redirects to success/failure URL
 * 8. Webhook confirms payment status
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
  const xmlPassword = config.worldpayXmlPassword;
  const isProduction = process.env.WORLDPAY_ENV === "live";

  // Worldpay API URLs
  const worldpayUrl = isProduction
    ? "https://secure.worldpay.com/jsp/merchant/xml/paymentService.jsp"
    : "https://secure-test.worldpay.com/jsp/merchant/xml/paymentService.jsp";

  // Generate unique Worldpay order code
  const worldpayOrderCode = `${body.orderNumber}-${Date.now()}`;

  // Convert amount to minor units (cents/pence)
  const amountInMinorUnits = Math.round(body.amount * 100);

  // Build success/failure URLs
  const siteUrl = config.public.siteUrl || 'http://localhost:3000';
  const successUrl = `${siteUrl}/checkout/success?orderId=${body.orderId}`;
  const failureUrl = `${siteUrl}/checkout?error=payment_failed`;
  const cancelUrl = `${siteUrl}/checkout?error=payment_cancelled`;

  // Build Worldpay XML request
  const xmlRequest = buildWorldpayXml({
    merchantCode,
    orderCode: worldpayOrderCode,
    amount: amountInMinorUnits,
    currency: body.currency || "EUR",
    customerEmail: body.customer.email,
    customerName: `${body.customer.firstName} ${body.customer.lastName}`,
    description: `Order ${body.orderNumber}`,
    successUrl,
    failureUrl,
    cancelUrl,
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

    // Update order in Strapi with Worldpay order code
    await updateOrderWithWorldpayCode(event, {
      orderId: body.orderId,
      worldpayOrderCode,
    });

    return {
      redirectUrl,
      orderCode: worldpayOrderCode,
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
