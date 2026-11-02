import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const jobApplicationSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(100),
  jobTitle: z.string().min(1, "Job title is required").max(100),
  location: z.string().max(100).optional().nullable(),
  locationType: z.enum(["REMOTE", "HYBRID", "ONSITE"]).default("REMOTE"),
  employmentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"])
    .default("FULL_TIME"),
  salaryMin: z.coerce.number().positive().optional().nullable(),
  salaryMax: z.coerce.number().positive().optional().nullable(),
  currency: z.string().default("USD"),
  jobUrl: z
    .string()
    .url("Please provide a valid URL")
    .optional()
    .or(z.literal("")),
  jobDescription: z.string().max(10000).optional().nullable(),
  source: z
    .enum(["MANUAL", "TELEGRAM", "LINK_SCRAPER", "LINKEDIN", "INDEED", "OTHER"])
    .default("MANUAL"),
  status: z
    .enum([
      "WISHLIST",
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "OFFER",
      "REJECTED",
      "WITHDRAWN",
    ])
    .default("WISHLIST"),
  appliedDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const scrapeUrlSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
});

export function isValidJobUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    );
    return Boolean(
      parsed.hostname &&
      parsed.hostname.includes(".") &&
      parsed.hostname.length > 3
    );
  } catch {
    return false;
  }
}

export function normalizeJobUrl(input?: string | null): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (!trimmed) return "";

  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  try {
    const url = new URL(candidate);
    let host = url.hostname.toLowerCase();
    if (host.startsWith("www.")) {
      host = host.slice(4);
    }

    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.replace(/\/+$/, "");
    }

    const cleanParams = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        !lowerKey.startsWith("utm_") &&
        lowerKey !== "ref" &&
        lowerKey !== "source" &&
        lowerKey !== "fbclid" &&
        lowerKey !== "gclid" &&
        lowerKey !== "trk"
      ) {
        cleanParams.append(key, value);
      }
    });

    const queryString = cleanParams.toString();
    return `https://${host}${pathname}${queryString ? `?${queryString}` : ""}`;
  } catch {
    return trimmed;
  }
}
