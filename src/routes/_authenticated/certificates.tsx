import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ResourceManager } from "@/components/ResourcePage";
import { certificateSchema } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/certificates")({
  head: () => ({ meta: [{ title: "My Certificates — SkillTrack" }, { name: "description", content: "Manage your certificates." }] }),
  component: () => (
    <AppShell title="Certificates" subtitle="Keep all your certifications in one place.">
      <ResourceManager
        table="certificates" singular="Certificate" schema={certificateSchema}
        defaults={{ name: "", organization: "", issue_date: "", credential_id: "", url: "" }}
        fields={[
          { name: "name", label: "Certificate Name", type: "text" },
          { name: "organization", label: "Issuing Organization", type: "text" },
          { name: "issue_date", label: "Issue Date", type: "date" },
          { name: "credential_id", label: "Credential ID", type: "text" },
          { name: "url", label: "Certificate URL", type: "url", placeholder: "https://…" },
        ]}
        columns={[
          { label: "Certificate", render: (r) => <span className="font-medium">{r.name}</span> },
          { label: "Organization", render: (r) => r.organization },
          { label: "Issued", render: (r) => r.issue_date ?? "—" },
          { label: "Credential ID", render: (r) => r.credential_id ?? "—" },
          { label: "Link", render: (r) => r.url
            ? <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary">View <ExternalLink className="h-3 w-3" /></a>
            : "—" },
        ]}
      />
    </AppShell>
  ),
});
