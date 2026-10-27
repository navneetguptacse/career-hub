import nodemailer from "nodemailer";

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function getTransporter() {
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) return null;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: pass.replace(/\s+/g, ""),
    },
  });
}

function renderEmailTemplate(options: {
  title: string;
  badge: string;
  headline: string;
  description: string;
  actionUrl: string;
  actionText: string;
  footnote: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0D12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F1F5F9; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0D12; padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #12171F; border: 1px solid #202937; border-radius: 3px; overflow: hidden;">
          <!-- Top Accent Line -->
          <tr>
            <td style="height: 3px; background-color: #3178C6;"></td>
          </tr>

          <!-- Brand Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #202937; background-color: #0E131A;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="vertical-align: middle;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width: 28px; height: 28px; background-color: #3178C6; border-radius: 2px; text-align: center; vertical-align: middle; color: #FFFFFF; font-weight: 700; font-family: monospace; font-size: 13px; line-height: 28px;">
                          CH
                        </td>
                        <td style="padding-left: 12px; font-size: 15px; font-weight: 700; color: #F1F5F9; letter-spacing: -0.2px;">
                          CareerHub
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #3178C6; background-color: rgba(49, 120, 198, 0.12); border: 1px solid rgba(49, 120, 198, 0.25); border-radius: 2px;">
                      ${options.badge}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #F1F5F9; letter-spacing: -0.3px; line-height: 1.3;">
                ${options.headline}
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 13px; color: #94A3B8; line-height: 1.6;">
                ${options.description}
              </p>

              <!-- Call To Action Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                <tr>
                  <td style="border-radius: 3px; background-color: #3178C6;">
                    <a href="${options.actionUrl}" target="_blank" style="display: inline-block; padding: 12px 26px; font-size: 13px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 3px; letter-spacing: 0.2px;">
                      ${options.actionText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link Box -->
              <div style="margin: 0 0 24px 0; padding: 14px 16px; background-color: #0A0D12; border: 1px solid #202937; border-radius: 2px;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">
                  Direct Link
                </p>
                <p style="margin: 0; font-size: 11px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #5499EB; word-break: break-all; line-height: 1.5;">
                  ${options.actionUrl}
                </p>
              </div>

              <!-- Security Notice -->
              <p style="margin: 0; font-size: 11px; color: #64748B; line-height: 1.5;">
                ${options.footnote}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 24px 32px; border-top: 1px solid #202937; background-color: #0E131A;">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 11px; color: #64748B; line-height: 1.5;">
                    CareerHub &middot; Automated Career Pipeline & Ingestion System
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 4px; font-size: 11px; color: #475569;">
                    Automated transactional notification. Please do not reply directly to this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface SendEmailResult {
  success: boolean;
  error?: string;
  message?: string;
}

async function dispatchEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      success: false,
      error:
        "Email delivery is not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in your environment variables.",
    };
  }

  const senderUser = process.env.GMAIL_USER || process.env.SMTP_USER;
  const fromAddress = process.env.EMAIL_FROM || `CareerHub <${senderUser}>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });
    return {
      success: true,
      message: "Verification email sent to your inbox.",
    };
  } catch (err: unknown) {
    console.error("Email dispatch failure:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to dispatch email via mail service.";
    return { success: false, error: message };
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;

  const html = renderEmailTemplate({
    title: "Verify your CareerHub account",
    badge: "Account Verification",
    headline: "Verify your email address",
    description:
      "Thank you for registering with CareerHub. Please confirm your email address to secure your account and activate full job pipeline tracking features.",
    actionUrl: verifyUrl,
    actionText: "Verify Email Address",
    footnote:
      "Security Notice: This verification link expires in 24 hours. If you did not create an account on CareerHub, please disregard this email.",
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`Recipient: ${email}`);
    console.log(`Verify URL: ${verifyUrl}`);
  }

  return dispatchEmail(email, "Verify your CareerHub account", html);
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const html = renderEmailTemplate({
    title: "Reset your CareerHub password",
    badge: "Security Alert",
    headline: "Reset your password",
    description:
      "We received a request to reset the password associated with your CareerHub account. Click the button below to specify a new password.",
    actionUrl: resetUrl,
    actionText: "Reset Password",
    footnote:
      "Security Notice: This password reset link expires in 1 hour. If you did not initiate this request, your account remains secure and no changes were made.",
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`Recipient: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
  }

  return dispatchEmail(email, "Reset your CareerHub password", html);
}
