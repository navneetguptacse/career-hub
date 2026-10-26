import * as cheerio from "cheerio";

export interface JsonLdJobData {
  title?: string;
  company?: string;
  location?: string;
  locationType?: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  postedDate?: string;
  description?: string;
}

function cleanText(text?: string | null): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

export function parseJsonLd($: cheerio.CheerioAPI): JsonLdJobData | null {
  let matchedJob: Record<string, unknown> | null = null;

  $('script[type="application/ld+json"]').each((_, el) => {
    if (matchedJob) return;
    try {
      const raw = $(el).html();
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed)
        ? parsed
        : parsed["@graph"] && Array.isArray(parsed["@graph"])
          ? parsed["@graph"]
          : [parsed];

      for (const item of items) {
        if (
          item &&
          (item["@type"] === "JobPosting" ||
            (Array.isArray(item["@type"]) &&
              item["@type"].includes("JobPosting")))
        ) {
          matchedJob = item as Record<string, unknown>;
          break;
        }
      }
    } catch {
      // Continue searching next script
    }
  });

  if (!matchedJob) return null;

  const job = matchedJob as Record<string, unknown>;
  const title =
    typeof job.title === "string" ? cleanText(job.title) : undefined;
  const hiringOrg = job.hiringOrganization as
    Record<string, unknown> | undefined;
  let company =
    typeof hiringOrg?.name === "string" ? cleanText(hiringOrg.name) : undefined;
  if (company) {
    company = company.replace(/\s+(Careers|Jobs|Hiring)\b/i, "").trim();
  }

  let locationStr = "";
  const jobLoc = job.jobLocation;
  if (jobLoc) {
    const locList = Array.isArray(jobLoc) ? jobLoc : [jobLoc];
    for (const loc of locList) {
      if (loc && typeof loc === "object") {
        const addr = (loc as Record<string, unknown>).address as
          Record<string, unknown> | undefined;
        if (addr) {
          const locality = cleanText(
            (addr.addressLocality as string) || (addr.city as string)
          );
          let region = cleanText(
            (addr.addressRegion as string) || (addr.state as string)
          );
          let country = cleanText(
            typeof addr.addressCountry === "object" &&
              addr.addressCountry !== null
              ? ((addr.addressCountry as Record<string, unknown>)
                  .name as string)
              : (addr.addressCountry as string)
          );

          if (region.includes(",")) {
            const regParts = region.split(",").map((p) => p.trim());
            region = regParts[0];
            if (!country && regParts[1]) country = regParts[1];
          }
          if (country && region.toUpperCase() === country.toUpperCase()) {
            country = "";
          }

          const parts = [locality, region, country].filter(Boolean);
          if (parts.length > 0) {
            locationStr = parts.join(", ");
            break;
          }
        }
        if (typeof (loc as Record<string, unknown>).name === "string") {
          locationStr = cleanText(
            (loc as Record<string, unknown>).name as string
          );
          break;
        }
      } else if (typeof loc === "string" && loc.trim()) {
        locationStr = cleanText(loc);
        break;
      }
    }
  }

  const applicantReqs = job.applicantLocationRequirements as
    Record<string, unknown> | undefined;
  if (!locationStr && typeof applicantReqs?.name === "string") {
    locationStr = cleanText(applicantReqs.name);
  }

  const locTypeRaw = String(job.jobLocationType || "").toUpperCase();
  const descRaw = String(job.description || "").toLowerCase();
  const titleRaw = String(title || "").toLowerCase();
  const locLower = locationStr.toLowerCase();

  let locationType: "REMOTE" | "HYBRID" | "ONSITE" = "ONSITE";
  if (
    locLower.includes("hybrid") ||
    titleRaw.includes("hybrid") ||
    descRaw.includes("hybrid")
  ) {
    locationType = "HYBRID";
  } else if (
    locTypeRaw.includes("TELECOMMUTE") ||
    locLower.includes("remote") ||
    titleRaw.includes("remote") ||
    descRaw.includes("100% remote") ||
    descRaw.includes("fully remote")
  ) {
    locationType = "REMOTE";
  } else if (locationStr) {
    locationType = "ONSITE";
  }

  let employmentType:
    "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | undefined;
  const empStr = String(job.employmentType || "").toUpperCase();
  if (empStr.includes("PART")) employmentType = "PART_TIME";
  else if (empStr.includes("CONTRACT") || empStr.includes("TEMPORARY"))
    employmentType = "CONTRACT";
  else if (empStr.includes("INTERN")) employmentType = "INTERNSHIP";
  else if (empStr.includes("FULL")) employmentType = "FULL_TIME";

  let description = "";
  if (typeof job.description === "string") {
    description = cleanText($("<div/>").html(job.description).text()).slice(
      0,
      2000
    );
  }

  let postedDate: string | undefined;
  if (typeof job.datePosted === "string" && job.datePosted.trim()) {
    postedDate = job.datePosted.trim().slice(0, 10);
  }

  return {
    title,
    company,
    location: locationStr || undefined,
    locationType,
    employmentType,
    postedDate,
    description: description || undefined,
  };
}
