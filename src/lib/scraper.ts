import * as cheerio from "cheerio";
import { parseJsonLd } from "./jsonld-extractor";
import { enrichJobWithLlm } from "./llm-scraper";

export interface ScrapedJobData {
  jobTitle: string;
  companyName: string;
  location?: string | null;
  locationType?: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  postedDate?: string | null;
  jobDescription?: string;
  jobUrl: string;
}

function cleanText(text?: string | null): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

const US_CA_STATE_CODES =
  "(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC|PR|VI|GU|AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)";

function extractLocationFromText(text: string): string | null {
  const stateRegex = new RegExp(
    `\\b([A-Z][a-zA-Z\\s.-]+,\\s*${US_CA_STATE_CODES}\\b(?:\\s*,\\s*(?:United States|USA|US))?)`
  );
  const cityState = text.match(stateRegex);
  if (cityState && cityState[1].length < 40) return cityState[1].trim();

  const cityCountry = text.match(
    /\b([A-Z][a-zA-Z\s.-]+,\s*(?:United States|United Kingdom|UK|Canada|India|Germany|Australia|Singapore|Ireland|Netherlands|France|Japan|Poland|Spain|Switzerland))\b/i
  );
  if (cityCountry && cityCountry[1].length < 50) return cityCountry[1].trim();

  if (/\b(remote|work from home|telecommute|virtual)\b/i.test(text)) {
    return "Remote";
  }

  return null;
}

function extractCompanyAndTitle(
  rawTitle: string,
  rawSiteName: string,
  domain: string
): { company: string; title: string; location?: string } {
  let title = rawTitle;
  let company = rawSiteName;
  let detectedLocation: string | undefined;

  const separators = [" at ", " - ", " – ", " — ", " | ", " : "];
  for (const sep of separators) {
    if (rawTitle.includes(sep)) {
      const parts = rawTitle.split(sep).map((p) => cleanText(p));
      if (parts.length >= 2) {
        title = parts[0];
        for (let i = 1; i < parts.length; i++) {
          const loc = extractLocationFromText(parts[i]);
          if (loc && !detectedLocation) {
            detectedLocation = loc;
            continue;
          }
          if (
            !company ||
            company.toLowerCase().includes("careers") ||
            company.toLowerCase().includes("job")
          ) {
            company = parts[i];
          }
        }
        break;
      }
    }
  }

  if (!company) {
    const cleanDomain = domain.replace(/^www\./, "").split(".")[0];
    company = cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
  }

  return { company, title, location: detectedLocation };
}

