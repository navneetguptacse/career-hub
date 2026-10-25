import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const [userCount, appCount, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.jobApplication.count(),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          telegramChatId: true,
          createdAt: true,
          _count: {
            select: { applications: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers: userCount,
        totalApplications: appCount,
      },
      recentUsers,
    });
  } catch (error) {
    console.error("GET /api/admin/overview error:", error);
    return NextResponse.json(
      { error: "Failed to load admin stats" },
      { status: 500 }
    );
  }
}
