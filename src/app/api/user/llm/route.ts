import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/encryption";
import { testLlmProvider } from "@/lib/llm-provider";

const llmConfigSchema = z.object({
  provider: z
    .enum(["GEMINI", "OPENAI", "ANTHROPIC", "CUSTOM"])
    .default("GEMINI"),
  apiKey: z.string().trim().optional().nullable(),
  endpoint: z.string().trim().optional().nullable(),
  model: z.string().trim().optional().nullable(),
  testOnly: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        llmProvider: true,
        llmApiKeyHash: true,
        llmEndpoint: true,
        llmModel: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      provider: user.llmProvider || "GEMINI",
      hasKey: Boolean(user.llmApiKeyHash),
      keyHint: maskApiKey(user.llmApiKeyHash),
      endpoint: user.llmEndpoint || "",
      model: user.llmModel || "",
    });
  } catch (error) {
    console.error("GET /api/user/llm error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = llmConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid configuration input",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { provider, apiKey, endpoint, model, testOnly } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { llmApiKeyHash: true },
    });

    const resolvedKey = apiKey?.trim()
      ? apiKey.trim()
      : user?.llmApiKeyHash
        ? decryptApiKey(user.llmApiKeyHash)
        : null;

    if (testOnly) {
      if (!resolvedKey && provider !== "CUSTOM") {
        return NextResponse.json(
          {
            success: false,
            message: "Please provide an API key to test connection.",
          },
          { status: 400 }
        );
      }
      const testResult = await testLlmProvider({
        provider,
        apiKey: resolvedKey,
        endpoint: endpoint ?? undefined,
        model: model ?? undefined,
      });
      return NextResponse.json(testResult);
    }

    let newKeyHash: string | undefined = undefined;
    if (apiKey?.trim()) {
      newKeyHash = encryptApiKey(apiKey.trim());
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        llmProvider: provider,
        ...(newKeyHash !== undefined && { llmApiKeyHash: newKeyHash }),
        llmEndpoint: endpoint ?? null,
        llmModel: model ?? null,
      },
      select: {
        llmProvider: true,
        llmApiKeyHash: true,
        llmEndpoint: true,
        llmModel: true,
      },
    });

    return NextResponse.json({
      success: true,
      provider: updated.llmProvider,
      hasKey: Boolean(updated.llmApiKeyHash),
      keyHint: maskApiKey(updated.llmApiKeyHash),
      endpoint: updated.llmEndpoint || "",
      model: updated.llmModel || "",
      message: "LLM Provider configuration saved successfully.",
    });
  } catch (error) {
    console.error("POST /api/user/llm error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update LLM configuration",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        llmProvider: "GEMINI",
        llmApiKeyHash: null,
        llmEndpoint: null,
        llmModel: null,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Custom provider configuration cleared. Default settings restored.",
    });
  } catch (error) {
    console.error("DELETE /api/user/llm error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to clear LLM configuration",
      },
      { status: 500 }
    );
  }
}
