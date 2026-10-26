import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().trim().max(100).optional().nullable(),
  targetRole: z.string().trim().max(100).optional().nullable(),
  bio: z.string().trim().max(1000).optional().nullable(),
  preferredCurrency: z.string().trim().max(10).default("USD"),
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
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        targetRole: true,
        bio: true,
        preferredCurrency: true,
        telegramChatId: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        ...user,
        telegramConnected: Boolean(user.telegramChatId),
        totalApplications: user._count.applications,
      },
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, targetRole, bio, preferredCurrency } = parsed.data;

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name ?? null,
        targetRole: targetRole ?? null,
        bio: bio ?? null,
        preferredCurrency: preferredCurrency || "USD",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        targetRole: true,
        bio: true,
        preferredCurrency: true,
        telegramChatId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updated,
        telegramConnected: Boolean(updated.telegramChatId),
      },
    });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
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
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Account and all associated records permanently deleted.",
    });
  } catch (error) {
    console.error("Failed to delete user account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
