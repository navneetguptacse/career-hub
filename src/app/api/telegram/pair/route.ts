import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePairingToken } from "@/lib/telegram";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        telegramChatId: true,
        telegramPairToken: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.telegramPairToken) {
      const newToken = generatePairingToken();
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: { telegramPairToken: newToken },
        select: {
          telegramChatId: true,
          telegramPairToken: true,
        },
      });
    }

    return NextResponse.json({
      connected: Boolean(user.telegramChatId),
      chatId: user.telegramChatId,
      pairToken: user.telegramPairToken,
      botUsername: process.env.TELEGRAM_BOT_USERNAME || null,
    });
  } catch (error) {
    console.error("GET /api/telegram/pair error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve Telegram status" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        telegramChatId: null,
      },
    });

    return NextResponse.json({
      message: "Telegram disconnected successfully",
    });
  } catch (error) {
    console.error("DELETE /api/telegram/pair error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Telegram" },
      { status: 500 },
    );
  }
}
