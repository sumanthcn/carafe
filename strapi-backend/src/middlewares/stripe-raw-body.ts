/**
 * stripe-raw-body middleware
 *
 * Captures the raw request body as a Buffer for the Stripe webhook endpoint,
 * which requires the raw bytes for HMAC signature verification.
 *
 * This middleware must run BEFORE strapi::body so that the raw stream is
 * still readable. It is registered in config/middlewares.ts.
 */

export default () => {
  return async (ctx: any, next: () => Promise<void>) => {
    // Only intercept the Stripe webhook route
    if (ctx.path === '/api/stripe/webhook' && ctx.method === 'POST') {
      await new Promise<void>((resolve, reject) => {
        const chunks: Buffer[] = [];

        ctx.req.on('data', (chunk: Buffer) => chunks.push(chunk));
        ctx.req.on('end', () => {
          ctx.request.rawBody = Buffer.concat(chunks);
          resolve();
        });
        ctx.req.on('error', reject);
      });
    }

    await next();
  };
};
