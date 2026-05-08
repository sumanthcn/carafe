/**
 * lifecycles.ts  –  Order content-type lifecycle hooks (Strapi v5)
 * ─────────────────────────────────────────────────────────────────
 * Fires automatically whenever an Order document is created or
 * updated through entityService / documentService.
 *
 * On CREATE  → send "order_received" email + generate invoice PDF
 * On UPDATE  → detect status change → send matching template email
 *              + re-attach invoice for "order_received" / "delivered"
 */

export default {
  async afterCreate(event: any) {
    const { result } = event;

    // Do NOT send confirmation email at order creation time.
    // Payment has not been captured yet — the webhook handler sends the
    // email once Stripe confirms payment (checkout.session.completed).
    if (result.paymentStatus !== 'captured') {
      return;
    }

    try {
      const strapiInstance = (global as any).strapi;

      const order = await getFullOrder(strapiInstance, result.id);
      if (!order) return;

      const { generateInvoicePdf } = await import('../../services/invoiceService');
      const { sendOrderEmail } = await import('../../services/emailService');

      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await generateInvoicePdf(order);
      } catch (pdfErr: any) {
        strapiInstance.log.error('[lifecycle] PDF generation failed:', pdfErr.message);
      }

      await sendOrderEmail('order_received', order, strapiInstance, pdfBuffer);

    } catch (err: any) {
      (global as any).strapi?.log.error('[lifecycle] afterCreate error:', err.message);
    }
  },

  async afterUpdate(event: any) {
    const { result, params } = event;

    try {
      const strapiInstance = (global as any).strapi;

      // Only act when orderStatus changed
      const newStatus: string | undefined = result.orderStatus ?? result.status;
      if (!newStatus) return;

      // Only act when the update payload explicitly contains a status change
      const incomingStatus = params?.data?.orderStatus ?? params?.data?.status;
      if (!incomingStatus) return;

      const order = await getFullOrder(strapiInstance, result.id);
      if (!order) return;

      // The webhook handler sends the order_received email directly after
      // confirming payment, so skip it here to avoid double-sending.
      // For all other statuses (packed, shipped, cancelled, etc.) send normally.
      if (newStatus === 'order_received') {
        // Only send if payment is confirmed (e.g. admin manually forces this status)
        if (order.paymentStatus !== 'captured') {
          strapiInstance.log.info('[lifecycle] Skipping order_received email — payment not captured yet');
          return;
        }
      }

      // Skip emailing for internal payment-pending status
      if (newStatus === 'payment_pending') return;

      const { generateInvoicePdf } = await import('../../services/invoiceService');
      const { sendOrderEmail } = await import('../../services/emailService');

      // Attach invoice to order_received and delivered emails
      let pdfBuffer: Buffer | undefined;
      if (newStatus === 'order_received' || newStatus === 'delivered') {
        try {
          pdfBuffer = await generateInvoicePdf(order);
        } catch (pdfErr: any) {
          strapiInstance.log.error('[lifecycle] PDF generation failed:', pdfErr.message);
        }
      }

      await sendOrderEmail(newStatus, order, strapiInstance, pdfBuffer);

    } catch (err: any) {
      (global as any).strapi?.log.error('[lifecycle] afterUpdate error:', err.message);
    }
  },
};

/**
 * Fetch a fully-populated order by numeric id.
 */
async function getFullOrder(strapiInstance: any, id: number): Promise<any | null> {
  try {
    return await strapiInstance.entityService.findOne(
      'api::order.order',
      id,
      {
        populate: [
          'items',
          'shippingAddress',
          'billingAddress',
          'user',
        ],
      }
    );
  } catch (err: any) {
    strapiInstance.log.error('[lifecycle] Failed to fetch full order:', err.message);
    return null;
  }
}
