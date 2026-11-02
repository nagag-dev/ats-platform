import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const employmentTypes = [
  "FULL_TIME",
  "CONTRACT",
  "CONTRACT_TO_HIRE",
  "INTERNSHIP",
] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0
  );
}

function isValidText(
  value: unknown,
  maximumLength: number,
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maximumLength
  );
}

export async function POST(request: Request) {
  try {
    // 1. Check login session
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must log in first." },
        { status: 401 },
      );
    }

    // 2. Only Admin can create requirements
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only Admin users can create requirements." },
        { status: 403 },
      );
    }

    // 3. Read request data
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    if (!isObject(body)) {
      return NextResponse.json(
        { error: "Request body must be a JSON object." },
        { status: 400 },
      );
    }

    const {
      referenceId,
      jobTitle,
      clientName,
      location,
      description,
      employmentType,
      minExperience,
      maxExperience,
      skills,
      recruiterIds,
    } = body;

    // 4. Validate text fields
    if (
      !isValidText(referenceId, 50) ||
      !isValidText(jobTitle, 150) ||
      !isValidText(clientName, 150) ||
      !isValidText(location, 150) ||
      !isValidText(description, 10000)
    ) {
      return NextResponse.json(
        { error: "Please provide all required text fields. Check their maximum lengths." },
        { status: 400 },
      );
    }

    // 5. Validate employment type
    if (
      typeof employmentType !== "string" ||
      !employmentTypes.includes(
        employmentType as (typeof employmentTypes)[number],
      )
    ) {
      return NextResponse.json(
        { error: "Invalid employment type." },
        { status: 400 },
      );
    }

    // 6. Validate experience
    const minimum =
      minExperience === undefined || minExperience === null
        ? null
        : minExperience;

    const maximum =
      maxExperience === undefined || maxExperience === null
        ? null
        : maxExperience;

    if (
      (minimum !== null && !isNonNegativeInteger(minimum)) ||
      (maximum !== null && !isNonNegativeInteger(maximum))
    ) {
      return NextResponse.json(
        { error: "Experience must be a non-negative whole number or null." },
        { status: 400 },
      );
    }

    if (
      minimum !== null &&
      maximum !== null &&
      minimum > maximum
    ) {
      return NextResponse.json(
        { error: "Minimum experience cannot exceed maximum experience." },
        { status: 400 },
      );
    }

    // 7. Validate openings
    const openings = body.openings ?? 1;

    if (
      typeof openings !== "number" ||
      !Number.isInteger(openings) ||
      openings < 1
    ) {
      return NextResponse.json(
        { error: "Openings must be a whole number greater than zero." },
        { status: 400 },
      );
    }

    // 8. Validate skills
    if (
      !Array.isArray(skills) ||
      skills.length === 0 ||
      skills.length > 50 ||
      !skills.every(
        (skill) =>
          typeof skill === "string" &&
          skill.trim().length > 0 &&
          skill.trim().length <= 100,
      )
    ) {
      return NextResponse.json(
        { error: "Provide between 1 and 50 valid skills." },
        { status: 400 },
      );
    }

    const cleanedSkills = [
      ...new Set(
        skills.map((skill: string) => skill.trim()),
      ),
    ];

    // 9. Validate recruiter assignments
    if (
      !Array.isArray(recruiterIds) ||
      recruiterIds.length === 0 ||
      recruiterIds.length > 100 ||
      !recruiterIds.every(
        (id) => typeof id === "string" && id.trim().length > 0,
      )
    ) {
      return NextResponse.json(
        { error: "Select at least one valid recruiter." },
        { status: 400 },
      );
    }

    const uniqueRecruiterIds = [...new Set(recruiterIds)];

    // 10. Create requirement and assignments in one transaction
    const requirement = await prisma.$transaction(async (tx) => {
      const activeRecruiters = await tx.user.findMany({
        where: {
          id: { in: uniqueRecruiterIds },
          role: "RECRUITER",
          isActive: true,
        },
        select: { id: true },
      });

      if (activeRecruiters.length !== uniqueRecruiterIds.length) {
        throw new Error("INVALID_RECRUITERS");
      }

      // Use Indian time to determine the requirement month
      const now = new Date();

      const dateParts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        month: "short",
        year: "2-digit",
      }).formatToParts(now);

      const monthName = dateParts.find(
        (part) => part.type === "month",
      )?.value;

      const monthNumber = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        month: "2-digit",
      }).format(now);

      const year = dateParts.find(
        (part) => part.type === "year",
      )?.value;

      if (!monthName || !monthNumber || !year) {
        throw new Error("DATE_FORMAT_ERROR");
      }

      const sequenceKey = `${year}-${monthNumber}`;

      // Atomically reserve the next monthly sequence number
      const sequenceRows = await tx.$queryRaw<
        Array<{ sequence: number }>
      >`
        INSERT INTO "RequirementSequence" ("key", "nextValue")
        VALUES (${sequenceKey}, 2)
        ON CONFLICT ("key")
        DO UPDATE SET
          "nextValue" = "RequirementSequence"."nextValue" + 1
        RETURNING ("nextValue" - 1) AS "sequence"
      `;

      const sequence = sequenceRows[0]?.sequence;

      if (!sequence) {
        throw new Error("SEQUENCE_GENERATION_FAILED");
      }

      const requirementCode =
        `REQ-${monthName} ${year}-${String(sequence).padStart(2, "0")}`;

      // Create requirement and all recruiter assignments
      return tx.requirement.create({
        data: {
          referenceId: referenceId.trim(),
          requirementCode,
          jobTitle: jobTitle.trim(),
          clientName: clientName.trim(),
          location: location.trim(),
          description: description.trim(),
          employmentType:
            employmentType as (typeof employmentTypes)[number],
          minExperience: minimum as number | null,
          maxExperience: maximum as number | null,
          skills: cleanedSkills,
          openings,
          createdBy: {
            connect: { id: session.user.id },
          },
          assignments: {
            create: uniqueRecruiterIds.map((recruiterId) => ({
              recruiter: {
                connect: { id: recruiterId },
              },
              assignedBy: {
                connect: { id: session.user.id },
              },
            })),
          },
        },
        include: {
          assignments: {
            include: {
              recruiter: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    // 11. Return successful response
    return NextResponse.json(
      {
        message: "Requirement created successfully.",
        requirement,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create requirement error:", error);

    if (
      error instanceof Error &&
      error.message === "INVALID_RECRUITERS"
    ) {
      return NextResponse.json(
        { error: "One or more selected recruiters are invalid or inactive." },
        { status: 400 },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This Requirement Reference ID or generated code already exists." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to create requirement. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must log in first." },
        { status: 401 },
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only Admin users can view all requirements." },
        { status: 403 },
      );
    }

    const requirements = await prisma.requirement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        assignments: {
          where: { isActive: true },
          include: {
            recruiter: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error("Fetch requirements failed:", error);

    return NextResponse.json(
      { error: "Unable to load requirements right now." },
      { status: 500 },
    );
  }
}
