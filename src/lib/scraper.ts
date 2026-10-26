import * as cheerio from "cheerio";
import { executeLlmCall, type UserLlmConfig } from "./llm-provider";

export type { UserLlmConfig };

export interface ScrapedJobData {
  jobTitle: string;
  companyName: string;
  location?: string | null;
  locationType: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  postedDate?: string | null;
  jobDescription?: string;
  jobUrl: string;
}

interface LlmExtractedData {
  companyName?: string | null;
  jobTitle?: string | null;
  location?: string | null;
  locationType?: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  postedDate?: string | null;
  summary?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
}

export function capitalizeCompanyName(name?: string | null): string {
  if (!name) return "";
  let clean = name.replace(/\s+/g, " ").trim();
  clean = clean
    .replace(/[-|–—]\s*(?:Careers|Jobs|Hiring|Apply|Work).*$/i, "")
    .trim();
  clean = clean.replace(/\s+(?:Careers|Jobs|Hiring)\b/i, "").trim();

  if (!clean) return "";

  const isAllUpper = clean === clean.toUpperCase() && /[A-Z]/.test(clean);
  const isAllLower = clean === clean.toLowerCase() && /[a-z]/.test(clean);

  if (isAllUpper || isAllLower) {
    return clean
      .toLowerCase()
      .split(" ")
      .map((word) => {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  }

  return clean
    .split(" ")
    .map((word) => {
      if (!word) return "";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function cleanHtmlToSnippet(html: string): string {
  try {
    const $ = cheerio.load(html);
    $(
      "script, style, noscript, svg, nav, footer, header, iframe, form, button"
    ).remove();

    const title = $("title").text().replace(/\s+/g, " ").trim();
    const metaDesc =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    return `Page Title: ${title}\nDescription: ${metaDesc}\nContent:\n${bodyText}`.slice(
      0,
      4000
    );
  } catch {
    return "";
  }
}

function inferFallbackFromUrl(url: string): {
  company: string;
  role: string;
} {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const parts = host.split(".");
    let rawCompany = parts[0] || "Company";

    if (
      (host.includes("greenhouse.io") ||
        host.includes("lever.co") ||
        host.includes("ashbyhq.com")) &&
      parsed.pathname
    ) {
      const seg = parsed.pathname.split("/").filter(Boolean)[0];
      if (
        seg &&
        !["jobs", "job", "view", "apply"].includes(seg.toLowerCase())
      ) {
        rawCompany = seg;
      }
    }

    const segments = parsed.pathname
      .split("/")
      .filter(
        (s) =>
          s &&
          !/^[0-9a-f-]{5,}$/i.test(s) &&
          !/^\d+$/.test(s) &&
          !["jobs", "job", "view", "apply", "careers"].includes(s.toLowerCase())
      );
    const rawRole = segments[segments.length - 1] || "Job Position";
    const role = rawRole
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

    return {
      company: capitalizeCompanyName(rawCompany),
      role: role || "Job Position",
    };
  } catch {
    return { company: "Company", role: "Job Position" };
  }
}

async function extractJobWithLlm(
  contentSnippet: string,
  url: string,
  fallbackCompany: string,
  userConfig?: UserLlmConfig
): Promise<LlmExtractedData | null> {
  const prompt = `You are an expert AI job extractor. Extract structured job metadata from this job posting text:
Target URL: ${url}
Preliminary Company: ${fallbackCompany}

Text:
${contentSnippet}

Return ONLY a JSON object with this exact schema:
{
  "companyName": "Capitalized employer name (e.g. Accenture, Google, Stripe) or null",
  "jobTitle": "Job position title (e.g. Operations Engineer) or null",
  "location": "City, State/Region, Country or Remote or null",
  "locationType": "REMOTE" | "HYBRID" | "ONSITE",
  "employmentType": "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
  "postedDate": "YYYY-MM-DD or null",
  "summary": "1-2 sentence overview or null",
  "salaryMin": null,
  "salaryMax": null,
  "currency": "USD"
}`;

  try {
    let rawJson = await executeLlmCall(prompt, userConfig);
    if (!rawJson && userConfig?.provider && userConfig.provider !== "GEMINI") {
      rawJson = await executeLlmCall(prompt, { provider: "GEMINI" });
    }

    if (rawJson) {
      const cleaned = rawJson.replace(/```json\s*|```\s*$/g, "").trim();
      return JSON.parse(cleaned) as LlmExtractedData;
    }
  } catch (err) {
    console.warn("LLM extraction call failed:", err);
  }

  return null;
}

export async function scrapeJobUrl(
  url: string,
  userConfig?: UserLlmConfig
): Promise<ScrapedJobData> {
  const fallback = inferFallbackFromUrl(url);

  let rawHtml = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      rawHtml = await res.text();
    }
  } catch (err) {
    console.warn("HTML fetch failed for URL:", url, err);
  }

  const snippet = rawHtml ? cleanHtmlToSnippet(rawHtml) : "";
  const llmData = snippet
    ? await extractJobWithLlm(snippet, url, fallback.company, userConfig)
    : null;

  const validLocationTypes: Array<"REMOTE" | "HYBRID" | "ONSITE"> = [
    "REMOTE",
    "HYBRID",
    "ONSITE",
  ];
  const validEmploymentTypes: Array<
    "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP"
  > = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

  const companyName = capitalizeCompanyName(
    llmData?.companyName || fallback.company
  );
  const jobTitle = llmData?.jobTitle?.trim() || fallback.role;
  const location = llmData?.location?.trim() || null;
  const locationType =
    llmData?.locationType && validLocationTypes.includes(llmData.locationType)
      ? llmData.locationType
      : location?.toLowerCase().includes("remote")
        ? "REMOTE"
        : "ONSITE";
  const employmentType =
    llmData?.employmentType &&
    validEmploymentTypes.includes(llmData.employmentType)
      ? llmData.employmentType
      : "FULL_TIME";

  return {
    jobTitle,
    companyName,
    location,
    locationType,
    employmentType,
    salaryMin: llmData?.salaryMin ?? null,
    salaryMax: llmData?.salaryMax ?? null,
    currency: llmData?.currency || "USD",
    postedDate: llmData?.postedDate || null,
    jobDescription: llmData?.summary || "",
    jobUrl: url,
  };
}
