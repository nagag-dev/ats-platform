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
          firstName: formData.get("firstName"),
          middleName: formData.get("middleName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to create recruiter.");
        return;
      }

      setMessage(
        `Recruiter created: ${result.user.name} (${result.user.email})`
      );

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
          <label htmlFor="recruiter-first-name" className="mb-1 block text-sm font-medium">
            First Name
          </label>
          <input
            id="recruiter-first-name"
            name="firstName"
            type="text"
            required
            maxLength={50}
            autoComplete="given-name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Enter first name"
          />
        </div>

        <div>
          <label htmlFor="recruiter-middle-name" className="mb-1 block text-sm font-medium">
            Middle Name (Optional)
          </label>
          <input
            id="recruiter-middle-name"
            name="middleName"
            type="text"
            maxLength={50}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Enter middle name"
          />
        </div>

        <div>
          <label htmlFor="recruiter-last-name" className="mb-1 block text-sm font-medium">
            Last Name
          </label>
          <input
            id="recruiter-last-name"
            name="lastName"
            type="text"
            required
            maxLength={50}
            autoComplete="family-name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Enter last name"
          />
        </div>

        <div>
          <label htmlFor="recruiter-email" className="mb-1 block text-sm font-medium">
            Email Address
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
            Temporary Password
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
