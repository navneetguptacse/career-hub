import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scrapeJobUrl } from "@/lib/scraper";
import { decryptApiKey } from "@/lib/encryption";
import type { UserLlmConfig } from "@/lib/ai-extractor";
import {
  sendTelegramMessage,
  extractUrlFromTelegramMessage,
} from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    const headerSecret = req.headers.get("x-telegram-bot-api-secret-token");
    if (webhookSecret && headerSecret && headerSecret !== webhookSecret) {
      console.warn("Telegram secret token mismatch detected in request header");
    }

    const payload = await req.json();
    const message = payload.message || payload.channel_post;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(message.chat.id);
    const text = message.text.trim();

    if (text.startsWith("/start") || text.startsWith("/link")) {
      const parts = text.split(/\s+/);
      const pairToken = parts[1]?.trim().toUpperCase();

      if (!pairToken) {
        await sendTelegramMessage(
          chatId,
          "Welcome to *CareerHub Bot*!\n\nTo connect this chat with your account, please send:\n`/link PAIR-XXXXXX`\n\nYou can find your pairing code in CareerHub Settings."
        );
        return NextResponse.json({ ok: true });
      }

      const user = await prisma.user.findFirst({
        where: { telegramPairToken: pairToken },
      });

      if (!user) {
        await sendTelegramMessage(
          chatId,
          "Invalid or expired pairing token. Please check your token in CareerHub Settings."
        );
        return NextResponse.json({ ok: true });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { telegramChatId: chatId },
      });

      await sendTelegramMessage(
        chatId,
        `CareerHub account connected!\n\nUser: *${user.name || user.email}*\n\nYou can now post job URLs into this chat/group, and they will automatically appear on your Kanban board.`
      );
      return NextResponse.json({ ok: true });
    }

    const jobUrl = extractUrlFromTelegramMessage(text);
    if (!jobUrl) {
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.user.findFirst({
      where: { telegramChatId: chatId },
    });

    if (!user) {
      await sendTelegramMessage(
        chatId,
        "Job link detected, but this chat is not linked to any CareerHub account.\n\nLink your account with:\n`/link <PAIRING_TOKEN>`"
      );
      return NextResponse.json({ ok: true });
    }

    let jobTitle = "Job Position";
    let companyName = "Unknown Company";
    let jobDescription = "";
    let location: string | null = null;
    let locationType: "REMOTE" | "HYBRID" | "ONSITE" = "REMOTE";
    let employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" =
      "FULL_TIME";
    let currency = "USD";

    let userConfig: UserLlmConfig | undefined;
    if (user.llmApiKeyHash) {
      const decrypted = decryptApiKey(user.llmApiKeyHash);
      if (decrypted) {
        userConfig = {
          provider: user.llmProvider,
          apiKey: decrypted,
          endpoint: user.llmEndpoint,
          model: user.llmModel,
        };
      }
    }

    try {
      const scraped = await scrapeJobUrl(jobUrl, userConfig);
      jobTitle = scraped.jobTitle;
      companyName = scraped.companyName;
      jobDescription = scraped.jobDescription || "";
      location = scraped.location || null;
      if (scraped.locationType) locationType = scraped.locationType;
      if (scraped.employmentType) employmentType = scraped.employmentType;
      if (scraped.currency) currency = scraped.currency;
    } catch {
      const domain = new URL(jobUrl).hostname.replace(/^www\./, "");
      companyName = domain.split(".")[0];
      companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
      jobTitle = "Posted Role";
    }

    const app = await prisma.jobApplication.create({
      data: {
        userId: user.id,
        companyName,
        jobTitle,
        jobUrl,
        jobDescription: jobDescription || null,
        location,
        locationType,
        employmentType,
        salaryMin: null,
        salaryMax: null,
        currency,
        source: "TELEGRAM",
        status: "WISHLIST",
        activities: {
          create: {
            userId: user.id,
            type: "INGESTION",
            title: "Saved via Telegram",
            description: `Auto-captured from link: ${jobUrl}`,
          },
        },
      },
    });

    await sendTelegramMessage(
      chatId,
      `*Job Application Saved!*\n\n*Company:* ${app.companyName}\n*Role:* ${app.jobTitle}\n*Status:* Wishlist\n\nView on your dashboard: [Open CareerHub](${process.env.NEXTAUTH_URL || "http://localhost:3000"}/applications)`
    );

    return NextResponse.json({ ok: true, savedId: app.id });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
