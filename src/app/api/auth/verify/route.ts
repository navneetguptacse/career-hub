import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/tokens";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const baseUrl = req.nextUrl.origin;

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?error=MissingToken`);
  }

  const result = await verifyEmailToken(token);

  if (!result.success) {
    const errorParam = encodeURIComponent(result.error || "VerificationFailed");
    return NextResponse.redirect(`${baseUrl}/login?error=${errorParam}`);
  }

  return NextResponse.redirect(`${baseUrl}/dashboard?verified=true`);
}
