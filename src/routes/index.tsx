import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Briefcase, GraduationCap, LineChart, ShieldCheck, Sparkles, Target, UserPlus, ListChecks, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillTrack — Student Skill & Internship Management System" },
      { name: "description", content: "A centralized platform for students to manage skills, certificates, internships and career progress." },
      { property: "og:title", content: "SkillTrack — Build Your Skills. Get Career Ready." },
      { property: "og:description", content: "Manage skills, certificates, internships and applications in one place." },
    ],
  }),
  component: Home,
});

const features = [
  { icon: Sparkles, title: "Skills Tracking", text: "Add skills with category, proficiency level and progress percentage." },
  { icon: Award, title: "Certificate Management", text: "Store certificates with issuer, date, credential ID and link." },
  { icon: Briefcase, title: "Internship Tracking", text: "Record internships with company, role, dates, type and status." },
  { icon: TrendingUp, title: "Career Progress", text: "Track applications from Applied to Selected with visual charts." },
];

const steps = [
  { icon: UserPlus, title: "Register", text: "Create your student account with college details." },
  { icon: ListChecks, title: "Add your records", text: "Enter skills, certificates, internships and applications." },
  { icon: LineChart, title: "Track progress", text: "See your growth on the dashboard with charts." },
  { icon: Target, title: "Get career ready", text: "Admins review records and guide placement." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">SkillTrack</span>
        </div>
        <nav className="flex gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/login">Login</Link></Button>
          <Button asChild size="sm"><Link to="/register">Register</Link></Button>
        </nav>
      </header>

      <section className="bg-gradient-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              Student Skill & Internship Management System
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">
              Build Your Skills. Track Your Journey. <span className="text-primary">Get Career Ready.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              A centralized platform for students to manage skills, certificates, internships and career progress.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-glow"><Link to="/login">Student Login</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/register">Register</Link></Button>
              <Button asChild size="lg" variant="ghost"><Link to="/admin/login"><ShieldCheck className="h-4 w-4" /> Admin Login</Link></Button>
            </div>
          </div>
          <img src={hero} alt="Student tracking skills and internships" width={1024} height={1024}
            className="mx-auto w-full max-w-md rounded-3xl shadow-card" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center font-display text-3xl font-bold">Key Features</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">Everything a student needs to document and grow their career profile.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"><f.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center font-display text-3xl font-bold">How It Works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-card p-6 shadow-card">
                <p className="text-sm font-bold text-primary">Step {i + 1}</p>
                <s.icon className="mt-3 h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        SkillTrack · TY B.Sc. Computer Science Mini Project
      </footer>
    </div>
  );
}
