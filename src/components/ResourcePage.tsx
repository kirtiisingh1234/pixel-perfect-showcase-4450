import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ZodTypeAny } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, LoadingState } from "@/components/AppShell";

export type ResourceTable = "skills" | "certificates" | "internships" | "applications";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = any;

export type Field = {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "select" | "textarea" | "url";
  options?: readonly string[];
  placeholder?: string;
};

export type Column = {
  label: string;
  render: (row: Row, update: (patch: Record<string, unknown>) => void) => ReactNode;
};

export function useResource(table: ResourceTable, studentId: string) {
  return useQuery({
    queryKey: [table, studentId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(table)
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });
}

export function ResourceManager({
  table,
  singular,
  fields,
  schema,
  columns,
  defaults,
  header,
}: {
  table: ResourceTable;
  singular: string;
  fields: Field[];
  schema: ZodTypeAny;
  columns: Column[];
  defaults: Record<string, string>;
  header?: (rows: Row[]) => ReactNode;
}) {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const qc = useQueryClient();
  const { data: rows, isLoading, error } = useResource(table, user.id);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string>>(defaults);
  const [errors, setErrors] = useState<Record<string, any>>({});

  const save = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const q = (supabase as any).from(table);
      const { error } = editing
        ? await q.update(values).eq("id", editing.id)
        : await q.insert({ ...values, student_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${singular} ${editing ? "updated" : "added"}`);
      setOpen(false);
      qc.invalidateQueries({ queryKey: [table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await (supabase as any).from(table).update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: [table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${singular} deleted`);
      qc.invalidateQueries({ queryKey: [table] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditing(null);
    setForm(defaults);
    setErrors({});
    setOpen(true);
  }
  function openEdit(row: Row) {
    setEditing(row);
    setForm(
      Object.fromEntries(
        fields.map((f) => [f.name, row[f.name] == null ? "" : String(row[f.name])]),
      ),
    );
    setErrors({});
    setOpen(true);
  }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] ??= issue.message;
      setErrors(errs);
      return;
    }
    const values = Object.fromEntries(
      Object.entries(parsed.data as Record<string, unknown>).map(([k, v]) => [
        k,
        v === "" ? null : v,
      ]),
    );
    save.mutate(values);
  }

  return (
    <div className="space-y-6">
      {rows && header?.(rows)}
      <div className="rounded-2xl border bg-card shadow-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <p className="font-semibold">
            All {singular.toLowerCase()}s ({rows?.length ?? 0})
          </p>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Add {singular}
          </Button>
        </div>
        {isLoading ? (
          <div className="p-5">
            <LoadingState />
          </div>
        ) : error ? (
          <p className="p-5 text-sm text-destructive">{(error as Error).message}</p>
        ) : !rows?.length ? (
          <div className="p-5">
            <EmptyState
              text={`No ${singular.toLowerCase()}s yet. Click "Add ${singular}" to create one.`}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.label}>{c.label}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((c) => (
                      <TableCell key={c.label}>
                        {c.render(row, (values) => patch.mutate({ id: row.id, values }))}
                      </TableCell>
                    ))}
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => {
                          if (confirm(`Delete this ${singular.toLowerCase()}?`))
                            remove.mutate(row.id);
                        }}
                      >
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "Add"} {singular}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4" noValidate>
            {fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={f.name}>{f.label}</Label>
                {f.type === "select" ? (
                  <select
                    id={f.name}
                    value={form[f.name] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {f.options!.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <Textarea
                    id={f.name}
                    value={form[f.name] ?? ""}
                    placeholder={f.placeholder}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                ) : (
                  <Input
                    id={f.name}
                    type={f.type === "url" ? "url" : f.type}
                    value={form[f.name] ?? ""}
                    placeholder={f.placeholder}
                    min={f.type === "number" ? 0 : undefined}
                    max={f.type === "number" ? 100 : undefined}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                  />
                )}
                {errors[f.name] && <p className="text-xs text-destructive">{errors[f.name]}</p>}
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
