import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateRecommendations } from "@/lib/recommendations.functions";
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

const EDUCATION = ["High school", "Undergraduate", "Graduate", "Self-taught", "Working professional"];

function Onboarding() {
  const navigate = useNavigate();
  const runRecs = useServerFn(generateRecommendations);
  const [displayName, setDisplayName] = useState("");
  const [education, setEducation] = useState("Undergraduate");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [goal, setGoal] = useState("");
  const [hours, setHours] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      if (p) {
        setDisplayName(p.display_name ?? "");
        setEducation(p.education_level ?? "Undergraduate");
        setSkills((p.skills ?? []).join(", "));
        setInterests((p.interests ?? []).join(", "));
        setGoal(p.career_goals ?? "");
        setHours(p.weekly_hours ?? 5);
      }
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").upsert({
        id: u.user.id,
        display_name: displayName,
        education_level: education,
        skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
        interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
        career_goals: goal,
        weekly_hours: hours,
      });
      if (error) throw error;
      toast.info("Generating your recommendations…");
      await runRecs({ data: undefined });
      toast.success("Your roadmap is ready");
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
      <main className="mx-auto max-w-2xl px-6 py-14">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 text-primary px-3 py-1 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" /> Tell Kindred about you
          </span>
          <h1 className="mt-4 font-serif text-4xl font-semibold">Your learning profile</h1>
          <p className="mt-2 text-muted-foreground">Two minutes now saves hours of scrolling later.</p>
        </div>

        <Card className="mt-8 p-6 border-border/70 shadow-[var(--shadow-soft)]">
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Preferred name</Label>
              <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label>Education level</Label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION.map((e) => (
                  <button
                    type="button"
                    key={e}
                    onClick={() => setEducation(e)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      education === e
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:bg-accent"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skills">Current skills</Label>
              <Input
                id="skills"
                placeholder="e.g. Python, statistics, writing"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Comma-separated. What you already know.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interests">Interests</Label>
              <Input
                id="interests"
                placeholder="e.g. machine learning, product design, biology"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal">Career goal</Label>
              <Textarea
                id="goal"
                rows={3}
                placeholder="e.g. Transition into a data scientist role at a healthcare startup"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Weekly study hours</Label>
                <span className="text-sm font-medium">{hours} hrs</span>
              </div>
              <Slider value={[hours]} onValueChange={(v) => setHours(v[0])} min={1} max={30} step={1} />
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Curating your roadmap…" : "Generate my roadmap"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}