export async function scrapeJobUrl(url: string): Promise<ScrapedJobData> {
  const parsedUrl = new URL(url);
  const host = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
  const segments = parsedUrl.pathname.split("/").filter(Boolean);

  let detectedCompany = "";
  if (
    (host.includes("greenhouse.io") ||
      host.includes("lever.co") ||
      host.includes("ashbyhq.com")) &&
    segments[0]
  ) {
    const candidate = segments[0].toLowerCase();
    if (!["jobs", "job", "view", "apply"].includes(candidate)) {
      detectedCompany = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  if (!detectedCompany) {
    if (host.includes("microsoft.")) detectedCompany = "Microsoft";
    else if (host.includes("google.")) detectedCompany = "Google";
    else if (host.includes("stripe.")) detectedCompany = "Stripe";
    else if (host.includes("amazon.")) detectedCompany = "Amazon";
    else if (host.includes("meta.") || host.includes("facebook."))
      detectedCompany = "Meta";
    else if (host.includes("apple.")) detectedCompany = "Apple";
    else if (host.includes("netflix.")) detectedCompany = "Netflix";
    else {
      const mainPart = host.split(".")[0];
      detectedCompany = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);
    }
  }

  const nonIdSegments = segments.filter(
    (s) =>
      !/^[0-9a-f-]{5,}$/i.test(s) &&
      !/^\d+$/.test(s) &&
      ![
        "d",
        "jobs",
        "view",
        "job",
        "careers",
        "position",
        "apply",
        "spreadsheets",
        "document",
      ].includes(s.toLowerCase())
  );
  const rawRole = nonIdSegments[nonIdSegments.length - 1] || "";
  const inferredRole =
    rawRole.length > 2 && !/^\d+$/.test(rawRole)
      ? rawRole
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim()
      : "Software Engineer";

  let result: ScrapedJobData = {
    jobTitle: inferredRole || "Software Engineer",
    companyName: detectedCompany || "Company",
    jobDescription: "",
    jobUrl: url,
    location: "Unspecified",
    locationType: "ONSITE",
    employmentType: "FULL_TIME",
    salaryMin: null,
    salaryMax: null,
    currency: "USD",
    postedDate: null,
  };

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);

      const jsonLdData = parseJsonLd($);
      if (jsonLdData) {
        if (jsonLdData.title) result.jobTitle = jsonLdData.title;
        if (jsonLdData.company) result.companyName = jsonLdData.company;
        if (jsonLdData.location) result.location = jsonLdData.location;
        if (jsonLdData.locationType)
          result.locationType = jsonLdData.locationType;
        if (jsonLdData.employmentType)
          result.employmentType = jsonLdData.employmentType;
        if (jsonLdData.postedDate) result.postedDate = jsonLdData.postedDate;
        if (jsonLdData.description)
          result.jobDescription = jsonLdData.description;
      }

      const ogTitle = $('meta[property="og:title"]').attr("content");
      const metaTitle = $("title").text();
      const rawTitle = cleanText(ogTitle || metaTitle);
      const ogSiteName = $('meta[property="og:site_name"]').attr("content");
      const {
        company,
        title,
        location: titleLocation,
      } = extractCompanyAndTitle(
        rawTitle,
        cleanText(ogSiteName),
        parsedUrl.hostname
      );

      if (!jsonLdData?.title && title) result.jobTitle = title;
      if (!jsonLdData?.company && company) result.companyName = company;

      const metaLocation =
        $('meta[name="job_location"]').attr("content") ||
        $('meta[name="location"]').attr("content") ||
        $('meta[property="og:locality"]').attr("content") ||
        $('meta[name="geo.placename"]').attr("content");

      let domLocation = cleanText(
        $(
          '.location, .job-location, [itemprop="jobLocation"], [data-qa="job-location"], [data-qa*="location"], [aria-label*="location"]'
        )
          .first()
          .text()
      );

      if (!domLocation) {
        const placeIcon = $('i:contains("place")').first();
        if (placeIcon.length > 0) {
          const sibling = cleanText(placeIcon.next("span").text());
          if (sibling) {
            domLocation = sibling;
          } else {
            const parentText = cleanText(placeIcon.parent().text()).replace(
              /^place\s*/i,
              ""
            );
            if (parentText) domLocation = parentText;
          }
        }
      }

      const resolvedLoc = cleanText(
        jsonLdData?.location ||
          metaLocation ||
          domLocation ||
          titleLocation ||
          extractLocationFromText(rawTitle)
      );

      if (resolvedLoc) {
        result.location = resolvedLoc;
        const lowerLoc = resolvedLoc.toLowerCase();
        if (lowerLoc.includes("hybrid")) {
          result.locationType = "HYBRID";
        } else if (
          lowerLoc.includes("remote") ||
          lowerLoc.includes("virtual")
        ) {
          result.locationType = "REMOTE";
        } else {
          result.locationType = "ONSITE";
        }
      }

      if (result.companyName) {
        result.companyName = result.companyName
          .replace(/\s+(Careers|Jobs|Hiring)\b/i, "")
          .trim();
      }

      if (!result.jobDescription) {
        const ogDescription =
          $('meta[property="og:description"]').attr("content") ||
          $('meta[name="description"]').attr("content");
        if (ogDescription) {
          result.jobDescription = cleanText(ogDescription).slice(0, 2000);
        }
      }

      result = await enrichJobWithLlm(html, url, result);
    }
  } catch (err) {
    console.warn("Direct HTML scrape fallback used:", err);
  }

  return result;
}
