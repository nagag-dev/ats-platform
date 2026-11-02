import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/app/sign-out-button";

export default async function RecruiterPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "RECRUITER") {
    redirect("/admin");
  }

  const assignments = await prisma.requirementAssignment.findMany({
    where: {
      recruiterId: session.user.id,
      isActive: true,
    },
    include: {
      requirement: true,
    },
    orderBy: {
      assignedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow">
        <div className="mb-6 flex justify-end">
          <SignOutButton />
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Recruiter Dashboard
        </h1>

        <p className="mt-2 text-slate-600">
          Welcome, {session.user.name}.
        </p>

        <h2 className="mt-8 text-xl font-semibold text-slate-900">
          My Assigned Requirements
        </h2>

        {assignments.length === 0 ? (
          <div className="mt-6 rounded-lg border border-slate-200 p-6 text-slate-500">
            No requirements have been assigned to you yet.
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            {assignments.map((assignment) => {
              const requirement = assignment.requirement;

              return (
                <article
                  key={assignment.id}
                  className="rounded-xl border border-slate-200 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {requirement.jobTitle}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {requirement.requirementCode} | {requirement.referenceId}
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      {requirement.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm text-slate-500">Client</p>
                      <p className="font-medium">{requirement.clientName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium">{requirement.location}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Employment Type</p>
                      <p className="font-medium">{requirement.employmentType}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Experience</p>
                      <p className="font-medium">
                        {requirement.minExperience ?? "Not specified"} –{" "}
                        {requirement.maxExperience ?? "Not specified"} years
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Openings</p>
                      <p className="font-medium">{requirement.openings}</p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Assigned On</p>
                      <p className="font-medium">
                        {assignment.assignedAt.toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm text-slate-500">Required Skills</p>
                    <p className="mt-1">{requirement.skills.join(", ")}</p>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm text-slate-500">Job Description</p>
                    <p className="mt-1 whitespace-pre-wrap text-slate-700">
                      {requirement.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
