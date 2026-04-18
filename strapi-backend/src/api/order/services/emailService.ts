/**
 * emailService.ts
 * ─────────────────────────────────────────────────────────────
 * Centralised email service using Nodemailer + SMTP.
 *
 * Key behaviours:
 *  • Looks up active EmailTemplate for the status
 *  • Falls back to built-in HTML if no template exists
 *  • Writes a row to EmailLog collection (visible in Strapi admin)
 *  • Never re-throws – email failures do NOT break order creation
 */

import nodemailer, { type Transporter } from 'nodemailer';
import { parseTemplate, buildPlaceholderMap, parsePlaceholders } from './templateParser';

// ─── Lazy singleton transporter ──────────────────────────────
let _transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (_transporter) return _transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = port === 465;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP configuration incomplete – set SMTP_HOST, SMTP_USER, SMTP_PASS in .env'
    );
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,          // false for port 587 (STARTTLS), true for port 465 (SSL)
    requireTLS: true, // force STARTTLS upgrade – required by Office 365
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  });

  return _transporter;
}

export function resetTransporter() {
  _transporter = null;
}

// ─── SMTP startup check ───────────────────────────────────────
export async function verifySmtpConnection(log: any): Promise<void> {
  try {
    const t = getTransporter();
    await t.verify();
    log.info('[emailService] ✅ SMTP connection verified successfully');
  } catch (err: any) {
    log.error('[emailService] ❌ SMTP connection failed:', err.message);
  }
}

// ─── Raw send ─────────────────────────────────────────────────
export async function sendRawEmail(
  to: string,
  subject: string,
  html: string,
  attachments: nodemailer.SendMailOptions['attachments'] = []
): Promise<void> {
  // SMTP_FROM_EMAIL lets you send FROM an alias (e.g. noreply@) while
  // authenticating with the main mailbox (SMTP_USER). Falls back to SMTP_USER.
  const fromAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const from = `${process.env.EMAIL_FROM_NAME ?? 'Carafe Coffee'} <${fromAddress}>`;
  const transporter = getTransporter();
  await transporter.sendMail({ from, to, subject, html, attachments });
}

// ─── Main entry point ─────────────────────────────────────────
/**
 * Fetch template for orderStatus → parse placeholders → send email.
 * Falls back to built-in HTML when no template is found in the DB.
 * Always writes an EmailLog row regardless of outcome.
 */
export async function sendOrderEmail(
  orderStatus: string,
  order: any,
  strapiInstance: any,
  pdfBuffer?: Buffer
): Promise<void> {
  const logData: EmailLogPayload = {
    orderNumber:     order.orderNumber ?? '',
    orderDocumentId: order.documentId  ?? String(order.id ?? ''),
    emailType:       orderStatus as any,
    recipient:       order.customerEmail ?? '',
    subject:         '',
    status:          'success',
    templateUsed:    'none',
    hasPdfAttachment: !!pdfBuffer,
    sentAt:          new Date().toISOString(),
  };

  try {
    strapiInstance.log.info(
      `[emailService] Sending "${orderStatus}" email to ${order.customerEmail} (order ${order.orderNumber})`
    );

    // 1. Try to find an active DB template
    let subject = '';
    let body    = '';
    let templateName = 'fallback';

    try {
      const templates = await strapiInstance.entityService.findMany(
        'api::email-template.email-template',
        { filters: { type: orderStatus, isActive: true }, limit: 1 }
      );

      if (templates && templates.length > 0) {
        const tpl = templates[0] as { name: string; subject: string; body: string };
        const parsed = parseTemplate(tpl, order);
        subject      = parsed.subject;
        body         = parsed.body;
        templateName = tpl.name ?? orderStatus;
        strapiInstance.log.info(`[emailService] Using DB template: "${templateName}"`);
      } else {
        strapiInstance.log.warn(
          `[emailService] No DB template for "${orderStatus}" – using built-in fallback HTML`
        );
        // 2. Use built-in fallback
        const fallback = buildFallbackTemplate(orderStatus, order);
        subject = fallback.subject;
        body    = fallback.body;
      }
    } catch (tplErr: any) {
      strapiInstance.log.warn(`[emailService] Could not query templates: ${tplErr.message} – using fallback`);
      const fallback = buildFallbackTemplate(orderStatus, order);
      subject = fallback.subject;
      body    = fallback.body;
    }

    logData.subject      = subject;
    logData.templateUsed = templateName;

    // 3. Build attachments
    const attachments: nodemailer.SendMailOptions['attachments'] = [];
    if (pdfBuffer) {
      attachments.push({
        filename:     `invoice-${order.orderNumber}.pdf`,
        content:      pdfBuffer,
        contentType:  'application/pdf',
      });
    }

    // 4. Send
    await sendRawEmail(order.customerEmail, subject, body, attachments);

    strapiInstance.log.info(
      `[emailService] ✅ Email (${orderStatus}) sent to ${order.customerEmail}`
    );

  } catch (err: any) {
    logData.status       = 'failed';
    logData.errorMessage = err.message;
    strapiInstance.log.error(
      `[emailService] ❌ Failed to send "${orderStatus}" email for ${order.orderNumber}: ${err.message}`
    );
  } finally {
    // Always write the log row – never let logging itself crash the process
    await writeEmailLog(strapiInstance, logData).catch((logErr: any) =>
      strapiInstance.log.error('[emailService] Could not write EmailLog:', logErr.message)
    );
  }
}

