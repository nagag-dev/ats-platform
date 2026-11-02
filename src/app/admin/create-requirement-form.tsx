"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Recruiter = {
  id: string;
  name: string;
  email: string;
};

export default function CreateRequirementForm() {
  const router = useRouter();

  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [loadingRecruiters, setLoadingRecruiters] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recruiterSearch, setRecruiterSearch] = useState("");
  const [selectedRecruiterIds, setSelectedRecruiterIds] = useState<string[]>([]);


  useEffect(() => {
    async function loadRecruiters() {
      try {
        const response = await fetch("/api/admin/users");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error ?? "Unable to load recruiters.");
        }

        setRecruiters(result.recruiters ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load recruiters.",
        );
      } finally {
        setLoadingRecruiters(false);
      }
    }

    loadRecruiters();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const minimum = String(formData.get("minExperience") ?? "");
    const maximum = String(formData.get("maxExperience") ?? "");

    const skills = String(formData.get("skills") ?? "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const recruiterIds = formData
      .getAll("recruiterIds")
      .map(String);

    if (recruiterIds.length === 0) {
      setError("Please select at least one recruiter.");
      setSubmitting(false);
      return;
    }

    const payload = {
      referenceId: String(formData.get("referenceId") ?? "").trim(),
      jobTitle: String(formData.get("jobTitle") ?? "").trim(),
      clientName: String(formData.get("clientName") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      employmentType: String(formData.get("employmentType") ?? ""),
      minExperience: minimum === "" ? null : Number(minimum),
      maxExperience: maximum === "" ? null : Number(maximum),
      openings: Number(formData.get("openings")),
      description: String(formData.get("description") ?? "").trim(),
      skills,
      recruiterIds,
    };

    try {
      const response = await fetch("/api/admin/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to create requirement.");
        return;
      }

      setMessage(
        `Requirement created successfully. Code: ${result.requirement.requirementCode}`,
      );

      form.reset();
      setSelectedRecruiterIds([]);
      setRecruiterSearch("");
      router.refresh();
    } catch {
      setError("Could not connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2";

  const labelClass =
    "mb-1 block text-sm font-medium text-slate-700";

  return (
    <section className="mt-8 rounded-xl border border-slate-200 p-6">
      <h2 className="text-xl font-semibold text-slate-900">
        Create Requirement
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Create a job requirement and assign one or more recruiters.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="referenceId" className={labelClass}>
              Requirement Reference ID
            </label>
            <input
              id="referenceId"
              name="referenceId"
              required
              maxLength={50}
              className={inputClass}
              placeholder="Example: CLIENT-REQ-001"
            />
            <p className="mt-1 text-xs text-slate-500">
              Your business reference. The system generates a separate requirement code.
            </p>
          </div>

          <div>
            <label htmlFor="jobTitle" className={labelClass}>
              Job Title
            </label>
            <input
              id="jobTitle"
              name="jobTitle"
              required
              maxLength={150}
              className={inputClass}
              placeholder="Example: Senior DevOps Engineer"
            />
          </div>

          <div>
            <label htmlFor="clientName" className={labelClass}>
              Client Name
            </label>
            <input
              id="clientName"
              name="clientName"
              required
              maxLength={150}
              className={inputClass}
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label htmlFor="location" className={labelClass}>
              Location
            </label>
            <input
              id="location"
              name="location"
              required
              maxLength={150}
              className={inputClass}
              placeholder="Example: Bengaluru, India"
            />
          </div>

          <div>
            <label htmlFor="employmentType" className={labelClass}>
              Employment Type
            </label>
            <select
              id="employmentType"
              name="employmentType"
              required
              defaultValue="FULL_TIME"
              className={inputClass}
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="CONTRACT_TO_HIRE">Contract to Hire</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          <div>
            <label htmlFor="openings" className={labelClass}>
              Number of Openings
            </label>
            <input
              id="openings"
              name="openings"
              type="number"
              min="1"
              defaultValue="1"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="minExperience" className={labelClass}>
              Minimum Experience (Years)
            </label>
            <input
              id="minExperience"
              name="minExperience"
              type="number"
              min="0"
              step="1"
              className={inputClass}
              placeholder="Example: 3"
            />
          </div>

          <div>
            <label htmlFor="maxExperience" className={labelClass}>
              Maximum Experience (Years)
            </label>
            <input
              id="maxExperience"
              name="maxExperience"
              type="number"
              min="0"
              step="1"
              className={inputClass}
              placeholder="Example: 8"
            />
          </div>
        </div>

        <div>
          <label htmlFor="skills" className={labelClass}>
            Required Skills
          </label>
          <input
            id="skills"
            name="skills"
            required
            className={inputClass}
            placeholder="AWS, Linux, Terraform, Kubernetes"
          />
          <p className="mt-1 text-xs text-slate-500">
            Separate skills with commas.
          </p>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Job Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            maxLength={10000}
            rows={5}
            className={inputClass}
            placeholder="Enter responsibilities, qualifications and other job details."
          />
        </div>

        <div>
          <p className={labelClass}>Assign Recruiters</p>

          {loadingRecruiters ? (
            <p className="text-sm text-slate-500">
              Loading recruiters...
            </p>
          ) : recruiters.length === 0 ? (
            <p className="text-sm text-red-600">
              No active recruiters found. Create a recruiter account first.
            </p>
          ) : (
            <div className="space-y-3">
              <input
                type="search"
                value={recruiterSearch}
                onChange={(event) => setRecruiterSearch(event.target.value)}
                placeholder="Search recruiters by name or email..."
                aria-label="Search recruiters by name or email"
                className={inputClass}
              />

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  Available recruiters ({recruiters.length})
                </span>
                <span className="font-medium text-blue-700">
                  Selected: {selectedRecruiterIds.length}
                </span>
              </div>

              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-300 p-3">
                {recruiters
                  .filter((recruiter) => {
                    const search = recruiterSearch.trim().toLowerCase();
                    return (
                      recruiter.name.toLowerCase().includes(search) ||
                      recruiter.email.toLowerCase().includes(search)
                    );
                  })
                  .map((recruiter) => (
                    <label
                      key={recruiter.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        name="recruiterIds"
                        value={recruiter.id}
                        checked={selectedRecruiterIds.includes(recruiter.id)}
                        onChange={(event) => {
                          setSelectedRecruiterIds((current) =>
                            event.target.checked
                              ? [...current, recruiter.id]
                              : current.filter((id) => id !== recruiter.id)
                          );
                        }}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-800">
                        <span className="font-medium">{recruiter.name}</span>
                        <span className="text-slate-500"> — {recruiter.email}</span>
                      </span>
                    </label>
                  ))}

                {recruiters.filter((recruiter) => {
                  const search = recruiterSearch.trim().toLowerCase();
                  return (
                    recruiter.name.toLowerCase().includes(search) ||
                    recruiter.email.toLowerCase().includes(search)
                  );
                }).length === 0 && (
                  <p className="p-2 text-sm text-slate-500">
                    No recruiters match your search.
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-500">
                Select one or more recruiters using the checkboxes. You can
                search by name or email.
              </p>
            </div>
          )}
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
          disabled={submitting || loadingRecruiters || recruiters.length === 0}
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {submitting ? "Creating requirement..." : "Create Requirement"}
        </button>
      </form>
    </section>
  );
}
