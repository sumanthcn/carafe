import { Context } from 'koa';

export default {
  async submit(ctx: Context) {
    const { name, email, subject, message } = (ctx.request.body || {}) as Record<string, string>;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return ctx.badRequest('Name, email and message are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ctx.badRequest('Invalid email address');
    }

    try {
      const { sendRawEmail } = await import('../../order/services/emailService');

      const subjectLine = subject?.trim()
        ? `Contact Form: ${subject.trim()}`
        : `Contact Form message from ${name.trim()}`;

      const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:20px;background:#f3f4f6;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;
              box-shadow:0 2px 8px rgba(0,0,0,.06);">
    <div style="background:#007ba7;padding:24px 32px;">
      <h2 style="color:white;margin:0;font-size:18px;">📩 New Contact Form Submission</h2>
    </div>
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <tr>
          <td style="padding:10px 14px;color:#6b7280;width:30%;background:#f9fafb;">Name</td>
          <td style="padding:10px 14px;font-weight:600;color:#111827;">${name.trim()}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;color:#6b7280;background:#f9fafb;">Email</td>
          <td style="padding:10px 14px;color:#111827;">
            <a href="mailto:${email.trim()}" style="color:#007ba7;">${email.trim()}</a>
          </td>
        </tr>
        ${subject?.trim() ? `
        <tr>
          <td style="padding:10px 14px;color:#6b7280;background:#f9fafb;">Subject</td>
          <td style="padding:10px 14px;color:#111827;">${subject.trim()}</td>
        </tr>` : ''}
      </table>
      <h3 style="font-size:15px;color:#111827;margin:0 0 12px;">Message</h3>
      <div style="background:#f9fafb;border-radius:6px;padding:16px;color:#374151;
                  line-height:1.7;white-space:pre-wrap;font-size:14px;">
${message.trim()}
      </div>
    </div>
    <div style="padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;
                font-size:12px;color:#9ca3af;">
      Sent via carafecoffee.co.uk contact form
    </div>
  </div>
</body>
</html>`;

      const recipientEmail = process.env.CONTACT_EMAIL || 'info@carafecoffee.co.uk';
      const strapiInstance = (global as any).strapi;
      await sendRawEmail(recipientEmail, subjectLine, html);

      strapiInstance.log.info(`[contact-form] Message from ${email} sent to ${recipientEmail}`);

      return ctx.send({ message: 'Your message has been sent. We\'ll get back to you soon!' });
    } catch (err: any) {
      (global as any).strapi?.log.error('[contact-form] Failed to send email:', err.message);
      return ctx.internalServerError('Failed to send message. Please try again later.');
    }
  },
};
