import * as cheerio from "cheerio";
import { extractJobDetailsWithAI, type ExtractedJobData } from "./ai-extractor";

export type ScrapedJobData = ExtractedJobData;

function cleanText(text?: string | null): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

function extractCompanyAndTitle(
  rawTitle: string,
  rawSiteName: string,
  domain: string
): { company: string; title: string } {
  let title = rawTitle;
  let company = rawSiteName;

  const separators = [" at ", " - ", " – ", " — ", " | ", " : "];
  for (const sep of separators) {
    if (rawTitle.includes(sep)) {
      const parts = rawTitle.split(sep);
      if (parts.length >= 2) {
        title = cleanText(parts[0]);
        if (
          !company ||
          company.toLowerCase().includes("careers") ||
          company.toLowerCase().includes("job")
        ) {
          company = cleanText(parts[1]);
        }
        break;
      }
    }
  }

  if (!company) {
    const cleanDomain = domain.replace(/^www\./, "").split(".")[0];
    company = cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
  }

  return { company, title };
}

export async function scrapeJobUrl(url: string): Promise<ScrapedJobData> {
  const parsedUrl = new URL(url);
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: HTTP ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const metaTitle = $("title").text();
  const rawTitle = cleanText(ogTitle || metaTitle || "Job Position");

  const ogSiteName = $('meta[property="og:site_name"]').attr("content");
  const { company, title } = extractCompanyAndTitle(
    rawTitle,
    cleanText(ogSiteName),
    parsedUrl.hostname
  );

  const ogDescription =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="description"]').attr("content");
  const jobDescription = cleanText(ogDescription);

  $("script, style, noscript, iframe, svg").remove();
  const pageText = cleanText($("body").text());

  const baseline: ScrapedJobData = {
    jobTitle: title || "Job Position",
    companyName: company || "Unknown Company",
    jobDescription: jobDescription.slice(0, 2000),
    jobUrl: url,
    location: null,
    locationType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: null,
    salaryMax: null,
    currency: "USD",
  };

  return await extractJobDetailsWithAI(pageText || rawTitle, baseline);
}
