#!/usr/bin/env node

/**
 * Career Hub Telegram Webhook Diagnostic & Sync Utility
 * Usage:
 *   npm run telegram:sync
 *   npm run telegram:sync https://career-hub-bot.vercel.app
 */

const fs = require("fs");
const path = require("path");

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  console.error("Error: TELEGRAM_BOT_TOKEN is not defined in environment.");
  process.exit(1);
}

const PROD_FALLBACK_URL = "https://career-hub-bot.vercel.app";
const cliArgUrl = process.argv[2];
const envUrl = process.env.NEXTAUTH_URL || "";
const isLocalEnvUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(
  envUrl
);
const fallbackUrl =
  envUrl && !isLocalEnvUrl && envUrl.startsWith("https://")
    ? envUrl
    : PROD_FALLBACK_URL;
let baseDomain = cliArgUrl || fallbackUrl;

if (!baseDomain.startsWith("http://") && !baseDomain.startsWith("https://")) {
  baseDomain = `https://${baseDomain}`;
}

const targetUrl = `${baseDomain.replace(/\/+$/, "")}/api/telegram/webhook`;

if (!targetUrl.startsWith("https://")) {
  console.error(
    `Error: Telegram requires an HTTPS webhook URL (received "${targetUrl}"). Pass a public HTTPS domain or tunnel URL.`
  );
  process.exit(1);
}

async function main() {
  console.log("Checking current Telegram webhook status...");
  try {
    const infoRes = await fetch(
      `https://api.telegram.org/bot${token}/getWebhookInfo`
    );
    const infoData = await infoRes.json();

    if (infoData.ok) {
      const current = infoData.result;
      console.log(`Current Webhook: ${current.url || "(None)"}`);
      console.log(`Pending Updates: ${current.pending_update_count || 0}`);
      if (current.last_error_message) {
        console.log(`Last Error: ${current.last_error_message}`);
      }
    }

    console.log(`\nRegistering target: ${targetUrl}`);
    const setUrl = new URL(`https://api.telegram.org/bot${token}/setWebhook`);
    setUrl.searchParams.set("url", targetUrl);
    if (secret) {
      setUrl.searchParams.set("secret_token", secret);
    }

    const setRes = await fetch(setUrl.toString());
    const setData = await setRes.json();

    if (setData.ok) {
      console.log("Success: Telegram webhook synchronized successfully.");
    } else {
      console.error(`Failed to register webhook: ${setData.description}`);
    }
  } catch (err) {
    console.error("Connection error:", err.message);
  }
}

void main();
