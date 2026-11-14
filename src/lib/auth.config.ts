import type { NextAuthConfig } from "next-auth";

if (process.env.NEXTAUTH_URL) {
  const cleaned = process.env.NEXTAUTH_URL.replace(/^["']|["']$/g, "").trim();
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    process.env.NEXTAUTH_URL = cleaned;
  } else {
    delete process.env.NEXTAUTH_URL;
  }
}

if (process.env.AUTH_URL) {
  const cleaned = process.env.AUTH_URL.replace(/^["']|["']$/g, "").trim();
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    process.env.AUTH_URL = cleaned;
  } else {
    delete process.env.AUTH_URL;
  }
}

for (const key of ["DATABASE_URL", "AUTH_SECRET"] as const) {
  if (process.env[key]) {
    process.env[key] = process.env[key]!.replace(/^["']|["']$/g, "").trim();
  }
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "career-hub-auth-secret-fallback-key-32chars",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.telegramConnected = user.telegramConnected;
        token.emailVerified = user.emailVerified;
      }

      if (trigger === "update" && session) {
        if (session.user?.telegramConnected !== undefined) {
          token.telegramConnected = session.user.telegramConnected;
        }
        if (session.user?.emailVerified !== undefined) {
          token.emailVerified = session.user.emailVerified;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as "USER" | "ADMIN") || "USER";
        session.user.telegramConnected = Boolean(token.telegramConnected);
        session.user.emailVerified = token.emailVerified
          ? new Date(token.emailVerified as unknown as string | number | Date)
          : null;
      }
      return session;
    },
  },
};
