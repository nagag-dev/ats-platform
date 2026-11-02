import AdminTabs from "./admin-tabs";
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
      <section className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900">
            ATS Admin Dashboard
          </h1>

          <SignOutButton />
        </div>

        <p className="mt-4 text-slate-600">
          Welcome, {session.user.name}.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Your administrator access is authenticated.
        </p>

        <AdminTabs />
      </section>
    </main>
  );
}
