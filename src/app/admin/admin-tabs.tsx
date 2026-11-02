"use client";

import { useState } from "react";

import CreateRecruiterForm from "./create-recruiter-form";
import CreateRequirementForm from "./create-requirement-form";
import ManageRequirements from "./manage-requirements";
import VendorManagement from "./vendor-management";

type Tab = "recruiter" | "requirement" | "manage" | "vendor";

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("recruiter");

  const tabClass = (tab: Tab) =>
    `rounded-t-lg px-6 py-3 font-semibold ${
      activeTab === tab
        ? "border-b-2 border-blue-700 bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-slate-100"
    }`;

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
          className={tabClass("recruiter")}
        >
          Create Recruiter
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "requirement"}
          aria-controls="requirement-panel"
          onClick={() => setActiveTab("requirement")}
          className={tabClass("requirement")}
        >
          Create Requirement
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "manage"}
          aria-controls="manage-panel"
          onClick={() => setActiveTab("manage")}
          className={tabClass("manage")}
        >
          Manage Requirements
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "vendor"}
          aria-controls="vendor-panel"
          onClick={() => setActiveTab("vendor")}
          className={tabClass("vendor")}
        >
          Vendor Management
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

      <div
        role="tabpanel"
        id="manage-panel"
        hidden={activeTab !== "manage"}
      >
        <ManageRequirements />
      </div>
      <div
        role="tabpanel"
        id="vendor-panel"
        hidden={activeTab !== "vendor"}
      >
        <VendorManagement />
      </div>
    </section>
  );
}
