import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptApiKey } from "@/lib/encryption";
import type { UserLlmConfig } from "@/lib/llm-provider";
import { generateOrRefinePitch } from "@/lib/pitch";
import { linkedinPitchSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = linkedinPitchSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message;
      return NextResponse.json(
        { error: firstIssue || "Invalid pitch request" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        targetRole: true,
        bio: true,
        llmProvider: true,
        llmApiKeyHash: true,
        llmEndpoint: true,
        llmModel: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let userConfig: UserLlmConfig | undefined = undefined;
    if (user.llmProvider) {
      userConfig = {
        provider: user.llmProvider as UserLlmConfig["provider"],
        apiKey: decryptApiKey(user.llmApiKeyHash),
        endpoint: user.llmEndpoint,
        model: user.llmModel,
      };
    }

    const pitch = await generateOrRefinePitch(
      {
        ...parsed.data,
        senderName: user.name,
        senderRole: user.targetRole,
        senderBio: user.bio,
      },
      userConfig
    );

    if (!pitch) {
      return NextResponse.json(
        {
          error:
            "AI provider could not generate a pitch. Please verify your LLM configuration in Settings.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ pitch });
  } catch (error) {
    console.error("POST /api/pitch error:", error);
    return NextResponse.json(
      { error: "Failed to generate LinkedIn pitch" },
      { status: 500 }
    );
  }
}
