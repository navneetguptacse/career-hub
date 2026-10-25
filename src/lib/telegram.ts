export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: Record<string, unknown>
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Cannot send telegram message.");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          reply_markup: replyMarkup,
        }),
      }
    );
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

export function extractUrlFromTelegramMessage(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

export function generatePairingToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let token = "PAIR-";
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
