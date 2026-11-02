"use client";

import { useState } from "react";
import LoginForm from "./login-form";

type LoginRole = "ADMIN" | "RECRUITER" | "VENDOR";

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-700 text-2xl font-bold text-white">
            A
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            ATS Platform
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {selectedRole === "ADMIN"
              ? "Administrator Portal"
              : selectedRole === "RECRUITER"
                ? "Recruiter Portal"
                : selectedRole === "VENDOR"
                  ? "Vendor Portal"
                  : "Choose your login"}
          </p>
        </div>

        {!selectedRole ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSelectedRole("ADMIN")}
              className="w-full rounded-lg bg-blue-700 px-4 py-4 font-semibold text-white hover:bg-blue-800"
            >
              Login as Admin
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("RECRUITER")}
              className="w-full rounded-lg bg-indigo-600 px-4 py-4 font-semibold text-white hover:bg-indigo-700"
            >
              Login as Recruiter
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("VENDOR")}
              className="w-full rounded-lg bg-slate-700 px-4 py-4 font-semibold text-white hover:bg-slate-800"
            >
              Login as Vendor
            </button>
          </div>
        ) : (
          <LoginForm
            selectedRole={selectedRole}
            onBack={() => setSelectedRole(null)}
          />
        )}

        <p className="mt-6 text-center text-xs text-slate-500">
          Secure access for authorized users only.
        </p>
      </section>
    </main>
  );
}
