import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthCard, FormField, zodErrors } from "@/components/AuthCard";
import { loginSchema } from "@/lib/schemas";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — SkillTrack" },
      { name: "description", content: "Administrator sign-in for SkillTrack." },
      { property: "og:title", content: "Admin Login — SkillTrack" },
      { property: "og:description", content: "Administrator access to student records." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodErrors(parsed.error.issues));
    setErrors({});
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) { setLoading(false); return toast.error("Invalid email or password"); }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    setLoading(false);
    if (!roles?.some((r) => r.role === "admin")) {
      await supabase.auth.signOut();
      return toast.error("Access denied: this account is not an administrator");
    }
    toast.success("Welcome, Admin");
    navigate({ to: "/admin/dashboard" });
  }

  return (
    <AuthCard title="Admin Login" subtitle="Restricted to college administrators."
      footer={<>Student? <Link to="/login" className="font-medium text-primary">Go to student login</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField id="email" label="Admin Email" type="email" value={form.email} error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <FormField id="password" label="Password" type="password" value={form.password} error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in as Admin"}</Button>
      </form>
    </AuthCard>
  );
}
