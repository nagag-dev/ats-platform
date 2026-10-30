
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/sign-out-button";

export default async function RecruiterPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "RECRUITER") {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
        <div className="mb-6 flex justify-end">
          <SignOutButton />
        </div>

        <h1 className="text-3xl font-bold text-slate-900">
          Recruiter Dashboard
        </h1>

        <p className="mt-2 text-slate-600">
          Welcome, {session.user.name}.
        </p>

        <p className="mt-6 text-slate-500">
          Your recruitment workspace is ready.
        </p>
      </section>
    </main>
  );
}
