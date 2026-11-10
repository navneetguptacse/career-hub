const RESEND_API_URL = "https://api.resend.com/emails";

function getBaseUrl(): string {
  const url =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return url.replace(/\/+$/, "");
}

function renderEmailTemplate(options: {
  badge: string;
  headline: string;
  description: string;
  actionUrl: string;
  actionText: string;
  footnote: string;
}): string {
  const logoUrl = `${getBaseUrl()}/icons/icon_x128.png`;
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style type="text/css">
      @media (prefers-color-scheme: dark) {
        .email-bg { background-color: #0A0D12 !important; }
        .email-card { background-color: #12171F !important; border-color: #202937 !important; }
        .email-header { background-color: #0E131A !important; border-color: #202937 !important; }
        .email-title { color: #F1F5F9 !important; }
        .email-text { color: #94A3B8 !important; }
        .email-link-box { background-color: #0A0D12 !important; border-color: #202937 !important; }
        .email-link { color: #5499EB !important; }
        .email-footer { background-color: #0E131A !important; border-color: #202937 !important; }
      }
    </style>
  </head>
  <body class="email-bg" style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; -webkit-font-smoothing: antialiased;">
    <!-- Hidden Preheader -->
    <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
      ${options.description}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-bg" style="width: 100%; background-color: #F8FAFC; margin: 0; padding: 0;">
      <tr>
        <td align="center" style="padding: 48px 20px; margin: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" class="email-card" style="max-width: 560px; width: 100%; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 3px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
            <!-- Top Accent Bar -->
            <tr>
              <td style="height: 3px; background-color: #3178C6;"></td>
            </tr>

            <!-- Brand Header -->
            <tr>
              <td class="email-header" style="padding: 22px 32px; border-bottom: 1px solid #E2E8F0; background-color: #F8FAFC;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="vertical-align: middle;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 28px; height: 28px; background-color: #3477B8; border-radius: 2px; text-align: center; vertical-align: middle; color: #FFFFFF; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 28px;">
                            <img src="${logoUrl}" alt="CH" width="28" height="28" style="display: block; width: 28px; height: 28px; border-radius: 2px; border: 0; outline: none; text-decoration: none;" />
                          </td>
                          <td class="email-title" style="padding-left: 12px; font-size: 15px; font-weight: 700; color: #0F172A; letter-spacing: -0.2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            Career Hub
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <span style="display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: 600; color: #3178C6; background-color: rgba(49, 120, 198, 0.08); border: 1px solid rgba(49, 120, 198, 0.2); border-radius: 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ${options.badge}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Content Body -->
            <tr>
              <td style="padding: 34px 32px 28px 32px;">
                <h1 class="email-title" style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0F172A; letter-spacing: -0.3px; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${options.headline}
                </h1>
                <p class="email-text" style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${options.description}
                </p>

                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0" style="margin: 0 0 28px 0;">
                  <tr>
                    <td style="border-radius: 3px; background-color: #3178C6;">
                      <a href="${options.actionUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 13px; font-weight: 600; color: #FFFFFF; text-decoration: none; border-radius: 3px; letter-spacing: 0.2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        ${options.actionText} &rarr;
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Direct Link Box -->
                <div class="email-link-box" style="margin: 0 0 24px 0; padding: 12px 14px; background-color: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 2px;">
                  <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    Direct Link
                  </p>
                  <p style="margin: 0; font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; word-break: break-all; line-height: 1.5;">
                    <a href="${options.actionUrl}" class="email-link" target="_blank" style="color: #2563EB; text-decoration: underline;">
                      ${options.actionUrl}
                    </a>
                  </p>
                </div>

                <!-- Security Footnote -->
                <p style="margin: 0; font-size: 11px; color: #64748B; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  ${options.footnote}
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="email-footer" style="padding: 18px 32px 22px 32px; border-top: 1px solid #E2E8F0; background-color: #F8FAFC;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="font-size: 11px; color: #64748B; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      Career Hub &middot; Automated Career Pipeline & Ingestion System
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 4px; font-size: 11px; color: #94A3B8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
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
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const rawFrom =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "";
  const fromAddress = rawFrom.replace(/^["']|["']$/g, "").trim();

  if (!apiKey || !fromAddress) {
    return {
      success: false,
      error:
        "Email delivery is not configured. Please set RESEND_API_KEY and RESEND_FROM_EMAIL in your environment variables.",
    };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Resend API error (${response.status})`;
      try {
        const errorBody = (await response.json()) as {
          message?: string;
          error?: string;
        };
        errorMessage = errorBody.message || errorBody.error || errorMessage;
      } catch {
        // Ignore JSON parse errors on non-JSON error responses
      }
      console.error("Email dispatch failure:", errorMessage);
      return { success: false, error: errorMessage };
    }

    return {
      success: true,
      message: "A verification email sent to your inbox.",
    };
  } catch (err: unknown) {
    console.error("Email dispatch failure:", err);
    const message =
      err instanceof Error
        ? err.message
        : "Failed to dispatch email via Resend.";
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
    badge: "Account Verification",
    headline: "Verify your email address",
    description:
      "Thank you for registering with Career Hub. Please confirm your email address to secure your account and activate full job pipeline tracking features.",
    actionUrl: verifyUrl,
    actionText: "Verify Email Address",
    footnote:
      "Security Notice: This verification link expires in 24 hours. If you did not create an account on Career Hub, please disregard this email.",
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`Recipient: ${email}`);
    console.log(`Verify URL: ${verifyUrl}`);
  }

  return dispatchEmail(email, "Verify your Career Hub account", html);
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const html = renderEmailTemplate({
    badge: "Security Alert",
    headline: "Reset your password",
    description:
      "We received a request to reset the password associated with your Career Hub account. Click the button below to specify a new password.",
    actionUrl: resetUrl,
    actionText: "Reset Password",
    footnote:
      "Security Notice: This password reset link expires in 1 hour. If you did not initiate this request, your account remains secure and no changes were made.",
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`Recipient: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
  }

  return dispatchEmail(email, "Reset your Career Hub password", html);
}
