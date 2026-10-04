import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Award, Briefcase, Send, Sparkles } from "lucide-react";
import { AppShell, EmptyState, StatCard, StatusBadge } from "@/components/AppShell";
import { useResource } from "@/components/ResourcePage";
import { SkillBars, SkillChart } from "@/components/SkillChart";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: ({ context }) => {
    if (context.isAdmin) throw redirect({ to: "/admin/dashboard" });
  },
  head: () => ({ meta: [{ title: "Dashboard — SkillTrack" }, { name: "description", content: "Your student dashboard." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const skills = useResource("skills", user.id);
  const certs = useResource("certificates", user.id);
  const interns = useResource("internships", user.id);
  const apps = useResource("applications", user.id);
  const s = skills.data ?? [];

  return (
    <AppShell title="Student Dashboard" subtitle="Your career progress at a glance.">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Skills" value={skills.data?.length ?? "…"} icon={Sparkles} />
        <StatCard label="Certificates" value={certs.data?.length ?? "…"} icon={Award} />
        <StatCard label="Internships" value={interns.data?.length ?? "…"} icon={Briefcase} />
        <StatCard label="Applications" value={apps.data?.length ?? "…"} icon={Send} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <p className="mb-4 font-semibold">Skill Progress</p>
          {s.length ? <SkillBars skills={s} /> : <EmptyState text="No skills yet." />}
          <Link to="/skills" className="mt-4 inline-block text-sm font-medium text-primary">Manage skills →</Link>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <p className="mb-4 font-semibold">Proficiency Chart</p>
          {s.length ? <SkillChart skills={s} /> : <EmptyState text="Add skills to see your chart." />}
        </div>
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-card">
        <p className="mb-4 font-semibold">Recent Applications</p>
        {apps.data?.length ? (
          <ul className="divide-y">
            {apps.data.slice(0, 5).map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <span><span className="font-medium">{a.company}</span> · {a.role}</span>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        ) : <EmptyState text="No applications yet." />}
      </div>
    </AppShell>
  );
}
