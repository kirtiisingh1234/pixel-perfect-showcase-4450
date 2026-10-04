import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, EmptyState, LoadingState, StatusBadge } from "@/components/AppShell";
import { useResource } from "@/components/ResourcePage";
import { SkillBars } from "@/components/SkillChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/admin-guard";
import { useAvatarUrl } from "@/routes/_authenticated/profile";

export const Route = createFileRoute("/_authenticated/admin/students/$id")({
  beforeLoad: requireAdmin,
  head: () => ({ meta: [{ title: "Student Details — SkillTrack" }, { name: "description", content: "Student profile and records." }] }),
  component: StudentDetail,
});

function SimpleTable({ heads, rows }: { heads: string[]; rows: React.ReactNode[][] }) {
  if (!rows.length) return <EmptyState text="No records." />;
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
      <Table>
        <TableHeader><TableRow>{heads.map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{rows.map((r, i) => <TableRow key={i}>{r.map((c, j) => <TableCell key={j}>{c}</TableCell>)}</TableRow>)}</TableBody>
      </Table>
    </div>
  );
}

function StudentDetail() {
  const { id } = Route.useParams();
  const { data: p, isLoading } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => (await supabase.from("students").select("*").eq("id", id).maybeSingle()).data,
  });
  const avatar = useAvatarUrl(p?.avatar_url);
  const skills = useResource("skills", id).data ?? [];
  const certs = useResource("certificates", id).data ?? [];
  const interns = useResource("internships", id).data ?? [];
  const apps = useResource("applications", id).data ?? [];

  return (
    <AppShell title={p?.full_name ?? "Student"} subtitle="Student profile and records"
      actions={<Link to="/admin/students" className="inline-flex items-center gap-1 text-sm font-medium text-primary"><ArrowLeft className="h-4 w-4" /> Back</Link>}>
      {isLoading ? <LoadingState /> : !p ? <EmptyState text="Student not found." /> : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-5 rounded-2xl border bg-card p-6 shadow-card">
            {avatar.data
              ? <img src={avatar.data} alt="" className="h-20 w-20 rounded-full object-cover" />
              : <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-brand text-2xl font-bold text-primary-foreground">{p.full_name.charAt(0)}</div>}
            <dl className="grid flex-1 gap-4 sm:grid-cols-3">
              {[["Email", p.email], ["Phone", p.phone], ["College", p.college], ["Course", p.course], ["Year", p.year], ["Joined", new Date(p.created_at).toLocaleDateString()]].map(([k, v]) => (
                <div key={k}><dt className="text-xs uppercase text-muted-foreground">{k}</dt><dd className="font-medium">{v || "—"}</dd></div>
              ))}
            </dl>
          </div>
          <Tabs defaultValue="skills">
            <TabsList>
              <TabsTrigger value="skills">Skills ({skills.length})</TabsTrigger>
              <TabsTrigger value="certs">Certificates ({certs.length})</TabsTrigger>
              <TabsTrigger value="interns">Internships ({interns.length})</TabsTrigger>
              <TabsTrigger value="apps">Applications ({apps.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="skills" className="mt-4">
              {skills.length ? <div className="rounded-2xl border bg-card p-5 shadow-card"><SkillBars skills={skills} /></div> : <EmptyState text="No skills." />}
            </TabsContent>
            <TabsContent value="certs" className="mt-4">
              <SimpleTable heads={["Name", "Organization", "Issued", "Credential ID"]}
                rows={certs.map((c) => [c.name, c.organization, c.issue_date ?? "—", c.credential_id ?? "—"])} />
            </TabsContent>
            <TabsContent value="interns" className="mt-4">
              <SimpleTable heads={["Company", "Role", "Duration", "Type", "Status"]}
                rows={interns.map((i) => [i.company, i.role, `${i.start_date ?? "—"} → ${i.end_date ?? "—"}`, i.internship_type, <StatusBadge status={i.status} />])} />
            </TabsContent>
            <TabsContent value="apps" className="mt-4">
              <SimpleTable heads={["Company", "Role", "Applied", "Status"]}
                rows={apps.map((a) => [a.company, a.role, a.applied_date, <StatusBadge status={a.status} />])} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </AppShell>
  );
}
