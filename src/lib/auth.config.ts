import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
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
        session.user.id = token.id as string;
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
