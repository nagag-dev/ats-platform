
import type { DefaultSession } from "next-auth";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: "ADMIN" | "RECRUITER";
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "RECRUITER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: "ADMIN" | "RECRUITER";
  }
}
