import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Please log in first." },
      { status: 401 }
    );
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request." },
      { status: 400 }
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return NextResponse.json(
      { error: "Invalid request data." },
      { status: 400 }
    );
  }

  const data = body as Record<string, unknown>;

  const firstName =
    typeof data.firstName === "string" ? data.firstName.trim() : "";

  const middleName =
    typeof data.middleName === "string" ? data.middleName.trim() : "";

  const lastName =
    typeof data.lastName === "string" ? data.lastName.trim() : "";

  const email =
    typeof data.email === "string"
      ? data.email.trim().toLowerCase()
      : "";

  const password =
    typeof data.password === "string" ? data.password : "";

  if (!firstName || firstName.length > 50) {
    return NextResponse.json(
      { error: "First name is required and must be under 50 characters." },
      { status: 400 }
    );
  }

  if (middleName.length > 50) {
    return NextResponse.json(
      { error: "Middle name must be under 50 characters." },
      { status: 400 }
    );
  }

  if (!lastName || lastName.length > 50) {
    return NextResponse.json(
      { error: "Last name is required and must be under 50 characters." },
      { status: 400 }
    );
  }

  const name = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ");

  if (name.length > 100) {
    return NextResponse.json(
      { error: "Combined name must be under 100 characters." },
      { status: 400 }
    );
  }

  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  if (password.length < 12 || password.length > 72) {
    return NextResponse.json(
      { error: "Password must be between 12 and 72 characters." },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        firstName,
        middleName: middleName || null,
        lastName,
        email,
        passwordHash,
        role: "RECRUITER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Recruiter created successfully.", user },
      { status: 201 }
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    console.error("Create user failed:", error);

    return NextResponse.json(
      { error: "Unable to create the user right now." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const recruiters = await prisma.user.findMany({
      where: {
        role: "RECRUITER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ recruiters });
  } catch (error) {
    console.error("Fetch recruiters failed:", error);

    return NextResponse.json(
      { error: "Unable to load recruiters right now." },
      { status: 500 }
    );
  }
}
