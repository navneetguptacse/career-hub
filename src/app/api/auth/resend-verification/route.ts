import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await auth();
    let email: string | null = session?.user?.email || null;

    if (!email) {
      try {
        const body = await req.json();
        if (body?.email && typeof body.email === "string") {
          email = body.email.trim().toLowerCase();
        }
      } catch {
        // Request had no parseable JSON body
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user) {
      // Return 200 with generic message to avoid email enumeration
      return NextResponse.json({
        message:
          "If an account exists with this email, a verification link has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: "This email address is already verified.",
        alreadyVerified: true,
      });
    }

    const token = await generateVerificationToken(user.email);
    const emailResult = await sendVerificationEmail(user.email, token);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: emailResult.message || "Verification email sent successfully.",
      devNotice: emailResult.devNotice,
      devUrl:
        process.env.NODE_ENV !== "production" ? emailResult.devUrl : undefined,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}
