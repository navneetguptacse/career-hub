export interface UserLlmConfig {
  provider?: "GEMINI" | "OPENAI" | "ANTHROPIC" | "CUSTOM";
  apiKey?: string | null;
  endpoint?: string | null;
  model?: string | null;
}

export async function executeLlmCall(
  prompt: string,
  userConfig?: UserLlmConfig
): Promise<string | null> {
  const provider = userConfig?.provider || "GEMINI";

  if (provider === "GEMINI") {
    const key = userConfig?.apiKey || process.env.GEMINI_API_KEY;
    if (!key) return null;
    const model =
      userConfig?.model ||
      process.env.GEMINI_MODEL ||
      "gemini-flash-lite-latest";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
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
      if (res.ok) {
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (provider === "OPENAI") {
    const key = userConfig?.apiKey || process.env.OPENAI_API_KEY;
    if (!key) return null;
    const model =
      userConfig?.model || process.env.OPENAI_MODEL || "gpt-4o-mini";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        return data?.choices?.[0]?.message?.content || null;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (provider === "ANTHROPIC") {
    const key = userConfig?.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
    const model =
      userConfig?.model ||
      process.env.ANTHROPIC_MODEL ||
      "claude-3-5-haiku-20241022";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        return data?.content?.[0]?.text || null;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (provider === "CUSTOM") {
    const key = userConfig?.apiKey || process.env.CUSTOM_AI_API_KEY || "";
    const endpoint = (
      userConfig?.endpoint ||
      process.env.CUSTOM_AI_BASE_URL ||
      "https://api.groq.com/openai/v1"
    ).replace(/\/+$/, "");
    const model =
      userConfig?.model ||
      process.env.CUSTOM_AI_MODEL ||
      "llama-3.3-70b-versatile";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { Authorization: `Bearer ${key}` } : {}),
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        return data?.choices?.[0]?.message?.content || null;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return null;
}

export async function testLlmProvider(
  config: UserLlmConfig
): Promise<{ success: boolean; message: string }> {
  const startTime = Date.now();
  const testPrompt = `Respond ONLY with this exact JSON: {"status": "connected", "provider": "${config.provider || "GEMINI"}"}`;

  try {
    const rawResult = await executeLlmCall(testPrompt, config);
    if (!rawResult) {
      return {
        success: false,
        message:
          "Failed to connect to provider. Please verify API key, model, or base URL.",
      };
    }

    const latency = Date.now() - startTime;
    return {
      success: true,
      message: `Connection successful! Verified response in ${latency}ms.`,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Provider request failed",
    };
  }
}
