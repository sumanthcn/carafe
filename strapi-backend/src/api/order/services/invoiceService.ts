/**
 * invoiceService.ts
 * ─────────────────────────────────────────────────────────────
 * Generates a PDF invoice for an order using PDFKit.
 * Returns a Buffer that can be written to disk or attached to
 * an email.
 *
 * Layout:
 *   ┌─────────────────────────────────────┐
 *   │  LOGO / BRAND       INVOICE header  │
 *   │  FROM address       Invoice details │
 *   ├─────────────────────────────────────┤
 *   │  BILL TO  │  SHIP TO  │  PAYMENT    │
 *   ├─────────────────────────────────────┤
 *   │  Items table                        │
 *   ├─────────────────────────────────────┤
 *   │  Totals (subtotal / shipping / tax) │
 *   ├─────────────────────────────────────┤
 *   │  Footer                             │
 *   └─────────────────────────────────────┘
 */

import PDFDocument from 'pdfkit';

// ─── Brand colours ────────────────────────────────────────────
const BRAND_PRIMARY = '#007ba7';
const BRAND_DARK    = '#1a1a2e';
const GREY_LIGHT    = '#f5f7fa';
const GREY_MID      = '#e0e4ea';
const TEXT_DARK     = '#1a1a2e';
const TEXT_MUTED    = '#6b7280';

// ─── Currency helpers ─────────────────────────────────────────
const SYMBOLS: Record<string, string> = { GBP: '£', EUR: '€', USD: '$' };

function fmt(amount: number | string, currency = 'GBP'): string {
  const sym = SYMBOLS[currency] ?? currency;
  return `${sym}${parseFloat(String(amount ?? 0)).toFixed(2)}`;
}

/**
 * Build an address block string from an address component.
 */
function addressLines(addr: any): string[] {
  if (!addr) return ['—'];
  return [
    `${addr.firstName ?? ''} ${addr.lastName ?? ''}`.trim(),
    addr.line1,
    addr.line2,
    addr.city,
    addr.county,
    addr.postcode,
    addr.country,
  ].filter(Boolean) as string[];
}

/**
 * Generate a PDF invoice and return it as a Buffer.
 */
