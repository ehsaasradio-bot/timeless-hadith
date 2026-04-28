// lib/email.ts
// Email utility using Resend (https://resend.com)
// Free tier: 100 emails/day, 3,000/month
// Install: npm install resend

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM ?? 'shop@timelesshadith.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'ehsaasradio@gmail.com';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email send');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        reply_to: replyTo,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[email] Resend error:', err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[email] Failed to send:', err);
    return false;
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

interface OrderItem {
  product_title: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  shippingAddress?: string;
  isDigitalOnly?: boolean;
}

function baseEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Timeless Hadith</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#FAF7F2;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;border:1px solid #E8DDD0;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#0D4A3C;padding:28px 40px;text-align:center;">
              <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0;letter-spacing:-0.02em;">
                Timeless Hadith
              </h1>
              <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:4px 0 0;">
                timelesshadith.com/shop
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #F0E8DC;background:#FAF7F2;text-align:center;">
              <p style="color:#AAA;font-size:11px;margin:0;line-height:1.6;">
                Timeless Hadith &mdash; Premium Islamic Merchandise<br/>
                <a href="https://timelesshadith.com/shop" style="color:#0D4A3C;text-decoration:none;">timelesshadith.com/shop</a>
                &nbsp;&bull;&nbsp;
                <a href="https://timelesshadith.com/shop/unsubscribe" style="color:#AAA;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function buildOrderConfirmationEmail(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #F0E8DC;font-size:14px;color:#1C1C1E;">
        ${item.product_title}${item.quantity > 1 ? ` &times; ${item.quantity}` : ''}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #F0E8DC;font-size:14px;color:#1C1C1E;text-align:right;font-weight:600;">
        $${item.line_total.toFixed(2)}
      </td>
    </tr>`
    )
    .join('');

  const content = `
    <h2 style="font-size:22px;font-weight:700;color:#1C1C1E;margin:0 0 8px;">
      Order Confirmed
    </h2>
    <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
      As-salaamu alaikum ${data.customerName},<br/>
      Thank you for your order. We'll get it ready for you right away.
    </p>

    <!-- Order number badge -->
    <div style="background:#F0E8DC;border-radius:12px;padding:16px 20px;margin-bottom:28px;display:inline-block;">
      <span style="font-size:12px;color:#888;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Order Number</span><br/>
      <span style="font-size:20px;font-weight:700;color:#0D4A3C;">${data.orderNumber}</span>
    </div>

    <!-- Items table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${itemRows}
      <tr>
        <td style="padding:12px 0;font-size:13px;color:#888;">Subtotal</td>
        <td style="padding:12px 0;font-size:13px;color:#888;text-align:right;">$${data.subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#888;">Shipping</td>
        <td style="padding:4px 0;font-size:13px;color:#888;text-align:right;">
          ${data.shippingCost === 0 ? 'Free' : `$${data.shippingCost.toFixed(2)}`}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 0 4px;font-size:17px;font-weight:700;color:#1C1C1E;border-top:2px solid #E8DDD0;">Total</td>
        <td style="padding:16px 0 4px;font-size:17px;font-weight:700;color:#0D4A3C;text-align:right;border-top:2px solid #E8DDD0;">
          $${data.total.toFixed(2)} ${data.currency}
        </td>
      </tr>
    </table>

    ${
      data.isDigitalOnly
        ? `<div style="background:#F0F9F4;border:1px solid #C3E6D5;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <p style="font-size:14px;color:#0D4A3C;margin:0;font-weight:600;">Digital Download Ready</p>
            <p style="font-size:13px;color:#555;margin:6px 0 0;">
              Your download link has been sent separately. It expires in 7 days.
            </p>
           </div>`
        : data.shippingAddress
        ? `<div style="background:#FAF7F2;border:1px solid #E8DDD0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
            <p style="font-size:12px;color:#888;margin:0 0 4px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Shipping To</p>
            <p style="font-size:14px;color:#1C1C1E;margin:0;line-height:1.6;">${data.shippingAddress}</p>
           </div>`
        : ''
    }

    <a href="https://timelesshadith.com/shop/orders/${data.orderNumber}"
       style="display:inline-block;background:#0D4A3C;color:#ffffff;font-size:14px;font-weight:600;
              padding:14px 28px;border-radius:12px;text-decoration:none;">
      View Order
    </a>

    <p style="font-size:13px;color:#888;margin:28px 0 0;line-height:1.6;">
      Questions? Reply to this email or visit our
      <a href="https://timelesshadith.com/shop/faq" style="color:#0D4A3C;">help centre</a>.
    </p>
  `;

  return baseEmailWrapper(content);
}

export function buildOrderShippedEmail(data: {
  orderNumber: string;
  customerName: string;
  trackingNumber: string;
  carrier: string;
  trackingUrl?: string;
}): string {
  const content = `
    <h2 style="font-size:22px;font-weight:700;color:#1C1C1E;margin:0 0 8px;">
      Your order is on its way!
    </h2>
    <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
      As-salaamu alaikum ${data.customerName},<br/>
      Great news — order <strong>${data.orderNumber}</strong> has been shipped.
    </p>

    <div style="background:#F0E8DC;border-radius:12px;padding:20px;margin-bottom:28px;">
      <p style="font-size:12px;color:#888;margin:0 0 4px;font-weight:600;text-transform:uppercase;">Tracking Number</p>
      <p style="font-size:18px;font-weight:700;color:#0D4A3C;margin:0;">${data.trackingNumber}</p>
      <p style="font-size:13px;color:#888;margin:4px 0 0;">Carrier: ${data.carrier}</p>
    </div>

    ${
      data.trackingUrl
        ? `<a href="${data.trackingUrl}" style="display:inline-block;background:#0D4A3C;color:#fff;font-size:14px;font-weight:600;padding:14px 28px;border-radius:12px;text-decoration:none;">
           Track Package
           </a>`
        : ''
    }
  `;
  return baseEmailWrapper(content);
}

export function buildNewsletterConfirmEmail(email: string): string {
  const content = `
    <h2 style="font-size:22px;font-weight:700;color:#1C1C1E;margin:0 0 8px;">
      You're subscribed.
    </h2>
    <p style="font-size:15px;color:#555;margin:0 0 24px;line-height:1.6;">
      As-salaamu alaikum,<br/>
      You're now on the Timeless Hadith list. We'll only reach out when there's
      something worth opening — new collections, seasonal drops, and subscriber-only deals.
    </p>
    <a href="https://timelesshadith.com/shop"
       style="display:inline-block;background:#0D4A3C;color:#fff;font-size:14px;font-weight:600;padding:14px 28px;border-radius:12px;text-decoration:none;">
      Browse the Shop
    </a>
    <p style="font-size:12px;color:#AAA;margin:24px 0 0;">
      Not you? <a href="https://timelesshadith.com/shop/unsubscribe?email=${encodeURIComponent(email)}" style="color:#AAA;">Unsubscribe here</a>.
    </p>
  `;
  return baseEmailWrapper(content);
}

export function buildLowStockAlertEmail(data: {
  productTitle: string;
  sku: string;
  quantityOnHand: number;
  threshold: number;
}): string {
  const content = `
    <h2 style="font-size:22px;font-weight:700;color:#B44A2A;margin:0 0 8px;">
      Low Stock Alert
    </h2>
    <p style="font-size:15px;color:#555;margin:0 0 20px;line-height:1.6;">
      <strong>${data.productTitle}</strong> (SKU: ${data.sku}) is running low.
    </p>
    <div style="background:#FFF5F0;border:1px solid #FFCBB0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="font-size:28px;font-weight:700;color:#B44A2A;margin:0;">${data.quantityOnHand}</p>
      <p style="font-size:13px;color:#888;margin:4px 0 0;">units remaining (threshold: ${data.threshold})</p>
    </div>
    <a href="https://timelesshadith.com/shop/admin/products"
       style="display:inline-block;background:#0D4A3C;color:#fff;font-size:14px;font-weight:600;padding:14px 28px;border-radius:12px;text-decoration:none;">
      Manage Inventory
    </a>
  `;
  return baseEmailWrapper(content);
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

export async function sendOrderConfirmation(data: OrderEmailData) {
  const [toCustomer, toAdmin] = await Promise.all([
    sendEmail({
      to: data.customerEmail,
      subject: `Order Confirmed — ${data.orderNumber} | Timeless Hadith`,
      html: buildOrderConfirmationEmail(data),
    }),
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `[New Order] ${data.orderNumber} — $${data.total.toFixed(2)}`,
      html: buildOrderConfirmationEmail(data),
    }),
  ]);
  return { toCustomer, toAdmin };
}

export async function sendLowStockAlert(data: Parameters<typeof buildLowStockAlertEmail>[0]) {
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Low Stock] ${data.productTitle} — ${data.quantityOnHand} left`,
    html: buildLowStockAlertEmail(data),
  });
}
