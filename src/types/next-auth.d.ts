import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      telegramConnected: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: "USER" | "ADMIN";
    telegramConnected?: boolean;
    passwordHash?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "USER" | "ADMIN";
    telegramConnected?: boolean;
  }
}
