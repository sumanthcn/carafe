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

    try {
      const strapiInstance = (global as any).strapi;

      // Fetch the full order (with relations) for email / invoice
      const order = await getFullOrder(strapiInstance, result.id);
      if (!order) return;

      // Generate PDF invoice for new orders
      const { generateInvoicePdf } = await import('../../services/invoiceService');
      const { sendOrderEmail } = await import('../../services/emailService');

      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await generateInvoicePdf(order);
      } catch (pdfErr: any) {
        strapiInstance.log.error('[lifecycle] PDF generation failed:', pdfErr.message);
      }

      // Send order_received email (with invoice attached)
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
