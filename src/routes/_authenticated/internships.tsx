import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/AppShell";
import { ResourceManager } from "@/components/ResourcePage";
import { INTERNSHIP_STATUS, INTERNSHIP_TYPES, internshipSchema } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/internships")({
  head: () => ({
    meta: [
      { title: "My Internships — SkillTrack" },
      { name: "description", content: "Manage your internships." },
    ],
  }),
  component: () => (
    <AppShell title="Internships" subtitle="Record internships you have done or are doing.">
      <ResourceManager
        table="internships"
        singular="Internship"
        schema={internshipSchema}
        defaults={{
          company: "",
          role: "",
          start_date: "",
          end_date: "",
          internship_type: "Remote",
          status: "Ongoing",
          description: "",
        }}
        fields={[
          { name: "company", label: "Company Name", type: "text" },
          { name: "role", label: "Role", type: "text" },
          { name: "start_date", label: "Start Date", type: "date" },
          { name: "end_date", label: "End Date", type: "date" },
          {
            name: "internship_type",
            label: "Internship Type",
            type: "select",
            options: INTERNSHIP_TYPES,
          },
          { name: "status", label: "Status", type: "select", options: INTERNSHIP_STATUS },
          { name: "description", label: "Description", type: "textarea" },
        ]}
        columns={[
          { label: "Company", render: (r) => <span className="font-medium">{r.company}</span> },
          { label: "Role", render: (r) => r.role },
          { label: "Duration", render: (r) => `${r.start_date ?? "—"} → ${r.end_date ?? "—"}` },
          { label: "Type", render: (r) => r.internship_type },
          { label: "Status", render: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </AppShell>
  ),
});
