import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.EMAIL_FROM || "CareerHub <onboarding@resend.dev>";

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function getEmailWrapper(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0A0D12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #F1F5F9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0D12; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #12171F; border: 1px solid #202937; border-radius: 3px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #202937;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 28px; height: 28px; background-color: #3178C6; border-radius: 2px; text-align: center; vertical-align: middle; color: #ffffff; font-weight: bold; font-family: monospace; font-size: 13px;">
                    CH
                  </td>
                  <td style="padding-left: 10px; font-size: 15px; font-weight: 600; color: #F1F5F9; letter-spacing: -0.2px;">
                    CareerHub
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px 28px 32px; border-top: 1px solid #202937; background-color: #0E131A;">
              <p style="margin: 0; font-size: 11px; color: #64748B; line-height: 1.5;">
                This email was sent from your CareerHub instance. If you did not make this request, you can safely ignore this email.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #64748B;">
                CareerHub &middot; Automated Career Pipeline & Ingestion
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/verify?token=${encodeURIComponent(token)}`;

  const contentHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #F1F5F9; letter-spacing: -0.3px;">
      Verify your email address
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 13px; color: #94A3B8; line-height: 1.6;">
      Thank you for creating an account with CareerHub. Please confirm your email address to secure your account and enable full pipeline features.
    </p>
    <div style="margin: 0 0 28px 0;">
      <a href="${verifyUrl}" style="background-color: #3178C6; color: #ffffff; text-decoration: none; padding: 10px 22px; font-size: 13px; font-weight: 600; border-radius: 3px; display: inline-block;">
        Verify Email Address
      </a>
    </div>
    <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748B;">
      Or copy and paste this URL into your browser:
    </p>
    <p style="margin: 0; font-size: 11px; font-family: monospace; color: #5499EB; word-break: break-all; background-color: #0A0D12; padding: 10px 12px; border: 1px solid #202937; border-radius: 2px;">
      ${verifyUrl}
    </p>
  `;

  const html = getEmailWrapper("Verify your CareerHub account", contentHtml);

  if (!resend) {
    console.log(`\n================== [DEV EMAIL] ==================`);
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your CareerHub account`);
    console.log(`Verify URL: ${verifyUrl}`);
    console.log(`=================================================\n`);
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Verify your CareerHub account",
      html,
    });

    if (error) {
      console.error("Resend error sending verification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Network failure sending verification email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const contentHtml = `
    <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #F1F5F9; letter-spacing: -0.3px;">
      Reset your password
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 13px; color: #94A3B8; line-height: 1.6;">
      We received a request to reset your password for your CareerHub account. Click the button below to set a new password. This link will expire in 1 hour.
    </p>
    <div style="margin: 0 0 28px 0;">
      <a href="${resetUrl}" style="background-color: #3178C6; color: #ffffff; text-decoration: none; padding: 10px 22px; font-size: 13px; font-weight: 600; border-radius: 3px; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748B;">
      If the button above does not work, visit this link:
    </p>
    <p style="margin: 0; font-size: 11px; font-family: monospace; color: #5499EB; word-break: break-all; background-color: #0A0D12; padding: 10px 12px; border: 1px solid #202937; border-radius: 2px;">
      ${resetUrl}
    </p>
  `;

  const html = getEmailWrapper("Reset your CareerHub password", contentHtml);

  if (!resend) {
    console.log(`\n================== [DEV EMAIL] ==================`);
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your CareerHub password`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`=================================================\n`);
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Reset your CareerHub password",
      html,
    });

    if (error) {
      console.error("Resend error sending password reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Network failure sending password reset email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}
