import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PROD_WEBHOOK_ORIGIN = "https://career-hub-bot.vercel.app";

function getExpectedWebhookUrl(req: Request): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const requestOrigin = `${proto}://${host}`;
  const isLocalHost =
    host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const envUrl = process.env.NEXTAUTH_URL || "";
  const isHttpsEnv =
    envUrl.startsWith("https://") &&
    !/^https:\/\/(localhost|127\.0\.0\.1)/i.test(envUrl);
  const baseUrl = isLocalHost
    ? isHttpsEnv
      ? envUrl
      : PROD_WEBHOOK_ORIGIN
    : isHttpsEnv
      ? envUrl
      : requestOrigin;
  const cleanBase = baseUrl.replace(/\/+$/, "");
  return `${cleanBase}/api/telegram/webhook`;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error: "TELEGRAM_BOT_TOKEN is not configured in environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    const expectedUrl = getExpectedWebhookUrl(req);
    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/getWebhookInfo`
    );
    const data = await tgRes.json();

    if (!data.ok) {
      return NextResponse.json(
        { error: data.description || "Failed to query Telegram webhook info" },
        { status: 502 }
      );
    }

    const result = data.result || {};
    const telegramUrl = result.url || "";
    const isSynced = telegramUrl === expectedUrl;

    return NextResponse.json({
      configured: Boolean(telegramUrl),
      telegramUrl,
      expectedUrl,
      isSynced,
      pendingUpdates: result.pending_update_count || 0,
      lastError: result.last_error_message || null,
      lastErrorDate: result.last_error_date
        ? new Date(result.last_error_date * 1000).toISOString()
        : null,
      hasCustomCertificate: Boolean(result.has_custom_certificate),
    });
  } catch (error) {
    console.error("Failed to check Telegram webhook status:", error);
    return NextResponse.json(
      { error: "Failed to communicate with Telegram API" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!token) {
    return NextResponse.json(
      {
        error: "TELEGRAM_BOT_TOKEN is not configured in environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const targetUrl = body.url?.trim() || getExpectedWebhookUrl(req);

    if (!targetUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Telegram requires an HTTPS webhook URL." },
        { status: 400 }
      );
    }

    const setWebhookUrl = new URL(
      `https://api.telegram.org/bot${token}/setWebhook`
    );
    setWebhookUrl.searchParams.set("url", targetUrl);
    if (secret) {
      setWebhookUrl.searchParams.set("secret_token", secret);
    }

    const tgRes = await fetch(setWebhookUrl.toString());
    const data = await tgRes.json();

    if (!data.ok) {
      return NextResponse.json(
        { error: data.description || "Failed to set Telegram webhook" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook successfully registered with Telegram.",
      registeredUrl: targetUrl,
    });
  } catch (error) {
    console.error("Failed to set Telegram webhook:", error);
    return NextResponse.json(
      { error: "Failed to update Telegram webhook" },
      { status: 500 }
    );
  }
}
