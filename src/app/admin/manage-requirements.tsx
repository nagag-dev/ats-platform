"use client";

import { useEffect, useState } from "react";

type RequirementStatus = "OPEN" | "ON_HOLD" | "CLOSED";

type StatusHistory = {
  id: string;
  previousStatus: RequirementStatus;
  newStatus: RequirementStatus;
  reason: string;
  createdAt: string;
  changedBy: {
    name: string;
    email: string;
  };
};

type Requirement = {
  id: string;
  referenceId: string;
  requirementCode: string;
  jobTitle: string;
  clientName: string;
  location: string;
  employmentType: string;
  minExperience: number | null;
  maxExperience: number | null;
  openings: number;
  skills: string[];
  description: string;
  status: RequirementStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    name: string;
    email: string;
  };
  assignments: {
    recruiter: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  statusHistory?: StatusHistory[];
};

type Filter = "ALL" | RequirementStatus;

export default function ManageRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusDrafts, setStatusDrafts] = useState<
    Record<string, RequirementStatus>
  >({});
  const [reasonDrafts, setReasonDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    async function loadRequirements() {
      try {
        const response = await fetch("/api/admin/requirements", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load requirements.");
        }

        setRequirements(data.requirements);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRequirements();
  }, []);

  async function saveStatus(requirement: Requirement) {
    const newStatus =
      statusDrafts[requirement.id] ?? requirement.status;
    const reason = (reasonDrafts[requirement.id] ?? "").trim();

    setStatusMessage("");

    if (newStatus === requirement.status) {
      setStatusMessage("Please select a different status.");
      return;
    }

    if (!reason) {
      setStatusMessage("A reason is required for every status change.");
      return;
    }

    setSavingId(requirement.id);

    try {
      const response = await fetch("/api/admin/requirements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requirementId: requirement.id,
          newStatus,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update requirement status.");
      }

      window.location.reload();
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Status update failed."
      );
    } finally {
      setSavingId(null);
    }
  }

  const counts = {
    OPEN: requirements.filter((r) => r.status === "OPEN").length,
    ON_HOLD: requirements.filter((r) => r.status === "ON_HOLD").length,
    CLOSED: requirements.filter((r) => r.status === "CLOSED").length,
  };

  const filteredRequirements =
    filter === "ALL"
      ? requirements
      : requirements.filter((r) => r.status === filter);

  const cards: {
    status: RequirementStatus;
    title: string;
    count: number;
    style: string;
  }[] = [
    {
      status: "OPEN",
      title: "Open",
      count: counts.OPEN,
      style: "border-green-300 bg-green-50 text-green-800",
    },
    {
      status: "ON_HOLD",
      title: "On Hold",
      count: counts.ON_HOLD,
      style: "border-amber-300 bg-amber-50 text-amber-800",
    },
    {
      status: "CLOSED",
      title: "Closed",
      count: counts.CLOSED,
      style: "border-red-300 bg-red-50 text-red-800",
    },
  ];

  return (
    <section className="mt-6">
      <h2 className="text-2xl font-bold text-slate-900">
        Requirement Management
      </h2>

      <p className="mt-2 text-slate-600">
        View all requirements created in the ATS platform.
      </p>

      {loading && (
        <p className="mt-6 text-slate-500">Loading requirements...</p>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {cards.map((card) => (
              <button
                key={card.status}
                type="button"
                onClick={() => setFilter(card.status)}
                aria-pressed={filter === card.status}
                className={`rounded-xl border-2 p-5 text-left transition hover:shadow-md ${
                  card.style
                } ${
                  filter === card.status
                    ? "ring-2 ring-blue-600 ring-offset-2"
                    : ""
                }`}
              >
                <p className="text-sm font-semibold">{card.title}</p>
                <p className="mt-2 text-3xl font-bold">{card.count}</p>
                <p className="mt-2 text-sm">Click to view requirements</p>
              </button>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-slate-900">
              {filter === "ALL"
                ? "All Requirements"
                : `${cards.find((card) => card.status === filter)?.title} Requirements`}
              {" "}({filteredRequirements.length})
            </h3>

            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Show All
            </button>
          </div>

          {filteredRequirements.length === 0 ? (
            <div className="mt-5 rounded-lg border border-slate-200 p-6 text-slate-500">
              No requirements found in this category.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {filteredRequirements.map((requirement) => (
                <article
                  key={requirement.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {requirement.jobTitle}
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {requirement.requirementCode} | {requirement.referenceId}
                      </p>
                    </div>

                    <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {requirement.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm text-slate-500">Client</p>
                      <p className="font-medium text-slate-900">
                        {requirement.clientName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium text-slate-900">
                        {requirement.location}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Openings</p>
                      <p className="font-medium text-slate-900">
                        {requirement.openings}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Assigned Recruiters</p>
                      <p className="font-medium text-slate-900">
                        {requirement.assignments.length > 0
                          ? requirement.assignments
                              .map((a) => a.recruiter.name)
                              .join(", ")
                          : "Not assigned"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Created By</p>
                      <p className="font-medium text-slate-900">
                        {requirement.createdBy.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Last Updated</p>
                      <p className="font-medium text-slate-900">
                        {new Date(requirement.updatedAt).toLocaleString(
                          "en-IN",
                          { timeZone: "Asia/Kolkata" }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm text-slate-500">Required Skills</p>
                    <p className="mt-1 text-slate-800">
                      {requirement.skills.join(", ")}
                    </p>
                  </div>

                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <h5 className="font-semibold text-slate-900">
                      Change Requirement Status
                    </h5>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`status-${requirement.id}`}
                          className="mb-1 block text-sm font-medium text-slate-700"
                        >
                          New Status
                        </label>
                        <select
                          id={`status-${requirement.id}`}
                          value={statusDrafts[requirement.id] ?? requirement.status}
                          onChange={(event) =>
                            setStatusDrafts((previous) => ({
                              ...previous,
                              [requirement.id]: event.target.value as RequirementStatus,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white p-2"
                        >
                          <option value="OPEN">Open</option>
                          <option value="ON_HOLD">On Hold</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor={`reason-${requirement.id}`}
                          className="mb-1 block text-sm font-medium text-slate-700"
                        >
                          Reason (required)
                        </label>
                        <textarea
                          id={`reason-${requirement.id}`}
                          value={reasonDrafts[requirement.id] ?? ""}
                          onChange={(event) =>
                            setReasonDrafts((previous) => ({
                              ...previous,
                              [requirement.id]: event.target.value,
                            }))
                          }
                          maxLength={1000}
                          rows={2}
                          placeholder="Enter reason for this status change"
                          className="w-full rounded-lg border border-slate-300 bg-white p-2"
                        />
                      </div>
                    </div>

                    {statusMessage && (
                      <p className="mt-2 text-sm text-red-700">
                        {statusMessage}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => saveStatus(requirement)}
                      disabled={
                        savingId === requirement.id ||
                        (statusDrafts[requirement.id] ?? requirement.status) ===
                          requirement.status
                      }
                      className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingId === requirement.id ? "Saving..." : "Save Status"}
                    </button>
                  </div>

                  <div className="mt-6">
                    <h5 className="font-semibold text-slate-900">
                      Status History
                    </h5>

                    {!requirement.statusHistory?.length ? (
                      <p className="mt-2 text-sm text-slate-500">
                        No status changes recorded yet.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {requirement.statusHistory.map((history) => (
                          <div
                            key={history.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                          >
                            <p className="font-semibold text-slate-900">
                              {history.previousStatus.replace("_", " ")} →{" "}
                              {history.newStatus.replace("_", " ")}
                            </p>
                            <p className="mt-1 text-sm text-slate-700">
                              Reason: {history.reason}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Changed by: {history.changedBy.name} (
                              {history.changedBy.email})
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(history.createdAt).toLocaleString(
                                "en-IN",
                                { timeZone: "Asia/Kolkata" }
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
