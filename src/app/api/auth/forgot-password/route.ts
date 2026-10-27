import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const token = await generatePasswordResetToken(email);

    if (token) {
      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({
      message:
        "If an account with that email address exists, a password reset link has been dispatched.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
