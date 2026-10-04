import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthCard, FormField, zodErrors } from "@/components/AuthCard";
import { registerSchema, YEARS } from "@/lib/schemas";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Student Registration — SkillTrack" },
      { name: "description", content: "Create your SkillTrack student account." },
      { property: "og:title", content: "Student Registration — SkillTrack" },
      { property: "og:description", content: "Register to track skills, certificates and internships." },
    ],
  }),
  component: RegisterPage,
});

const empty = { full_name: "", email: "", password: "", phone: "", college: "", course: "", year: "" };

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) return setErrors(zodErrors(parsed.error.issues));
    setErrors({});
    setLoading(true);
    const { email, password, ...meta } = parsed.data;
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: meta, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!data.session) {
      toast.success("Account created! Check your email to confirm, then log in.");
      return navigate({ to: "/login" });
    }
    toast.success("Registration successful!");
    navigate({ to: "/dashboard" });
  }

  return (
    <AuthCard title="Student Registration" subtitle="Create your account in under a minute."
      footer={<>Already registered? <Link to="/login" className="font-medium text-primary">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormField id="full_name" label="Full Name" value={form.full_name} onChange={set("full_name")} error={errors.full_name} />
        <FormField id="email" label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
        <FormField id="password" label="Password" type="password" value={form.password} onChange={set("password")}
          error={errors.password} placeholder="Min 8 chars, letters & numbers" />
        <FormField id="phone" label="Phone" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="10-digit mobile" />
        <FormField id="college" label="College" value={form.college} onChange={set("college")} error={errors.college} />
        <div className="grid grid-cols-2 gap-3">
          <FormField id="course" label="Course" value={form.course} onChange={set("course")} error={errors.course} placeholder="B.Sc. CS" />
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <select id="year" value={form.year} onChange={set("year")}
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account…" : "Register"}</Button>
      </form>
    </AuthCard>
  );
}
