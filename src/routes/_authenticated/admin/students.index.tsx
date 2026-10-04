import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, EmptyState, LoadingState } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/admin-guard";

export const Route = createFileRoute("/_authenticated/admin/students/")({
  beforeLoad: requireAdmin,
  head: () => ({ meta: [{ title: "Student Management — SkillTrack" }, { name: "description", content: "Search and manage student records." }] }),
  component: StudentsPage,
});

function StudentsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students")
        .select("*, skills(count), certificates(count), internships(count), applications(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Student record deleted"); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const term = q.toLowerCase();
  const rows = (data ?? []).filter((s) =>
    [s.full_name, s.email, s.college, s.course].some((v) => v?.toLowerCase().includes(term)));
  const n = (x: unknown) => (x as { count: number }[])?.[0]?.count ?? 0;

  return (
    <AppShell title="Student Management" subtitle="View, search and manage registered students.">
      <div className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, college or course…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-md" />
        </div>
        {isLoading ? <div className="p-5"><LoadingState /></div> : !rows.length ? <div className="p-5"><EmptyState text="No students found." /></div> : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>College</TableHead>
                  <TableHead>Course / Year</TableHead><TableHead>Skills</TableHead><TableHead>Certs</TableHead>
                  <TableHead>Internships</TableHead><TableHead>Apps</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.full_name}</TableCell>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>{s.college ?? "—"}</TableCell>
                    <TableCell>{s.course ?? "—"} · {s.year ?? "—"}</TableCell>
                    <TableCell>{n(s.skills)}</TableCell>
                    <TableCell>{n(s.certificates)}</TableCell>
                    <TableCell>{n(s.internships)}</TableCell>
                    <TableCell>{n(s.applications)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <Button asChild variant="ghost" size="icon" aria-label="View">
                        <Link to="/admin/students/$id" params={{ id: s.id }}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete"
                        onClick={() => { if (confirm(`Delete ${s.full_name}'s record and all their data?`)) remove.mutate(s.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
