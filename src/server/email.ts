import "server-only"
import { env, providers } from "@/server/env"
import { BRAND } from "@/lib/brand"

/**
 * Transactional email. Uses Resend when RESEND_API_KEY and EMAIL_FROM are set;
 * otherwise it logs the link to the server console so local development works
 * without an email provider. It never logs in production — if email isn't
 * configured there, sending throws rather than silently dropping the message.
 */

interface Message {
  to: string
  subject: string
  heading: string
  body: string
  actionLabel: string
  url: string
  footer?: string
}

async function send(message: Message): Promise<void> {
  if (!providers.email) {
    if (env.isProduction) {
      throw new Error(
        "Email is not configured (RESEND_API_KEY / EMAIL_FROM) — cannot send transactional mail."
      )
    }
    console.info(
      `\n─── ${BRAND.name} email (dev) ───\n` +
        `to:      ${message.to}\n` +
        `subject: ${message.subject}\n` +
        `link:    ${message.url}\n` +
        `─────────────────────────────\n`
    )
    return
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: render(message),
    }),
  })

  if (!response.ok) {
    // don't leak the provider's response to the caller — it can contain the key's scope
    console.error("email send failed", response.status, await response.text().catch(() => ""))
    throw new Error("Could not send email.")
  }
}

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  )
}

function render({ heading, body, actionLabel, url, footer }: Message): string {
  return `<!doctype html>
<html><body style="margin:0;background:#0a0a0c;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f4f4f5">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#121216;border:1px solid #26262e;border-radius:16px;padding:32px">
        <tr><td>
          <p style="margin:0 0 24px;font-size:15px;font-weight:600;letter-spacing:-0.02em">${escape(BRAND.wordmark)}</p>
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;letter-spacing:-0.02em">${escape(heading)}</h1>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#a1a1aa">${escape(body)}</p>
          <a href="${escape(url)}" style="display:inline-block;background:#f4f4f5;color:#0a0a0c;text-decoration:none;font-size:14px;font-weight:500;padding:11px 20px;border-radius:10px">${escape(actionLabel)}</a>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#71717a">
            ${escape(footer ?? "If you didn't request this, you can safely ignore this email.")}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function sendVerification({ to, url }: { to: string; url: string }) {
  return send({
    to,
    url,
    subject: `Verify your ${BRAND.name} email`,
    heading: "Confirm your email address",
    body: `Click below to verify this address and finish setting up your ${BRAND.name} account. The link expires in one hour.`,
    actionLabel: "Verify email",
  })
}

export function sendPasswordReset({ to, url }: { to: string; url: string }) {
  return send({
    to,
    url,
    subject: `Reset your ${BRAND.name} password`,
    heading: "Reset your password",
    body: "Click below to choose a new password. The link expires in one hour and can only be used once.",
    actionLabel: "Choose a new password",
    footer:
      "If you didn't request a reset, ignore this email — your password hasn't changed.",
  })
}

export function sendMagicLink({ to, url }: { to: string; url: string }) {
  return send({
    to,
    url,
    subject: `Your ${BRAND.name} sign-in link`,
    heading: "Sign in to " + BRAND.name,
    body: "Click below to sign in. The link expires in 10 minutes and works once.",
    actionLabel: "Sign in",
    footer: "If you didn't try to sign in, ignore this email.",
  })
}
