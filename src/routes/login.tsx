import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AuthCard, FormField, zodErrors } from "@/components/AuthCard";
import { loginSchema } from "@/lib/schemas";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Student Login — SkillTrack" },
      { name: "description", content: "Sign in to your SkillTrack student account." },
      { property: "og:title", content: "Student Login — SkillTrack" },
      { property: "og:description", content: "Sign in to manage your skills and internships." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, any>>({});
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
    if (roles?.some((r) => r.role === "admin")) {
      await supabase.auth.signOut();
      return toast.error("Admins must sign in from the Admin Login page");
    }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthCard title="Student Login" subtitle="Sign in to continue your journey."
      footer={<>New here? <Link to="/register" className="font-medium text-primary">Create an account</Link> · <Link to="/admin/login" className="font-medium text-primary">Admin login</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField id="email" label="Email" type="email" value={form.email} error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <FormField id="password" label="Password" type="password" value={form.password} error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
    </AuthCard>
  );
}
