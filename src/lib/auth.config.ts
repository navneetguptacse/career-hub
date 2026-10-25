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
      }

      if (trigger === "update" && session) {
        token.telegramConnected = session.user?.telegramConnected;
      }

      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") || "USER";
        session.user.telegramConnected = Boolean(token.telegramConnected);
      }
      return session;
    },
  },
};
