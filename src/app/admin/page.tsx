
import CreateRecruiterForm from "./create-recruiter-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/app/sign-out-button";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-slate-900">
          ATS Admin Dashboard
        <div className="mb-6 flex justify-end">
  <SignOutButton />
</div>
</h1>


        <p className="mt-2 text-slate-600">
          Welcome, {session.user.name}.
        </p>

        <p className="mt-6 text-sm text-slate-500">
          Your administrator access is authenticated.
        </p>

        <CreateRecruiterForm />
      </section>
    </main>
  );
}
