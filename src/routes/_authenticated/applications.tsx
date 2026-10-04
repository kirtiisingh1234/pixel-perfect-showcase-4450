import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { ResourceManager } from "@/components/ResourcePage";
import { APPLICATION_STATUS, applicationSchema } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({ meta: [{ title: "My Applications — SkillTrack" }, { name: "description", content: "Track internship applications." }] }),
  component: () => (
    <AppShell title="Internship Applications" subtitle="Track every application and update its status.">
      <ResourceManager
        table="applications" singular="Application" schema={applicationSchema}
        defaults={{ company: "", role: "", applied_date: new Date().toISOString().slice(0, 10), status: "Applied", notes: "" }}
        fields={[
          { name: "company", label: "Company Name", type: "text" },
          { name: "role", label: "Role", type: "text" },
          { name: "applied_date", label: "Applied Date", type: "date" },
          { name: "status", label: "Status", type: "select", options: APPLICATION_STATUS },
          { name: "notes", label: "Notes", type: "textarea" },
        ]}
        header={(rows) => (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {APPLICATION_STATUS.map((s) => (
              <div key={s} className="rounded-2xl border bg-card p-4 shadow-card">
                <StatusBadge status={s} />
                <p className="mt-2 text-2xl font-bold">{rows.filter((r) => r.status === s).length}</p>
              </div>
            ))}
          </div>
        )}
        columns={[
          { label: "Company", render: (r) => <span className="font-medium">{r.company}</span> },
          { label: "Role", render: (r) => r.role },
          { label: "Applied", render: (r) => r.applied_date },
          { label: "Status", render: (r) => <StatusBadge status={r.status} /> },
          { label: "Update Status", render: (r, update) => (
            <select aria-label="Update status" value={r.status} onChange={(e) => update({ status: e.target.value })}
              className="h-8 rounded-md border border-input bg-card px-2 text-sm">
              {APPLICATION_STATUS.map((s) => <option key={s}>{s}</option>)}
            </select>
          ) },
        ]}
      />
    </AppShell>
  ),
});
