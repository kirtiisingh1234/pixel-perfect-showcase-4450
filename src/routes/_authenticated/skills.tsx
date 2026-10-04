import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ResourceManager } from "@/components/ResourcePage";
import { SkillChart } from "@/components/SkillChart";
import { PROFICIENCY, SKILL_CATEGORIES, skillSchema } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({ meta: [{ title: "My Skills — SkillTrack" }, { name: "description", content: "Manage your skills and progress." }] }),
  component: () => (
    <AppShell title="Skills" subtitle="Add skills with category, proficiency and progress.">
      <ResourceManager
        table="skills" singular="Skill" schema={skillSchema}
        defaults={{ name: "", category: "Programming", proficiency: "Beginner", progress: "50" }}
        fields={[
          { name: "name", label: "Skill Name", type: "text", placeholder: "e.g. Python" },
          { name: "category", label: "Category", type: "select", options: SKILL_CATEGORIES },
          { name: "proficiency", label: "Proficiency Level", type: "select", options: PROFICIENCY },
          { name: "progress", label: "Progress (%)", type: "number" },
        ]}
        columns={[
          { label: "Skill", render: (r) => <span className="font-medium">{r.name}</span> },
          { label: "Category", render: (r) => r.category },
          { label: "Proficiency", render: (r) => r.proficiency },
          { label: "Progress", render: (r) => (
            <div className="flex min-w-32 items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-primary-soft"><div className="h-2 rounded-full bg-gradient-brand" style={{ width: `${r.progress}%` }} /></div>
              <span className="text-xs font-semibold">{r.progress}%</span>
            </div>
          ) },
        ]}
        header={(rows) => rows.length > 0 && (
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <p className="mb-3 font-semibold">Skill Progress Chart</p>
            <SkillChart skills={rows} />
          </div>
        )}
      />
    </AppShell>
  ),
});
