import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, LoadingState } from "@/components/AppShell";
import { FormField, zodErrors } from "@/components/AuthCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAvatarUrl } from "@/lib/avatar";
import { profileSchema, YEARS } from "@/lib/schemas";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — SkillTrack" },
      { name: "description", content: "View and edit your profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data: p, isLoading } = useQuery({
    queryKey: ["student", user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
  const avatar = useAvatarUrl(p?.avatar_url);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", college: "", course: "", year: "" });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (p)
      setForm({
        full_name: p.full_name,
        phone: p.phone ?? "",
        college: p.college ?? "",
        course: p.course ?? "",
        year: p.year ?? "",
      });
  }, [p]);

  const save = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      const { error } = await supabase
        .from("students")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["student"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      return;
    }
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return;
    }
    await supabase.from("students").update({ avatar_url: path }).eq("id", user.id);
    toast.success("Profile picture updated");
    qc.invalidateQueries({ queryKey: ["student"] });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodErrors(parsed.error.issues));
    setErrors({});
    save.mutate(parsed.data);
  }

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  return (
    <AppShell
      title="My Profile"
      subtitle="Your personal and academic details."
      actions={
        !editing &&
        p && (
          <Button onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" /> Edit Profile
          </Button>
        )
      }
    >
      {isLoading || !p ? (
        <LoadingState />
      ) : (
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <div className="rounded-2xl border bg-card p-6 text-center shadow-card">
            <div className="relative mx-auto h-28 w-28">
              {avatar.data ? (
                <img
                  src={avatar.data}
                  alt="Profile"
                  className="h-28 w-28 rounded-full object-cover"
                />
              ) : (
                <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-brand text-3xl font-bold text-primary-foreground">
                  {p.full_name.charAt(0) || "S"}
                </div>
              )}
              <label
                className="absolute bottom-0 right-0 grid h-9 w-9 cursor-pointer place-items-center rounded-full border bg-card shadow-card"
                aria-label="Upload picture"
              >
                <Camera className="h-4 w-4 text-primary" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
                />
              </label>
            </div>
            <p className="mt-4 text-lg font-semibold">{p.full_name}</p>
            <p className="text-sm text-muted-foreground">{p.email}</p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            {editing ? (
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
                <FormField
                  id="full_name"
                  label="Full Name"
                  value={form.full_name}
                  onChange={set("full_name")}
                  error={errors.full_name}
                />
                <FormField
                  id="phone"
                  label="Phone"
                  value={form.phone}
                  onChange={set("phone")}
                  error={errors.phone}
                />
                <FormField
                  id="college"
                  label="College"
                  value={form.college}
                  onChange={set("college")}
                  error={errors.college}
                />
                <FormField
                  id="course"
                  label="Course"
                  value={form.course}
                  onChange={set("course")}
                  error={errors.course}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="year">Year</Label>
                  <select
                    id="year"
                    value={form.year}
                    onChange={set("year")}
                    className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm"
                  >
                    <option value="">Select</option>
                    {YEARS.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                  {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
                </div>
                <div className="flex items-end gap-2 sm:col-span-2">
                  <Button type="submit" disabled={save.isPending}>
                    {save.isPending ? "Saving…" : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="grid gap-5 sm:grid-cols-2">
                {[
                  ["Full Name", p.full_name],
                  ["Email", p.email],
                  ["Phone", p.phone],
                  ["College", p.college],
                  ["Course", p.course],
                  ["Year", p.year],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="mt-1 font-medium">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
