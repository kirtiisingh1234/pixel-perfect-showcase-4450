import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  User,
  Sparkles,
  Award,
  Briefcase,
  Send,
  LogOut,
  Users,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const studentNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/skills", label: "Skills", icon: Sparkles },
  { to: "/certificates", label: "Certificates", icon: Award },
  { to: "/internships", label: "Internships", icon: Briefcase },
  { to: "/applications", label: "Applications", icon: Send },
] as const;

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: Users },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, isAdmin } = useRouteContext({ from: "/_authenticated" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const nav = isAdmin ? adminNav : studentNav;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: isAdmin ? "/admin/login" : "/login", replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-soft md:flex">
      <aside className="border-b bg-sidebar md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-5 py-4 md:py-6">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none">SkillTrack</p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Admin Panel" : "Student Portal"}
            </p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="flex items-center justify-between gap-3 border-b bg-card/80 px-5 py-3 backdrop-blur md:px-8">
          <p className="truncate text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8 md:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold">{title}</h1>
              {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: typeof User;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
      Loading…
    </div>
  );
}

const statusTone: Record<string, string> = {
  Applied: "bg-info/15 text-info",
  Shortlisted: "bg-warning/20 text-foreground",
  Interview: "bg-primary-soft text-primary",
  Selected: "bg-success/15 text-success",
  Rejected: "bg-destructive/15 text-destructive",
  Ongoing: "bg-info/15 text-info",
  Completed: "bg-success/15 text-success",
  Upcoming: "bg-warning/20 text-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusTone[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}
