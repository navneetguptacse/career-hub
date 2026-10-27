import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function generateVerificationToken(
  email: string
): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS);

  // Remove any pre-existing verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyEmailToken(
  token: string
): Promise<{ success: boolean; error?: string; email?: string }> {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!tokenRecord || tokenRecord.identifier.startsWith("reset:")) {
    return { success: false, error: "Invalid or expired verification token" };
  }

  if (new Date() > tokenRecord.expires) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return {
      success: false,
      error: "Verification token has expired. Please request a new one.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: tokenRecord.identifier },
  });

  if (!user) {
    return { success: false, error: "User account not found" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);

  return { success: true, email: user.email };
}

export async function generatePasswordResetToken(
  email: string
): Promise<string | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return null;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
  const identifier = `reset:${normalizedEmail}`;

  // Delete prior reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return token;
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!tokenRecord || !tokenRecord.identifier.startsWith("reset:")) {
    return { success: false, error: "Invalid or expired password reset token" };
  }

  if (new Date() > tokenRecord.expires) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return {
      success: false,
      error: "Password reset token has expired. Please request a new one.",
    };
  }

  const email = tokenRecord.identifier.replace("reset:", "");
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      error: "Account associated with this token does not exist",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerified: user.emailVerified || new Date(),
      },
    }),
    prisma.verificationToken.delete({
      where: { token },
    }),
  ]);

  return { success: true };
}
