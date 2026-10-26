import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobApplicationSchema } from "@/lib/validations";
import { capitalizeCompanyName } from "@/lib/scraper";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const whereClause: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { jobTitle: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    const applications = await prisma.jobApplication.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = jobApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const application = await prisma.jobApplication.create({
      data: {
        userId: session.user.id,
        companyName: capitalizeCompanyName(data.companyName),
        jobTitle: data.jobTitle,
        location: data.location || null,
        locationType: data.locationType,
        employmentType: data.employmentType,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
        currency: data.currency,
        jobUrl: data.jobUrl || null,
        jobDescription: data.jobDescription || null,
        source: data.source,
        status: data.status,
        appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        notes: data.notes || null,
        activities: {
          create: {
            userId: session.user.id,
            type: "CREATED",
            title: "Application Created",
            description: `Saved as ${data.status} via ${data.source}`,
          },
        },
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
