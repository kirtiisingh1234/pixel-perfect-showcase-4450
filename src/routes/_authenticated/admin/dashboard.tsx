import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Briefcase, Send, Sparkles, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatCard } from "@/components/AppShell";
import { requireAdmin } from "@/lib/admin-guard";
import { APPLICATION_STATUS } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  beforeLoad: requireAdmin,
  head: () => ({ meta: [{ title: "Admin Dashboard — SkillTrack" }, { name: "description", content: "Overview of all student records." }] }),
  component: AdminDashboard,
});

const tables = ["students", "skills", "certificates", "internships", "applications"] as const;

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const counts = await Promise.all(tables.map(async (t) => {
        const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
        return [t, count ?? 0] as const;
      }));
      const { data: apps } = await supabase.from("applications").select("status");
      return { counts: Object.fromEntries(counts) as Record<(typeof tables)[number], number>, apps: apps ?? [] };
    },
  });
  const c = data?.counts;
  const statusData = APPLICATION_STATUS.map((s) => ({ status: s, count: data?.apps.filter((a) => a.status === s).length ?? 0 }));

  return (
    <AppShell title="Admin Dashboard" subtitle="College-wide overview of student records."
      actions={<Link to="/admin/students" className="text-sm font-medium text-primary">Manage students →</Link>}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Students" value={c?.students ?? "…"} icon={Users} />
        <StatCard label="Total Skills" value={c?.skills ?? "…"} icon={Sparkles} />
        <StatCard label="Certificates" value={c?.certificates ?? "…"} icon={Award} />
        <StatCard label="Internships" value={c?.internships ?? "…"} icon={Briefcase} />
        <StatCard label="Applications" value={c?.applications ?? "…"} icon={Send} />
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-card">
        <p className="mb-3 font-semibold">Applications by Status</p>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="status" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
              <Bar dataKey="count" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  );
}
