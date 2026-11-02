import { randomBytes } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 },
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 },
      );
    }

    const searchParams = new URL(request.url).searchParams;
    const query = (searchParams.get("q") ?? "").trim().slice(0, 100);

    const vendors = await prisma.vendorProfile.findMany({
      where: query
        ? {
            OR: [
              { companyName: { contains: query, mode: "insensitive" } },
              { contactName: { contains: query, mode: "insensitive" } },
              {
                user: {
                  is: {
                    email: { contains: query, mode: "insensitive" },
                  },
                },
              },
            ],
          }
        : {},
      select: {
        id: true,
        companyName: true,
        contactName: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: { companyName: "asc" },
    });

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Fetch vendors failed:", error);

    return NextResponse.json(
      { error: "Unable to load vendors right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 },
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "Invalid request data." },
        { status: 400 },
      );
    }

    const data = body as Record<string, unknown>;

    const companyName =
      typeof data.companyName === "string"
        ? data.companyName.trim()
        : "";

    const contactName =
      typeof data.contactName === "string"
        ? data.contactName.trim()
        : "";

    const email =
      typeof data.email === "string"
        ? data.email.trim().toLowerCase()
        : "";

    const phone =
      typeof data.phone === "string"
        ? data.phone.trim()
        : "";

    if (!companyName || companyName.length > 150) {
      return NextResponse.json(
        { error: "Company name is required and must be under 150 characters." },
        { status: 400 },
      );
    }

    if (!contactName || contactName.length > 100) {
      return NextResponse.json(
        { error: "Contact name is required and must be under 100 characters." },
        { status: 400 },
      );
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }

    if (phone.length > 30) {
      return NextResponse.json(
        { error: "Phone number must be under 30 characters." },
        { status: 400 },
      );
    }

    // Generate an unknown initial password. The vendor must activate
    // the account and set their own password before they can log in.
    const unusableInitialPassword = randomBytes(48).toString("base64url");
    const passwordHash = await hash(unusableInitialPassword, 12);

    const user = await prisma.user.create({
      data: {
        name: contactName,
        email,
        passwordHash,
        role: "VENDOR",
        isActive: true,
        vendorProfile: {
          create: {
            companyName,
            contactName,
            phone: phone || null,
            status: "INVITED",
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        vendorProfile: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message:
          "Vendor created. The account is INVITED; no invitation email has been sent because email delivery is not configured.",
        vendor: user,
        invitationSent: false,
      },
      { status: 201 },
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
        { status: 409 },
      );
    }

    console.error("Create vendor failed:", error);

    return NextResponse.json(
      { error: "Unable to create the vendor right now." },
      { status: 500 },
    );
  }
}
