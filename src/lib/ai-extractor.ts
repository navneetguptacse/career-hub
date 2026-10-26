export interface ExtractedJobData {
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

const EXTRACTION_PROMPT = `You are a precision job posting parser. Extract structured details from the provided webpage text or job description into a raw JSON object.
Return ONLY valid JSON matching this schema with no markdown formatting:
{
  "jobTitle": "Exact role title (e.g. Senior Backend Engineer)",
  "companyName": "Company name (e.g. Stripe)",
  "location": "City, State or Country or 'Remote'",
  "locationType": "REMOTE" | "HYBRID" | "ONSITE",
  "employmentType": "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
  "salaryMin": number or null,
  "salaryMax": number or null,
  "currency": "USD" | "EUR" | "GBP" | "CAD" | "INR" | "AUD",
  "jobDescription": "Concise 2-4 sentence summary of role and responsibilities"
}`;

function parseJsonFromText(rawText: string): Partial<ExtractedJobData> | null {
  try {
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function extractWithGemini(
  content: string,
  apiKey: string
): Promise<Partial<ExtractedJobData> | null> {
  const models = [
    process.env.GEMINI_MODEL,
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-flash-latest",
  ].filter(Boolean) as string[];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${EXTRACTION_PROMPT}\n\nWebpage text:\n${content.slice(0, 8000)}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = parseJsonFromText(rawText);
        if (parsed?.jobTitle || parsed?.companyName) return parsed;
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function extractWithOpenAI(
  content: string,
  apiKey: string,
  baseUrl = "https://api.openai.com/v1",
  model = "gpt-4o-mini"
): Promise<Partial<ExtractedJobData> | null> {
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: EXTRACTION_PROMPT },
          {
            role: "user",
            content: `Webpage text:\n${content.slice(0, 8000)}`,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    return raw ? parseJsonFromText(raw) : null;
  } catch {
    return null;
  }
}

async function extractWithAnthropic(
  content: string,
  apiKey: string,
  model = "claude-3-5-haiku-20241022"
): Promise<Partial<ExtractedJobData> | null> {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `${EXTRACTION_PROMPT}\n\nWebpage text:\n${content.slice(0, 8000)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.content?.[0]?.text;
    return raw ? parseJsonFromText(raw) : null;
  } catch {
    return null;
  }
}

export async function extractJobDetailsWithAI(
  pageText: string,
  fallback: ExtractedJobData
): Promise<ExtractedJobData> {
  let aiData: Partial<ExtractedJobData> | null = null;

  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const customKey = process.env.CUSTOM_AI_API_KEY || process.env.AI_API_KEY;
  const customBaseUrl =
    process.env.CUSTOM_AI_BASE_URL || process.env.AI_BASE_URL;

  if (geminiKey) {
    aiData = await extractWithGemini(pageText, geminiKey);
  }

  if (!aiData && openaiKey) {
    aiData = await extractWithOpenAI(
      pageText,
      openaiKey,
      process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      process.env.OPENAI_MODEL || "gpt-4o-mini"
    );
  }

  if (!aiData && anthropicKey) {
    aiData = await extractWithAnthropic(
      pageText,
      anthropicKey,
      process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022"
    );
  }

  if (!aiData && customKey && customBaseUrl) {
    aiData = await extractWithOpenAI(
      pageText,
      customKey,
      customBaseUrl,
      process.env.CUSTOM_AI_MODEL || "llama-3.1-8b-instant"
    );
  }

  if (!aiData) return fallback;

  return {
    jobUrl: fallback.jobUrl,
    jobTitle: aiData.jobTitle?.trim() || fallback.jobTitle,
    companyName: aiData.companyName?.trim() || fallback.companyName,
    location: aiData.location?.trim() || fallback.location || null,
    locationType:
      aiData.locationType === "REMOTE" ||
      aiData.locationType === "HYBRID" ||
      aiData.locationType === "ONSITE"
        ? aiData.locationType
        : fallback.locationType,
    employmentType:
      aiData.employmentType === "FULL_TIME" ||
      aiData.employmentType === "PART_TIME" ||
      aiData.employmentType === "CONTRACT" ||
      aiData.employmentType === "INTERNSHIP"
        ? aiData.employmentType
        : fallback.employmentType,
    salaryMin:
      typeof aiData.salaryMin === "number"
        ? aiData.salaryMin
        : (fallback.salaryMin ?? null),
    salaryMax:
      typeof aiData.salaryMax === "number"
        ? aiData.salaryMax
        : (fallback.salaryMax ?? null),
    currency:
      aiData.currency?.trim().toUpperCase() || fallback.currency || "USD",
    jobDescription:
      aiData.jobDescription?.trim() || fallback.jobDescription || "",
  };
}
