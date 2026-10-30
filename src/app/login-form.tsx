"use client";

import { signIn, signOut } from "next-auth/react";
import { useState, type FormEvent } from "react";

type LoginRole = "ADMIN" | "RECRUITER";

type LoginFormProps = {
  selectedRole: LoginRole;
  onBack: () => void;
};

export default function LoginForm({
  selectedRole,
  onBack,
}: LoginFormProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password, or your account is inactive.");
        setLoading(false);
        return;
      }

      const sessionResponse = await fetch("/api/auth/session");
      const session = await sessionResponse.json();

      if (!session?.user) {
        setError("Unable to load your login session. Please try again.");
        setLoading(false);
        return;
      }

      if (session.user.role !== selectedRole) {
        await signOut({ redirect: false });
        setError(
          `This account does not have the ${
            selectedRole === "ADMIN" ? "Admin" : "Recruiter"
          } role. Please use the correct login option.`
        );
        setLoading(false);
        return;
      }

      window.location.assign(
        selectedRole === "ADMIN" ? "/admin" : "/recruiter"
      );
    } catch {
      setError("Unable to log in right now. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-5 text-center text-xl font-semibold text-slate-800">
        {selectedRole === "ADMIN" ? "Admin Login" : "Recruiter Login"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="Enter your email address"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-100"
        >
          Back to Login Options
        </button>
      </form>
    </div>
  );
}
