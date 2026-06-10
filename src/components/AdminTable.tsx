"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  reference: string;
  createdAt: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  city: string;
  occupation: string;
  status: string;
  institution: string | null;
  hasBusiness: boolean;
  businessName: string | null;
  sector: string | null;
  stage: string | null;
  businessDesc: string | null;
  hasWebsite: boolean | null;
  domain: string | null;
  socials: string[];
  referral: string | null;
  goals: string | null;
  marketingOptIn: boolean;
};

const CSV_COLUMNS: { key: keyof Row; label: string }[] = [
  { key: "reference", label: "Reference" },
  { key: "createdAt", label: "Registered" },
  { key: "firstName", label: "First name" },
  { key: "surname", label: "Surname" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Cell" },
  { key: "city", label: "City" },
  { key: "occupation", label: "Occupation" },
  { key: "status", label: "Status" },
  { key: "institution", label: "Institution" },
  { key: "hasBusiness", label: "Has business" },
  { key: "businessName", label: "Business name" },
  { key: "sector", label: "Sector" },
  { key: "stage", label: "Stage" },
  { key: "businessDesc", label: "Business does" },
  { key: "hasWebsite", label: "Has website" },
  { key: "domain", label: "Domain" },
  { key: "socials", label: "Socials" },
  { key: "referral", label: "Heard via" },
  { key: "goals", label: "Goals" },
  { key: "marketingOptIn", label: "Opted in" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [delError, setDelError] = useState("");

  async function remove(id: string) {
    setDelError("");
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not delete.");
      setConfirmId(null);
      router.refresh(); // re-query the server component so the row disappears
    } catch (err) {
      setDelError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [
        r.firstName,
        r.surname,
        r.email,
        r.phone,
        r.city,
        r.occupation,
        r.businessName,
        r.reference,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [rows, q]);

  function exportCSV() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = CSV_COLUMNS.map((c) => esc(c.label)).join(",");
    const lines = filtered.map((r) =>
      CSV_COLUMNS.map((c) => {
        const val = r[c.key];
        return esc(Array.isArray(val) ? val.join("; ") : val);
      }).join(",")
    );
    const csv = [header, ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `master-class-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin">
      <div className="admin-head">
        <h1>Registrations</h1>
        <button className="btn btn-ghost" onClick={logout}>
          Sign out
        </button>
      </div>
      <p className="admin-sub">
        Youth Digital Empowerment &amp; Entrepreneurship Master Class · 11 June 2026
      </p>

      <div className="admin-bar">
        <span className="stat">
          <b>{rows.length}</b>
          <span>total registered</span>
        </span>
        <input
          type="text"
          placeholder="Search name, email, city, business, reference…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn btn-primary" onClick={exportCSV}>
          Export CSV{q ? " (filtered)" : ""}
        </button>
      </div>

      {delError && <p className="form-error" style={{ marginBottom: 12 }}>{delError}</p>}

      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty">
            {rows.length === 0 ? "No registrations yet." : "No matches for your search."}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ref</th>
                <th>Registered</th>
                <th>Name</th>
                <th>Contact</th>
                <th>City</th>
                <th>Occupation</th>
                <th>Status</th>
                <th>Business</th>
                <th>Website</th>
                <th>Socials</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.reference}</td>
                  <td>{fmtDate(r.createdAt)}</td>
                  <td>
                    {r.firstName} {r.surname}
                  </td>
                  <td>
                    {r.email}
                    <br />
                    {r.phone}
                  </td>
                  <td>{r.city}</td>
                  <td>{r.occupation}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.hasBusiness ? (
                      <>
                        <span className="pill yes">Yes</span>
                        {r.businessName ? <div>{r.businessName}</div> : null}
                        {r.sector ? <div className="hint">{r.sector}</div> : null}
                      </>
                    ) : (
                      <span className="pill no">No</span>
                    )}
                  </td>
                  <td>
                    {r.hasBusiness ? (
                      r.hasWebsite ? (
                        <span className="pill yes">{r.domain || "Yes"}</span>
                      ) : (
                        <span className="pill no">No</span>
                      )
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{r.socials.length ? r.socials.join(", ") : "—"}</td>
                  <td className="actions-cell">
                    {confirmId === r.id ? (
                      <span className="confirm-del">
                        <span className="confirm-q">Delete?</span>
                        <button
                          className="btn-mini btn-mini-danger"
                          onClick={() => remove(r.id)}
                          disabled={busyId === r.id}
                        >
                          {busyId === r.id ? "…" : "Yes"}
                        </button>
                        <button
                          className="btn-mini"
                          onClick={() => setConfirmId(null)}
                          disabled={busyId === r.id}
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        className="btn-mini btn-mini-ghost"
                        onClick={() => {
                          setDelError("");
                          setConfirmId(r.id);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
