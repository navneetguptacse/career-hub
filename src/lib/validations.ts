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
  jobUrl: z.string().url("Please provide a valid URL").optional().or(z.literal("")),
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

export const updateStatusSchema = z.object({
  status: z.enum([
    "WISHLIST",
    "APPLIED",
    "SCREENING",
    "INTERVIEW",
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
  ]),
  note: z.string().optional(),
});

export const scrapeUrlSchema = z.object({
  url: z.string().url("Please provide a valid URL"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
