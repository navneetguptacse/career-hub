import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { scrapeUrlSchema } from "@/lib/validations";
import { scrapeJobUrl } from "@/lib/scraper";

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

    const scrapedData = await scrapeJobUrl(parsed.data.url);
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