// ─── EmailLog writer ─────────────────────────────────────────
interface EmailLogPayload {
  orderNumber:     string;
  orderDocumentId: string;
  emailType:       'order_received' | 'packed' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded' | 'custom';
  recipient:       string;
  subject:         string;
  status:          'success' | 'failed' | 'skipped';
  errorMessage?:   string;
  templateUsed:    string;
  hasPdfAttachment: boolean;
  sentAt:          string;
}

async function writeEmailLog(strapiInstance: any, payload: EmailLogPayload): Promise<void> {
  await strapiInstance.entityService.create('api::email-log.email-log', { data: payload });
}

// ─── Built-in fallback templates ─────────────────────────────
/**
 * Minimal branded HTML used when no DB template is available.
 * Supports the same {{placeholder}} syntax.
 */
function buildFallbackTemplate(
  status: string,
  order: any
): { subject: string; body: string } {
  const map = buildPlaceholderMap(order);

  const SUBJECTS: Record<string, string> = {
    order_received: 'Your Carafe Coffee order is confirmed — {{order_number}}',
    packed:         'Your order has been packed — {{order_number}}',
    shipped:        'Your order is on its way! — {{order_number}}',
    in_transit:     'Your order is in transit — {{order_number}}',
    delivered:      'Your Carafe Coffee order has been delivered — {{order_number}}',
    cancelled:      'Your order has been cancelled — {{order_number}}',
    refunded:       'Your refund has been processed — {{order_number}}',
  };

  const subject = parsePlaceholders(
    SUBJECTS[status] ?? `Order update: {{order_status}} — {{order_number}}`,
    map
  );

  const body = parsePlaceholders(`
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px 0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;
              box-shadow:0 2px 8px rgba(0,0,0,.06);">

    <!-- Header -->
    <div style="background:#007ba7;padding:28px 32px;">
      <h1 style="color:white;margin:0;font-size:22px;">Carafe Coffee Roasters</h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="font-size:16px;color:#111827;margin:0 0 16px;">Hi <strong>{{customer_name}}</strong>,</p>
      <p style="color:#374151;line-height:1.7;margin:0 0 24px;">
        Your order status has been updated to <strong>{{order_status}}</strong>.
      </p>

      <!-- Order box -->
      <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;font-size:14px;margin-bottom:24px;">
        <tr>
          <td style="padding:12px 16px;color:#6b7280;width:40%;">Order Number</td>
          <td style="padding:12px 16px;font-weight:600;color:#111827;">{{order_number}}</td>
        </tr>
        <tr style="background:#ffffff;">
          <td style="padding:12px 16px;color:#6b7280;">Order Date</td>
          <td style="padding:12px 16px;color:#111827;">{{order_date}}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#6b7280;">Total</td>
          <td style="padding:12px 16px;font-weight:700;color:#007ba7;font-size:16px;">{{total_amount}}</td>
        </tr>
        <tr style="background:#ffffff;">
          <td style="padding:12px 16px;color:#6b7280;">Shipping Method</td>
          <td style="padding:12px 16px;color:#111827;">{{shipping_method}}</td>
        </tr>
      </table>

      <!-- Items -->
      <h3 style="font-size:15px;margin:0 0 12px;color:#111827;">Items</h3>
      {{items_list}}

      <!-- Track button -->
      <div style="text-align:center;margin:28px 0;">
        <a href="{{tracking_url}}"
           style="background:#007ba7;color:white;text-decoration:none;padding:14px 32px;
                  border-radius:6px;font-weight:600;font-size:15px;display:inline-block;">
          Track My Order
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;
                font-size:12px;color:#9ca3af;">
      <p style="margin:0;">Carafe Coffee Roasters ·
        <a href="https://www.carafecoffee.co.uk" style="color:#007ba7;">www.carafecoffee.co.uk</a></p>
      <p style="margin:6px 0 0;">Questions? Email
        <a href="mailto:info@carafecoffee.co.uk" style="color:#007ba7;">info@carafecoffee.co.uk</a></p>
    </div>
  </div>
</body>
</html>`, map);

  return { subject, body };
}
