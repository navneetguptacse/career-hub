import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptApiKey } from "@/lib/encryption";
import { scrapeUrlSchema } from "@/lib/validations";
import { scrapeJobUrl } from "@/lib/scraper";
import type { UserLlmConfig } from "@/lib/ai-extractor";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = scrapeUrlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        llmProvider: true,
        llmApiKeyHash: true,
        llmEndpoint: true,
        llmModel: true,
      },
    });

    let userConfig: UserLlmConfig | undefined;
    if (user?.llmApiKeyHash) {
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

    const scrapedData = await scrapeJobUrl(parsed.data.url, userConfig);
    return NextResponse.json({ data: scrapedData });
  } catch (error) {
    console.error("POST /api/scrape error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to scrape job metadata from URL",
      },
      { status: 422 }
    );
  }
}
