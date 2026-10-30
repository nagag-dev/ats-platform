
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

async function askHiddenPassword(): Promise<string> {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Run this script directly in an interactive Terminal.");
  }

  stdout.write("New admin password (minimum 12 characters): ");
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  return new Promise((resolve, reject) => {
    let password = "";

    const cleanup = () => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(false);
      stdout.write("\n");
    };

    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") {
          cleanup();
          reject(new Error("Password reset cancelled."));
          return;
        }

        if (char === "\r" || char === "\n") {
          cleanup();
          resolve(password);
          return;
        }

        if (char === "\u007f" || char === "\b") {
          password = password.slice(0, -1);
        } else if (char >= " ") {
          password += char;
        }
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
 const rl = createInterface({ input: stdin, output: stdout });
let email: string;

try {
  email = (await rl.question("Existing admin email: "))
    .trim()
    .toLowerCase();
} finally {
  rl.close();
}

    const admin = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      throw new Error("No administrator found for that email. No changes made.");
    }

    const password = await askHiddenPassword();

    if (password.length < 12 || password.length > 72) {
      throw new Error("Password must be between 12 and 72 characters.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    console.log("Administrator password updated successfully.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Password reset failed.");
  process.exitCode = 1;
});
