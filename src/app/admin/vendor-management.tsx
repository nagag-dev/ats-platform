"use client";

import { useEffect, useState, type FormEvent } from "react";

type Vendor = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string | null;
  status: "INVITED" | "ACTIVE" | "SUSPENDED";
  user: { id: string; email: string; isActive: boolean };
};

export default function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadVendors(query = "") {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/vendors?q=${encodeURIComponent(query)}`,
        { cache: "no-store" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load vendors.");
      setVendors(data.vendors ?? []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load vendors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVendors();
  }, []);

  async function handleCreateVendor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, contactName, email, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create vendor.");

      setMessage(data.message || "Vendor created.");
      setCompanyName("");
      setContactName("");
      setEmail("");
      setPhone("");
      await loadVendors(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create vendor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 py-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Create Vendor</h2>
        <p className="mt-1 text-sm text-slate-600">
          Add a vendor company and its primary point of contact.
        </p>

        <form onSubmit={handleCreateVendor} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Company Name *
            <input required maxLength={150} value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Enter company name" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Vendor POC / Contact Name *
            <input required maxLength={100} value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Enter contact name" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Vendor Email ID *
            <input required type="email" maxLength={254} value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="contact@company.com" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Vendor Phone Number
            <input type="tel" maxLength={30} value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Optional" />
          </label>
          <div className="md:col-span-2">
            <button type="submit" disabled={loading}
              className="rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
              {loading ? "Please wait..." : "Create Vendor"}
            </button>
          </div>
        </form>

        {message && <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{message}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Vendor Directory</h2>
            <p className="mt-1 text-sm text-slate-600">Search and view registered vendors.</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); void loadVendors(search); }}
            className="flex gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Search vendors..." />
            <button type="submit" disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2">Search</button>
          </form>
        </div>

        {loading && <p className="py-5 text-sm text-slate-500">Loading vendors...</p>}
        {!loading && vendors.length === 0 &&
          <p className="py-5 text-sm text-slate-500">No vendors found.</p>}

        {vendors.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-3">Company Name</th>
                  <th className="px-3 py-3">POC</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-medium">{vendor.companyName}</td>
                    <td className="px-3 py-3">{vendor.contactName}</td>
                    <td className="px-3 py-3">{vendor.user.email}</td>
                    <td className="px-3 py-3">{vendor.phone || "—"}</td>
                    <td className="px-3 py-3">{vendor.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Invitation email delivery is not configured. Newly created vendors remain
          INVITED and cannot log in until activated.
        </p>
      </section>
    </div>
  );
}
