
"use client";

import { useState, type FormEvent } from "react";

export default function CreateRecruiterForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to create recruiter.");
        return;
      }

      setMessage(`Recruiter created: ${result.user.name} (${result.user.email})`);
      form.reset();
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900">
        Create Recruiter
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Create an account for a recruitment team member.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label htmlFor="recruiter-name" className="mb-1 block text-sm font-medium">
            Full name
          </label>
          <input
            id="recruiter-name"
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Recruiter name"
          />
        </div>

        <div>
          <label htmlFor="recruiter-email" className="mb-1 block text-sm font-medium">
            Email address
          </label>
          <input
            id="recruiter-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="recruiter@example.com"
          />
        </div>

        <div>
          <label htmlFor="recruiter-password" className="mb-1 block text-sm font-medium">
            Temporary password
          </label>
          <input
            id="recruiter-password"
            name="password"
            type="password"
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="At least 12 characters"
          />
          <p className="mt-1 text-xs text-slate-500">
            Use a unique password and share it securely with the recruiter.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create Recruiter"}
        </button>
      </form>
    </section>
  );
}