export async function generateInvoicePdf(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const currency = order.currency ?? 'GBP';
    const now = new Date();

    // ── Page width helpers ──────────────────────────────────────
    const W   = doc.page.width  - 100; // total usable width
    const LM  = 50;                    // left margin

    // ── Header bar ─────────────────────────────────────────────
    doc.rect(LM, 50, W, 70).fill(BRAND_DARK);

    // Brand name
    doc
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('CARAFE', LM + 16, 68);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#a0aec0')
      .text('COFFEE ROASTERS', LM + 16, 92);

    // "INVOICE" label (right)
    doc
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(26)
      .text('INVOICE', LM + W - 120, 62, { width: 120, align: 'right' });

    // ── Company "from" block ────────────────────────────────────
    const fromY = 136;
    doc
      .fillColor(TEXT_MUTED)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('FROM', LM, fromY)
      .moveDown(0.3)
      .font('Helvetica')
      .fillColor(TEXT_DARK)
      .fontSize(9)
      .text('Carafe Coffee Roasters', { lineGap: 2 })
      .text('www.carafecoffee.co.uk',  { lineGap: 2 })
      .text('support@carafecoffee.co.uk', { lineGap: 2 });

    // Invoice meta (right column)
    const metaX = LM + W - 200;
    const metaData = [
      ['Invoice No.',  order.orderNumber ?? `INV-${order.id}`],
      ['Order Date',   new Date(order.createdAt).toLocaleDateString('en-GB')],
      ['Invoice Date', now.toLocaleDateString('en-GB')],
      ['Status',       (order.orderStatus ?? '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())],
    ];

    let metaY = fromY;
    metaData.forEach(([label, value]) => {
      doc
        .font('Helvetica-Bold')
        .fillColor(TEXT_MUTED)
        .fontSize(8)
        .text(label + ':', metaX, metaY, { width: 85 })
        .font('Helvetica')
        .fillColor(TEXT_DARK)
        .text(value, metaX + 90, metaY, { width: 110 });
      metaY += 16;
    });

    // ── Divider ─────────────────────────────────────────────────
    const divY = fromY + 70;
    doc.rect(LM, divY, W, 1).fill(GREY_MID);

    // ── 3-column detail row: Bill To | Ship To | Payment ────────
    const col = W / 3;
    const detailY = divY + 16;

    const blocks = [
      {
        heading: 'BILL TO',
        lines: [
          order.customerName,
          order.customerEmail,
          order.customerPhone,
          ...(order.billingAddress ? addressLines(order.billingAddress) : addressLines(order.shippingAddress)),
        ].filter(Boolean),
      },
      {
        heading: 'SHIP TO',
        lines: addressLines(order.shippingAddress),
      },
      {
        heading: 'PAYMENT',
        lines: [
          `Method: ${order.paymentMethod ?? 'Card'}`,
          `Status: ${(order.paymentStatus ?? '').replace(/\b\w/g, (c: string) => c.toUpperCase())}`,
          order.paymentId ? `Ref: ${order.paymentId}` : null,
          `Shipping: ${order.shippingMethod ?? '—'}`,
          order.carrier ? `Carrier: ${order.carrier}` : null,
          order.trackingNumber ? `Tracking: ${order.trackingNumber}` : null,
        ].filter(Boolean) as string[],
      },
    ];

    blocks.forEach((block, i) => {
      const bx = LM + i * col;
      doc
        .font('Helvetica-Bold')
        .fillColor(BRAND_PRIMARY)
        .fontSize(8)
        .text(block.heading, bx, detailY);

      let lineY = detailY + 14;
      block.lines.slice(0, 6).forEach((line) => {
        doc
          .font('Helvetica')
          .fillColor(TEXT_DARK)
          .fontSize(8.5)
          .text(String(line), bx, lineY, { width: col - 8 });
        lineY += 13;
      });
    });

    // ── Items table ─────────────────────────────────────────────
    const tableY = detailY + 100;

    // Table header
    doc.rect(LM, tableY, W, 22).fill(BRAND_PRIMARY);

    const colProduct  = LM + 8;
    const colQty      = LM + W * 0.55;
    const colUnit     = LM + W * 0.70;
    const colTotal    = LM + W * 0.84;

    doc
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(8.5);

    doc.text('Product',    colProduct, tableY + 7);
    doc.text('Qty',        colQty,     tableY + 7, { width: 40,  align: 'center' });
    doc.text('Unit Price', colUnit,    tableY + 7, { width: 60,  align: 'right'  });
    doc.text('Total',      colTotal,   tableY + 7, { width: 60,  align: 'right'  });

    // Table rows
    const items = order.items ?? [];
    let rowY = tableY + 22;
    items.forEach((item: any, idx: number) => {
      const bg = idx % 2 === 0 ? 'white' : GREY_LIGHT;
      doc.rect(LM, rowY, W, 20).fill(bg);

      const name = item.productName ?? item.name ?? '—';
      const variant = item.variant ? ` (${item.variant})` : '';

      doc
        .font('Helvetica')
        .fillColor(TEXT_DARK)
        .fontSize(8.5);

      doc.text(`${name}${variant}`,                   colProduct, rowY + 5, { width: W * 0.52 });
      doc.text(String(item.quantity ?? 1),             colQty,     rowY + 5, { width: 40,  align: 'center' });
      doc.text(fmt(item.price, currency),               colUnit,    rowY + 5, { width: 60,  align: 'right'  });
      doc.text(fmt((item.price ?? 0) * (item.quantity ?? 1), currency), colTotal, rowY + 5, { width: 60, align: 'right' });

      rowY += 20;
    });

    // Bottom border of table
    doc.rect(LM, rowY, W, 1).fill(GREY_MID);
    rowY += 8;

    // ── Totals block ────────────────────────────────────────────
    const totalsX = LM + W * 0.60;
    const totalsW = W * 0.40;

    const totals = [
      ['Subtotal',  fmt(order.subtotal, currency)],
      ['Shipping',  order.shippingCost === 0 ? 'FREE' : fmt(order.shippingCost, currency)],
      ['VAT / Tax', fmt(order.tax, currency)],
      order.discount && order.discount > 0
        ? ['Discount', `-${fmt(order.discount, currency)}`]
        : null,
    ].filter(Boolean) as [string, string][];

    totals.forEach(([label, value]) => {
      doc
        .font('Helvetica')
        .fillColor(TEXT_MUTED)
        .fontSize(9)
        .text(label, totalsX, rowY, { width: totalsW * 0.55 })
        .font('Helvetica')
        .fillColor(TEXT_DARK)
        .text(value,  totalsX + totalsW * 0.55, rowY, { width: totalsW * 0.45, align: 'right' });
      rowY += 16;
    });

    // Grand total row
    rowY += 4;
    doc.rect(totalsX, rowY, totalsW, 26).fill(BRAND_PRIMARY);
    doc
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(11)
      .text('TOTAL', totalsX + 8, rowY + 7, { width: totalsW * 0.50 })
      .text(fmt(order.total, currency), totalsX, rowY + 7, { width: totalsW - 8, align: 'right' });

    rowY += 40;

    // ── Footer ──────────────────────────────────────────────────
    const footerY = doc.page.height - 70;
    doc.rect(LM, footerY, W, 1).fill(GREY_MID);

    doc
      .font('Helvetica')
      .fillColor(TEXT_MUTED)
      .fontSize(8)
      .text(
        'Thank you for your order! If you have any questions please contact support@carafecoffee.co.uk',
        LM,
        footerY + 8,
        { width: W, align: 'center' }
      )
      .text(
        'Carafe Coffee Roasters  ·  www.carafecoffee.co.uk  ·  VAT No. (if applicable)',
        LM,
        footerY + 22,
        { width: W, align: 'center' }
      );

    doc.end();
  });
}
