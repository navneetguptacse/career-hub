import { executeLlmCall, type UserLlmConfig } from "@/lib/llm-provider";
import type { PitchTone } from "@/lib/validations";

export interface PitchGenerationInput {
  mode: "generate" | "refine";
  companyName?: string;
  jobTitle?: string;
  recipientName?: string;
  tone: PitchTone;
  draftPitch?: string;
  jobDescription?: string | null;
  jobUrl?: string | null;
  notes?: string | null;
  senderName?: string | null;
  senderRole?: string | null;
  senderBio?: string | null;
}

const TONE_GUIDANCE: Record<PitchTone, string> = {
  Formal:
    "Polished, respectful, and professional outreach suitable for recruiters and hiring managers.",
  Friendly:
    "Warm, personable, and conversational while still focused and respectful.",
  Confident:
    "Direct, impact-oriented, and self-assured, highlighting readiness and value.",
  Concise:
    "Ultra-brief (under 280 characters) so it fits inside a LinkedIn connection request note.",
  Referral:
    "Gracious outreach asking for quick perspective or referral consideration for the applied role.",
};

function extractPitchFromResponse(raw: string): string | null {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as { pitch?: unknown };
    if (typeof parsed.pitch === "string" && parsed.pitch.trim()) {
      return parsed.pitch.trim();
    }
  } catch {
    // Fall back to plain text if provider ignored JSON formatting
  }

  if (cleaned && !cleaned.startsWith("{")) {
    return cleaned;
  }

  return null;
}

function buildPitchPrompt(input: PitchGenerationInput): string {
  const recipient = input.recipientName?.trim() || "";
  const company = input.companyName?.trim() || "the company";
  const role = input.jobTitle?.trim() || "the open role";
  const senderName = input.senderName?.trim() || "";
  const senderRole = input.senderRole?.trim() || "";
  const senderBio = input.senderBio?.trim() || "";
  const jdSnippet = input.jobDescription?.trim().slice(0, 1200) || "";
  const notesSnippet = input.notes?.trim().slice(0, 400) || "";

  const contextLines = [
    `Company: ${company}`,
    `Role Applied For: ${role}`,
    recipient
      ? `Recipient Name/Title: ${recipient}`
      : "Recipient: Not specified (use a natural neutral greeting like 'Hi there,' or 'Hello,')",
    `Requested Tone: ${input.tone} (${TONE_GUIDANCE[input.tone]})`,
    senderName ? `Candidate Name: ${senderName}` : null,
    senderRole ? `Candidate Target Role: ${senderRole}` : null,
    senderBio ? `Candidate Background: ${senderBio}` : null,
    jdSnippet ? `Job Description Excerpt:\n${jdSnippet}` : null,
    notesSnippet ? `User Notes:\n${notesSnippet}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  if (input.mode === "refine" && input.draftPitch?.trim()) {
    return [
      "You are an expert career coach helping a job applicant refine their LinkedIn outreach message after applying to a job.",
      "Rewrite and polish the user's draft pitch below while preserving their core intent and facts.",
      "Apply the requested tone strictly, address the recipient naturally if provided, fix grammar/flow, and keep it concise and ready to send on LinkedIn (no placeholders unless clearly missing, no emojis, no subject line).",
      "",
      "Context:",
      contextLines,
      "",
      "User's Draft Pitch:",
      input.draftPitch.trim(),
      "",
      'Respond ONLY with valid JSON matching: {"pitch": "<refined message>"}',
    ].join("\n");
  }

  return [
    "You are an expert career coach writing a tailored LinkedIn outreach message for an applicant who just applied for a role and wants to ping a recruiter, hiring manager, or team member at the company.",
    "Write a natural, authentic message ready to paste into LinkedIn (no emojis, no subject line, no generic buzzword fluff).",
    input.tone === "Concise"
      ? "Strictly keep the entire message under 280 characters so it fits a LinkedIn connection note."
      : "Keep the message focused and scannable (roughly 55-110 words across 2-3 short paragraphs).",
    recipient
      ? `Start with a greeting addressing "${recipient}" directly.`
      : "Start with a clean general greeting.",
    senderName
      ? `Sign off naturally using "${senderName}".`
      : "End with a polite sign-off without inventing a fake name.",
    "",
    "Context:",
    contextLines,
    "",
    'Respond ONLY with valid JSON matching: {"pitch": "<generated message>"}',
  ].join("\n");
}

export async function generateOrRefinePitch(
  input: PitchGenerationInput,
  userConfig?: UserLlmConfig
): Promise<string | null> {
  const prompt = buildPitchPrompt(input);
  const raw = await executeLlmCall(prompt, userConfig);
  if (!raw) return null;
  return extractPitchFromResponse(raw);
}

/**
 * Updates an existing salutation line in-place when the recipient name changes,
 * leaving custom messages untouched if they do not begin with a greeting.
 */
export function syncPitchGreeting(
  pitch: string,
  recipientName: string
): string {
  if (!pitch.trim()) return pitch;
  const trimmedName = recipientName.trim();
  const greetingMatch = pitch.match(/^(Hi|Hello|Dear|Hey)\s+([^,\n!]+)(,|!)/i);
  if (!greetingMatch) return pitch;

  const salutationWord = greetingMatch[1];
  const punctuation = greetingMatch[3];
  const nextTarget = trimmedName || "there";
  return pitch.replace(
    /^(Hi|Hello|Dear|Hey)\s+([^,\n!]+)(,|!)/i,
    `${salutationWord} ${nextTarget}${punctuation}`
  );
}
