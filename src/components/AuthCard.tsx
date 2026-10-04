import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthCard({ title, subtitle, children, footer }: {
  title: string; subtitle: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-bold">SkillTrack</span>
        </Link>
        <div className="rounded-2xl border bg-card p-7 shadow-card">
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">{subtitle}</p>
          {children}
        </div>
        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}

export function FormField({ id, label, error, ...props }: {
  id: string; label: string; error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function zodErrors(issues: { path: (string | number)[]; message: string }[]) {
  const errs: Record<string, string> = {};
  for (const i of issues) errs[String(i.path[0])] ??= i.message;
  return errs;
}
