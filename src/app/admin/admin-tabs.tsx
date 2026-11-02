"use client";

import { useState } from "react";
import CreateRecruiterForm from "./create-recruiter-form";
import CreateRequirementForm from "./create-requirement-form";

type Tab = "recruiter" | "requirement";

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("recruiter");

  return (
    <section className="mt-8">
      <div
        role="tablist"
        aria-label="Admin management"
        className="flex flex-wrap gap-2 border-b border-slate-200"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "recruiter"}
          aria-controls="recruiter-panel"
          onClick={() => setActiveTab("recruiter")}
          className={`rounded-t-lg px-6 py-3 font-semibold ${
            activeTab === "recruiter"
              ? "border-b-2 border-blue-700 bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Create Recruiter
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "requirement"}
          aria-controls="requirement-panel"
          onClick={() => setActiveTab("requirement")}
          className={`rounded-t-lg px-6 py-3 font-semibold ${
            activeTab === "requirement"
              ? "border-b-2 border-blue-700 bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Create Requirement
        </button>
      </div>

      <div
        role="tabpanel"
        id="recruiter-panel"
        hidden={activeTab !== "recruiter"}
      >
        <CreateRecruiterForm />
      </div>

      <div
        role="tabpanel"
        id="requirement-panel"
        hidden={activeTab !== "requirement"}
      >
        <CreateRequirementForm />
      </div>
    </section>
  );
}
