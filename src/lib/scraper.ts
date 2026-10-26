import * as cheerio from "cheerio";

export interface ScrapedJobData {
  jobTitle: string;
  companyName: string;
  location?: string | null;
  locationType?: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  jobDescription?: string;
  jobUrl: string;
}

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
    if (host.includes("google.")) detectedCompany = "Google";
    else if (host.includes("stripe.")) detectedCompany = "Stripe";
    else if (host.includes("microsoft.")) detectedCompany = "Microsoft";
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
    location: "Remote",
    locationType: "REMOTE",
    employmentType: "FULL_TIME",
    salaryMin: null,
    salaryMax: null,
    currency: "USD",
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
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);

      const ogTitle = $('meta[property="og:title"]').attr("content");
      const metaTitle = $("title").text();
      const rawTitle = cleanText(ogTitle || metaTitle);

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

      const fullText = (rawTitle + " " + jobDescription).toLowerCase();
      let locationType: "REMOTE" | "HYBRID" | "ONSITE" = "REMOTE";
      if (fullText.includes("hybrid")) locationType = "HYBRID";
      else if (fullText.includes("on-site") || fullText.includes("onsite"))
        locationType = "ONSITE";

      result = {
        ...result,
        jobTitle: title || result.jobTitle,
        companyName: company || result.companyName,
        jobDescription: jobDescription.slice(0, 2000),
        locationType,
      };
    }
  } catch (err) {
    console.warn("Direct HTML scrape fallback used:", err);
  }

  return result;
}
