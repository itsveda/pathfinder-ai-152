import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateAssessment } from "@/lib/assessment.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { AppHeader } from "@/components/app-header";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const DEGREES = ["B.Tech", "B.E.", "B.Sc", "BCA", "MCA", "M.Tech", "MBA", "Other"];
const YEARS = ["1st year", "2nd year", "3rd year", "Pre-final year", "Final year", "Graduated"];

function toList(s: string) {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

function Onboarding() {
  const navigate = useNavigate();
  const runAssessment = useServerFn(generateAssessment);

  const [fullName, setFullName] = useState("");
  const [degree, setDegree] = useState("B.Tech");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("Pre-final year");
  const [cgpa, setCgpa] = useState("");
  const [tenth, setTenth] = useState("");
  const [twelfth, setTwelfth] = useState("");
  const [backlogs, setBacklogs] = useState(0);
  const [tech, setTech] = useState("");
  const [soft, setSoft] = useState("");
  const [projects, setProjects] = useState(0);
  const [internships, setInternships] = useState(0);
  const [certs, setCerts] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [roles, setRoles] = useState("");
  const [companies, setCompanies] = useState("");
  const [hours, setHours] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("placement_profiles").select("*").eq("id", data.user.id).single();
      if (!p) return;
      setFullName(p.full_name ?? "");
      setDegree(p.degree ?? "B.Tech");
      setBranch(p.branch ?? "");
      setYear(p.year_of_study ?? "Pre-final year");
      setCgpa(p.cgpa != null ? String(p.cgpa) : "");
      setTenth(p.tenth_percent != null ? String(p.tenth_percent) : "");
      setTwelfth(p.twelfth_percent != null ? String(p.twelfth_percent) : "");
      setBacklogs(p.backlogs ?? 0);
      setTech((p.technical_skills ?? []).join(", "));
      setSoft((p.soft_skills ?? []).join(", "));
      setProjects(p.projects_count ?? 0);
      setInternships(p.internships_count ?? 0);
      setCerts((p.certifications ?? []).join(", "));
      setPlatforms((p.coding_platforms ?? []).join(", "));
      setRoles((p.target_roles ?? []).join(", "));
      setCompanies(p.dream_companies ?? "");
      setHours(p.weekly_prep_hours ?? 10);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("placement_profiles").upsert({
        id: u.user.id,
        full_name: fullName,
        degree,
        branch,
        year_of_study: year,
        cgpa: cgpa ? Number(cgpa) : null,
        tenth_percent: tenth ? Number(tenth) : null,
        twelfth_percent: twelfth ? Number(twelfth) : null,
        backlogs,
        technical_skills: toList(tech),
        soft_skills: toList(soft),
        projects_count: projects,
        internships_count: internships,
        certifications: toList(certs),
        coding_platforms: toList(platforms),
        target_roles: toList(roles),
        dream_companies: companies,
        weekly_prep_hours: hours,
      });
      if (error) throw error;
      toast.info("Running your placement readiness assessment…");
      await runAssessment({ data: undefined });
      toast.success("Your placement readiness report is ready");
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <AppHeader authed />
      <main className="mx-auto max-w-3xl px-6 py-14">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 text-primary px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Placement profile
          </span>
          <h1 className="mt-4 font-serif text-4xl font-semibold">Tell us about your candidature</h1>
          <p className="mt-2 text-muted-foreground">A few honest inputs → an AI placement readiness score, gap analysis, and 12-week prep roadmap.</p>
        </div>

        <Card className="mt-8 p-6 border-border/70 shadow-[var(--shadow-soft)]">
          <form onSubmit={submit} className="space-y-6">
            <Section title="About you">
              <Field label="Full name">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Degree">
                  <div className="flex flex-wrap gap-1.5">
                    {DEGREES.map((d) => (
                      <Chip key={d} active={degree === d} onClick={() => setDegree(d)}>{d}</Chip>
                    ))}
                  </div>
                </Field>
                <Field label="Branch / specialisation">
                  <Input placeholder="e.g. Computer Science" value={branch} onChange={(e) => setBranch(e.target.value)} required />
                </Field>
              </div>
              <Field label="Year of study">
                <div className="flex flex-wrap gap-1.5">
                  {YEARS.map((y) => (
                    <Chip key={y} active={year === y} onClick={() => setYear(y)}>{y}</Chip>
                  ))}
                </div>
              </Field>
            </Section>

            <Section title="Academics">
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="CGPA (out of 10)">
                  <Input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="8.2" />
                </Field>
                <Field label="Class 10 %">
                  <Input type="number" step="0.01" min="0" max="100" value={tenth} onChange={(e) => setTenth(e.target.value)} placeholder="88" />
                </Field>
                <Field label="Class 12 %">
                  <Input type="number" step="0.01" min="0" max="100" value={twelfth} onChange={(e) => setTwelfth(e.target.value)} placeholder="85" />
                </Field>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Active backlogs</Label>
                  <span className="text-sm font-medium">{backlogs}</span>
                </div>
                <Slider value={[backlogs]} onValueChange={(v) => setBacklogs(v[0])} min={0} max={10} step={1} />
              </div>
            </Section>

            <Section title="Skills & experience">
              <Field label="Technical skills" hint="Comma separated. Languages, frameworks, tools.">
                <Input placeholder="e.g. Python, DSA, React, SQL, AWS" value={tech} onChange={(e) => setTech(e.target.value)} />
              </Field>
              <Field label="Soft skills" hint="Comma separated.">
                <Input placeholder="e.g. communication, teamwork, leadership" value={soft} onChange={(e) => setSoft(e.target.value)} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>Projects built</Label><span className="text-sm font-medium">{projects}</span></div>
                  <Slider value={[projects]} onValueChange={(v) => setProjects(v[0])} min={0} max={15} step={1} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><Label>Internships</Label><span className="text-sm font-medium">{internships}</span></div>
                  <Slider value={[internships]} onValueChange={(v) => setInternships(v[0])} min={0} max={5} step={1} />
                </div>
              </div>
              <Field label="Certifications" hint="e.g. AWS CCP, Google Data Analytics">
                <Input value={certs} onChange={(e) => setCerts(e.target.value)} />
              </Field>
              <Field label="Coding platforms active on" hint="LeetCode, CodeChef, Codeforces, HackerRank, etc.">
                <Input value={platforms} onChange={(e) => setPlatforms(e.target.value)} />
              </Field>
            </Section>

            <Section title="Placement goals">
              <Field label="Target roles" hint="Comma separated.">
                <Input placeholder="e.g. SDE, Data Analyst, Product Manager" value={roles} onChange={(e) => setRoles(e.target.value)} />
              </Field>
              <Field label="Dream companies">
                <Textarea rows={2} placeholder="e.g. Google, Microsoft, Zoho, TCS Digital" value={companies} onChange={(e) => setCompanies(e.target.value)} />
              </Field>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Weekly prep hours available</Label>
                  <span className="text-sm font-medium">{hours} hrs</span>
                </div>
                <Slider value={[hours]} onValueChange={(v) => setHours(v[0])} min={1} max={40} step={1} />
              </div>
            </Section>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Assessing placement readiness…" : "Generate my placement report"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{title}</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition ${
        active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}