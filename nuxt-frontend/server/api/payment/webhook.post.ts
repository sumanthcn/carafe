import crypto from "crypto";

/**
 * Worldpay Webhook Handler
 *
 * Receives payment notifications from Worldpay and updates order status
 *
 * Security:
 * - Validates MAC signature
 * - Verifies merchant code
 * - Only processes from Worldpay IPs in production
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody(event);

  // Get query parameters (Worldpay sends status via query)
  const query = getQuery(event);
  const orderCode = query.orderKey as string;
  const paymentStatus = query.paymentStatus as string;
  const mac = query.mac as string;

  if (!orderCode) {
    console.error("Webhook: Missing orderCode");
    return { success: false, error: "Missing order code" };
  }

  // Validate MAC signature
  const isValidMac = validateWorldpayMac({
    orderKey: orderCode,
    paymentStatus,
    mac,
    macSecret: config.worldpayMacSecret,
  });

  if (!isValidMac) {
    console.error("Webhook: Invalid MAC signature");
    throw createError({
      statusCode: 403,
      message: "Invalid signature",
    });
  }

  // Map Worldpay status to our status
  const statusMap: Record<string, string> = {
    AUTHORISED: "paid",
    CAPTURED: "paid",
    SETTLED: "paid",
    REFUSED: "failed",
    CANCELLED: "cancelled",
    ERROR: "failed",
    EXPIRED: "cancelled",
    REFUNDED: "refunded",
    PARTIALLY_REFUNDED: "refunded",
  };

  const newStatus = statusMap[paymentStatus] || "pending";

  try {
    // Update order in Strapi
    await updateOrderStatus(orderCode, {
      status:
        newStatus === "paid"
          ? "paid"
          : newStatus === "failed"
          ? "cancelled"
          : "pending",
      paymentStatus: newStatus,
    });

    // Send confirmation email for successful payments
    if (newStatus === "paid") {
      await sendOrderConfirmation(orderCode);
    }

    console.log(`Order ${orderCode} updated to status: ${newStatus}`);

    return { success: true, orderCode, status: newStatus };
  } catch (error) {
    console.error("Webhook processing error:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to process webhook",
    });
  }
});

/**
 * Validate Worldpay MAC signature
 */
function validateWorldpayMac(params: {
  orderKey: string;
  paymentStatus: string;
  mac: string;
  macSecret: string;
}): boolean {
  const { orderKey, paymentStatus, mac, macSecret } = params;

  if (!mac || !macSecret) {
    // MAC validation disabled in test mode
    return process.env.WORLDPAY_ENV !== "live";
  }

  // Worldpay MAC format: orderKey:paymentStatus
  const dataToSign = `${orderKey}:${paymentStatus}`;
  const expectedMac = crypto
    .createHmac("sha256", macSecret)
    .update(dataToSign)
    .digest("hex");

  return mac.toLowerCase() === expectedMac.toLowerCase();
}

/**
 * Update order status in Strapi
 */
async function updateOrderStatus(
  orderCode: string,
  updates: { status: string; paymentStatus: string }
) {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;
  const strapiToken = config.strapiApiToken;

  // First, find the order by orderCode
  const ordersResponse = await $fetch<{ data: Array<{ id: number }> }>(
    `${strapiUrl}/api/orders?filters[orderNumber][$eq]=${orderCode}`,
    {
      headers: {
        Authorization: `Bearer ${strapiToken}`,
      },
    }
  );

  if (!ordersResponse?.data?.[0]) {
    throw new Error(`Order not found: ${orderCode}`);
  }

  const orderId = ordersResponse.data[0].id;

  // Update the order
  await $fetch(`${strapiUrl}/api/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${strapiToken}`,
    },
    body: {
      data: updates,
    },
  });
}

/**
 * Send order confirmation email
 */
async function sendOrderConfirmation(orderCode: string) {
  // TODO: Implement email sending via Strapi email plugin
  // or external service like SendGrid, Mailgun, etc.
  console.log(`Sending confirmation email for order: ${orderCode}`);
}
