import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Row } from "@/components/ResourcePage";

export function SkillChart({ skills }: { skills: Row[] }) {
  if (!skills.length) return null;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={skills.map((s) => ({ name: s.name, progress: s.progress, level: s.proficiency }))}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} unit="%" />
          <Tooltip formatter={(v, _n, p) => [`${v}% (${p.payload.level})`, "Progress"]}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
          <Bar dataKey="progress" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SkillBars({ skills }: { skills: Row[] }) {
  return (
    <div className="space-y-4">
      {skills.map((s) => (
        <div key={s.id}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium">{s.name} <span className="text-muted-foreground">· {s.category} · {s.proficiency}</span></span>
            <span className="font-semibold text-primary">{s.progress}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-primary-soft">
            <div className="h-2.5 rounded-full bg-gradient-brand" style={{ width: `${s.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
