import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles, ArrowRight, Gauge, Target, Route as RouteIcon,
  BarChart3, Briefcase, GraduationCap, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <AppHeader />
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 grid gap-16 lg:grid-cols-[1.1fr_.9fr] items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 text-primary px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> AI placement coach
            </span>
            <h1 className="mt-6 font-serif text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              Know if you're <em className="italic text-primary">placement-ready</em> — and exactly what to fix.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              PathPilot analyses your academics, projects, skills and coding practice, then predicts
              your campus placement readiness with a personalised improvement plan and week-by-week roadmap.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Get my readiness score <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how">How it works</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free to try · Email or Google sign-in · Built for engineering & tech students
            </p>
          </div>

          <Card className="p-6 bg-card/80 backdrop-blur border-border/70 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
                <Gauge className="h-3.5 w-3.5" /> Readiness snapshot
              </div>
              <span className="text-xs text-primary font-medium">Sample</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-serif text-6xl font-semibold text-primary">72</span>
              <span className="text-muted-foreground">/ 100</span>
            </div>
            <div className="text-sm font-semibold">Almost placement-ready</div>
            <div className="mt-5 space-y-3">
              {[
                { k: "Academics", v: 85 },
                { k: "Technical skills", v: 68 },
                { k: "Projects & experience", v: 60 },
                { k: "Problem solving", v: 74 },
              ].map((row) => (
                <div key={row.k}>
                  <div className="flex justify-between text-xs">
                    <span>{row.k}</span><span className="font-medium">{row.v}</span>
                  </div>
                  <Progress value={row.v} className="mt-1" />
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-border/60 text-xs text-muted-foreground">
              <span className="text-primary font-semibold">Next up:</span> Solve 50 DSA mediums · Ship 1 full-stack project · Practice HR interview loop
            </div>
          </Card>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 text-primary px-3 py-1 text-xs font-medium">
              How it works
            </span>
            <h2 className="mt-4 font-serif text-3xl md:text-4xl font-semibold">
              From profile → prediction → placement.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { i: GraduationCap, t: "1. Build your profile", d: "CGPA, backlogs, technical & soft skills, projects, internships, coding platforms, target roles and dream companies." },
              { i: BarChart3, t: "2. Get your prediction", d: "AI scores your placement readiness across 5 dimensions and gives an honest verdict with strengths and gaps." },
              { i: RouteIcon, t: "3. Follow the roadmap", d: "A week-by-week prep plan with concrete tasks. Tick them off in your dashboard as you progress." },
            ].map(({ i: Icon, t, d }) => (
              <Card key={t} className="p-6 bg-card/70 border-border/70">
                <div className="h-10 w-10 rounded-lg bg-accent grid place-items-center text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
              </Card>
            ))}
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-4">
            {[
              { i: Gauge, t: "Readiness score", d: "0–100, category-wise" },
              { i: Target, t: "Gap analysis", d: "Specific, not vague" },
              { i: RouteIcon, t: "12-week roadmap", d: "Tasks you can tick off" },
              { i: Briefcase, t: "Company shortlist", d: "Realistic targets" },
            ].map(({ i: Icon, t, d }) => (
              <div key={t} className="p-4 rounded-xl border border-border/60 bg-card/60 flex items-start gap-3">
                <Icon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">{t}</div>
                  <div className="text-xs text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl p-10 border border-border/60 bg-card/70 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-4 font-serif text-2xl font-semibold">Stop guessing your placement chances.</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Build your profile in under three minutes and get an honest AI readiness report today.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link to="/auth">Create your account</Link>
            </Button>
          </div>
        </section>

        <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} PathPilot · AI placement guidance for students
        </footer>
      </main>
    </div>
  );
}
