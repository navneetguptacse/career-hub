import * as cheerio from "cheerio";
import { ScrapedJobData } from "./scraper";

export interface LlmEnrichedJobData {
  companyName?: string;
  jobTitle?: string;
  location?: string;
  locationType?: "REMOTE" | "HYBRID" | "ONSITE";
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  postedDate?: string;
  summary?: string;
}

function cleanHtmlToSnippet(html: string): string {
  try {
    const $ = cheerio.load(html);
    $(
      "script, style, svg, noscript, nav, footer, header, iframe, form, button"
    ).remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();
    return text.slice(0, 4000);
  } catch {
    return "";
  }
}

export async function enrichJobWithLlm(
  html: string,
  url: string,
  baseline: ScrapedJobData
): Promise<ScrapedJobData> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openaiKey) {
    return baseline;
  }

  const snippet = cleanHtmlToSnippet(html);
  if (!snippet || snippet.length < 50) {
    return baseline;
  }

  const prompt = `Analyze this job posting text and extract structured job metadata in pure JSON format:
URL: ${url}
Preliminary Company: ${baseline.companyName}
Preliminary Title: ${baseline.jobTitle}

Job Page Text:
${snippet}

Return ONLY a JSON object with this exact schema:
{
  "companyName": "string or null",
  "jobTitle": "string or null",
  "location": "string (City, State/Region, Country or Remote) or null",
  "locationType": "REMOTE" | "HYBRID" | "ONSITE",
  "employmentType": "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
  "postedDate": "YYYY-MM-DD or null",
  "summary": "1-2 sentence overview or null"
}`;

  try {
    if (geminiKey) {
      const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed: LlmEnrichedJobData = JSON.parse(rawJson);
          return mergeLlmData(baseline, parsed);
        }
      }
    }

    if (openaiKey) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const rawJson = data?.choices?.[0]?.message?.content;
        if (rawJson) {
          const parsed: LlmEnrichedJobData = JSON.parse(rawJson);
          return mergeLlmData(baseline, parsed);
        }
      }
    }
  } catch (err) {
    console.warn("LLM enrichment skipped or timed out, using baseline:", err);
  }

  return baseline;
}

function mergeLlmData(
  baseline: ScrapedJobData,
  llm: LlmEnrichedJobData
): ScrapedJobData {
  const result = { ...baseline };
  if (llm.companyName && llm.companyName.trim()) {
    result.companyName = llm.companyName.trim();
  }
  if (llm.jobTitle && llm.jobTitle.trim()) {
    result.jobTitle = llm.jobTitle.trim();
  }
  if (llm.location && llm.location.trim()) {
    result.location = llm.location.trim();
  }
  if (
    llm.locationType &&
    ["REMOTE", "HYBRID", "ONSITE"].includes(llm.locationType)
  ) {
    result.locationType = llm.locationType;
  }
  if (
    llm.employmentType &&
    ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"].includes(
      llm.employmentType
    )
  ) {
    result.employmentType = llm.employmentType;
  }
  if (llm.postedDate && /^\d{4}-\d{2}-\d{2}/.test(llm.postedDate)) {
    result.postedDate = llm.postedDate;
  }
  if (llm.summary && !result.jobDescription) {
    result.jobDescription = llm.summary;
  }
  return result;
}
