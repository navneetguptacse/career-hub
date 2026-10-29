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

interface HtmlMetadata {
  title?: string;
  ogTitle?: string;
  ogSiteName?: string;
  ogDescription?: string;
  keywords?: string;
  jsonLdCompany?: string;
  jsonLdTitle?: string;
  jsonLdLocation?: string;
  bodySnippet: string;
}

export function capitalizeCompanyName(name?: string | null): string {
  if (!name) return "";
  let clean = name.replace(/\s+/g, " ").trim();
  clean = clean
    .replace(/[-|–—]\s*(?:Careers|Jobs|Hiring|Apply|Work).*$/i, "")
    .trim();
  clean = clean.replace(/\s+(?:Careers|Jobs|Hiring)\b/i, "").trim();
  if (!clean) return "";

  return clean
    .split(" ")
    .map((w) =>
      !w ? "" : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}

function parseHtmlMetadata(html: string): HtmlMetadata {
  try {
    const $ = cheerio.load(html);
    let jsonLdCompany: string | undefined;
    let jsonLdTitle: string | undefined;
    let jsonLdLocation: string | undefined;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).text());
        const item = Array.isArray(json)
          ? json.find((i) => i?.["@type"] === "JobPosting") || json[0]
          : json?.["@graph"]
            ? json["@graph"].find(
                (i: { ["@type"]?: string }) => i?.["@type"] === "JobPosting"
              )
            : json;

        if (item?.["@type"] === "JobPosting" || item?.title) {
          if (item.title) jsonLdTitle = String(item.title).trim();
          if (item.hiringOrganization?.name) {
            jsonLdCompany = String(item.hiringOrganization.name).trim();
          }
          const loc = item.jobLocation?.address;
          if (typeof loc === "string") jsonLdLocation = loc.trim();
          else if (loc && typeof loc === "object") {
            const parts = [
              loc.addressLocality,
              loc.addressRegion,
              loc.addressCountry,
            ].filter(Boolean);
            if (parts.length) jsonLdLocation = parts.join(", ");
          }
        }
      } catch {
        // Ignore JSON-LD parse errors
      }
    });

    const ogTitle =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content");
    const ogSiteName = $('meta[property="og:site_name"]').attr("content");
    const ogDescription =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content");
    const keywords = $('meta[name="keywords"]').attr("content");
    const title = $("title").text().replace(/\s+/g, " ").trim();

    $(
      "script, style, noscript, svg, nav, footer, header, iframe, form, button"
    ).remove();
    const bodySnippet = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3500);

    return {
      title,
      ogTitle: ogTitle?.trim(),
      ogSiteName: ogSiteName?.trim(),
      ogDescription: ogDescription?.trim(),
      keywords: keywords?.trim(),
      jsonLdCompany,
      jsonLdTitle,
      jsonLdLocation,
      bodySnippet,
    };
  } catch {
    return { bodySnippet: "" };
  }
}

function inferFallback(
  url: string,
  meta?: HtmlMetadata
): { company: string; role: string; location?: string | null } {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const parts = host.split(".");
    const pathParts = parsed.pathname.split("/").filter(Boolean);

    let rawCompany = meta?.jsonLdCompany || meta?.ogSiteName || "";
    let rawRole = meta?.jsonLdTitle || meta?.ogTitle || "";

    if (!rawCompany) {
      if (host.includes("smartrecruiters.com") && pathParts.length > 0) {
        rawCompany = pathParts[0];
      } else if (
        pathParts.length > 0 &&
        ["greenhouse.io", "lever.co", "ashbyhq.com", "workable.com"].some(
          (ats) => host.includes(ats)
        )
      ) {
        const seg = pathParts[0];
        if (
          !["jobs", "job", "view", "apply", "careers"].includes(
            seg.toLowerCase()
          )
        )
          rawCompany = seg;
      } else {
        const sub = parts[0];
        if (
          sub &&
          !["jobs", "job", "careers", "boards", "apply"].includes(
            sub.toLowerCase()
          )
        ) {
          rawCompany = sub;
        } else if (parts[1]) {
          rawCompany = parts[1];
        }
      }
    }

    if (!rawRole) {
      const lastSeg = pathParts[pathParts.length - 1] || "";
      rawRole = lastSeg
        .replace(/^\d+[-_]*/, "")
        .replace(/[-_]+/g, " ")
        .trim();
    }

    const company = capitalizeCompanyName(rawCompany || "Company");
    const role = rawRole
      ? rawRole
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim()
      : "Job Position";

    return {
      company: company || "Company",
      role: role || "Job Position",
      location: meta?.jsonLdLocation || null,
    };
  } catch {
    return { company: "Company", role: "Job Position" };
  }
}

async function extractJobWithLlm(
  meta: HtmlMetadata,
  url: string,
  preliminaryCompany: string,
  userConfig?: UserLlmConfig
): Promise<LlmExtractedData | null> {
  const prompt = `You are an expert AI job metadata extraction engine.
Target URL: ${url}
Candidate Company: ${preliminaryCompany}
Page Title: ${meta.title || "N/A"}
OpenGraph Title: ${meta.ogTitle || "N/A"}
Description: ${meta.ogDescription || "N/A"}
Keywords: ${meta.keywords || "N/A"}
Body:
${meta.bodySnippet}

Extract structured metadata accurately:
1. companyName: Actual hiring employer (e.g. Swiggy, Google). Never return ATS or portal names like SmartRecruiters, Jobs, or Greenhouse.
2. jobTitle: Clean title (e.g. Data Scientist II). Strip internal requisition numbers, job IDs, or numeric codes.
3. location: City, State, Country (e.g. Bengaluru, Karnataka, India) or null if remote.
4. locationType: REMOTE, HYBRID, or ONSITE.
5. employmentType: FULL_TIME, PART_TIME, CONTRACT, or INTERNSHIP.
6. summary: 1-2 sentence overview of the role.

Return ONLY a JSON object:
{
  "companyName": "string or null",
  "jobTitle": "string or null",
  "location": "string or null",
  "locationType": "REMOTE" | "HYBRID" | "ONSITE",
  "employmentType": "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
  "postedDate": "YYYY-MM-DD or null",
  "summary": "string or null",
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
  let rawHtml = "";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) rawHtml = await res.text();
  } catch (err) {
    console.warn("HTML fetch failed for URL:", url, err);
  }

  const meta = parseHtmlMetadata(rawHtml);
  const fallback = inferFallback(url, meta);
  const llmData = rawHtml
    ? await extractJobWithLlm(meta, url, fallback.company, userConfig)
    : null;

  const validLocTypes = ["REMOTE", "HYBRID", "ONSITE"] as const;
  const validEmpTypes = [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "INTERNSHIP",
  ] as const;

  const companyName = capitalizeCompanyName(
    llmData?.companyName || fallback.company
  );
  const jobTitle = llmData?.jobTitle?.trim() || fallback.role;
  const location = llmData?.location?.trim() || fallback.location || null;
  const locationType =
    llmData?.locationType && validLocTypes.includes(llmData.locationType)
      ? llmData.locationType
      : location?.toLowerCase().includes("remote")
        ? "REMOTE"
        : "ONSITE";
  const employmentType =
    llmData?.employmentType && validEmpTypes.includes(llmData.employmentType)
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
    jobDescription: llmData?.summary || meta.ogDescription || "",
    jobUrl: url,
  };
}
