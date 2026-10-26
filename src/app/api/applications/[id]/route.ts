import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobApplicationSchema } from "@/lib/validations";
import { capitalizeCompanyName } from "@/lib/scraper";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    const application = await prisma.jobApplication.findFirst({
      where: { id, userId: session.user.id },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("GET /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await req.json();

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const partialSchema = jobApplicationSchema.partial();
    const parsed = partialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const isStatusChanged = data.status && data.status !== existing.status;

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        ...(data.companyName && {
          companyName: capitalizeCompanyName(data.companyName),
        }),
        ...(data.jobTitle && { jobTitle: data.jobTitle }),
        ...(data.location !== undefined && { location: data.location || null }),
        ...(data.locationType && { locationType: data.locationType }),
        ...(data.employmentType && { employmentType: data.employmentType }),
        ...(data.salaryMin !== undefined && {
          salaryMin: data.salaryMin ? Number(data.salaryMin) : null,
        }),
        ...(data.salaryMax !== undefined && {
          salaryMax: data.salaryMax ? Number(data.salaryMax) : null,
        }),
        ...(data.currency && { currency: data.currency }),
        ...(data.jobUrl !== undefined && { jobUrl: data.jobUrl || null }),
        ...(data.jobDescription !== undefined && {
          jobDescription: data.jobDescription || null,
        }),
        ...(data.status && { status: data.status }),
        ...(data.appliedDate !== undefined && {
          appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
        }),
        ...(data.deadline !== undefined && {
          deadline: data.deadline ? new Date(data.deadline) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(isStatusChanged && {
          activities: {
            create: {
              userId: session.user.id,
              type: "STATUS_CHANGE",
              title: `Status changed to ${data.status}`,
              description: `Moved from ${existing.status} to ${data.status}`,
            },
          },
        }),
      },
    });

    return NextResponse.json({ application: updated });
  } catch (error) {
    console.error("PATCH /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    const existing = await prisma.jobApplication.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    await prisma.jobApplication.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
