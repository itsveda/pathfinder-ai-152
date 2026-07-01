import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateAssessment } from "@/lib/assessment.functions";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  RefreshCw, Sparkles, CheckCircle2, Circle, TrendingUp, Target,
  Briefcase, AlertTriangle, ArrowUpRight, Lightbulb,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Suggestion = { area: string; action: string; priority: "high" | "medium" | "low"; timeframe: string };
type RoadmapItem = { week: number; focus: string; tasks: string[]; outcome: string };
type Role = { role: string; fit_score: number; why: string; key_skills: string[] };
type CategoryScores = {
  academics: number; technical_skills: number; projects_experience: number;
  aptitude_communication: number; problem_solving: number;
};

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const runAssessment = useServerFn(generateAssessment);

  const profileQ = useQuery({
    queryKey: ["placement_profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("no user");
      const { data, error } = await supabase.from("placement_profiles").select("*").eq("id", u.user.id).single();
      if (error) throw error;
      return data;
    },
  });

  const assessmentQ = useQuery({
    queryKey: ["latest_assessment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("placement_assessments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const progressQ = useQuery({
    queryKey: ["roadmap_progress"],
    queryFn: async () => {
      const { data, error } = await supabase.from("roadmap_progress").select("*");
      if (error) throw error;
      return data as { task_key: string; completed: boolean }[];
    },
  });

  useEffect(() => {
    if (profileQ.data && !profileQ.data.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profileQ.data, navigate]);

  const regen = useMutation({
    mutationFn: () => runAssessment({ data: undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["latest_assessment"] });
      toast.success("Fresh placement assessment generated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const a = assessmentQ.data;
  const p = profileQ.data;
  const cs = (a?.category_scores ?? null) as CategoryScores | null;
  const suggestions = (a?.suggestions ?? []) as Suggestion[];
  const roadmap = (a?.roadmap ?? []) as RoadmapItem[];
  const roles = (a?.recommended_roles ?? []) as Role[];
  const completedMap = new Map((progressQ.data ?? []).map((r) => [r.task_key, r.completed]));
  const totalTasks = roadmap.reduce((sum, r) => sum + r.tasks.length, 0);
  const doneTasks = roadmap.reduce(
    (sum, r) => sum + r.tasks.filter((_, i) => completedMap.get(`${r.week}:${i}`)).length,
    0,
  );
  const roadmapPct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  async function toggleTask(week: number, i: number) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const key = `${week}:${i}`;
    const current = completedMap.get(key) ?? false;
    const { error } = await supabase
      .from("roadmap_progress")
      .upsert({ user_id: u.user.id, task_key: key, completed: !current }, { onConflict: "user_id,task_key" });
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["roadmap_progress"] });
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <AppHeader authed />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Placement dashboard</p>
            <h1 className="font-serif text-4xl font-semibold mt-1">Hi, {p?.full_name ?? "student"}</h1>
            <p className="mt-1 text-muted-foreground max-w-xl">
              {p?.degree} {p?.branch} · {p?.year_of_study}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/onboarding">Edit profile</Link>
            </Button>
            <Button onClick={() => regen.mutate()} disabled={regen.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${regen.isPending ? "animate-spin" : ""}`} />
              {regen.isPending ? "Re-assessing…" : "Re-run assessment"}
            </Button>
          </div>
        </div>

        {!a ? (
          <EmptyState msg="No assessment yet. Complete your profile to generate one." />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3 mt-8">
              <ScoreCard score={a.readiness_score} verdict={a.verdict} summary={a.summary} />
              <Card className="p-5 border-border/70 md:col-span-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" /> Category breakdown
                </div>
                <div className="mt-4 space-y-3">
                  {cs && (Object.entries(cs) as [keyof CategoryScores, number][]).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{k.replaceAll("_", " ")}</span>
                        <span className="font-medium">{v}</span>
                      </div>
                      <Progress value={v} className="mt-1" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Tabs defaultValue="insights" className="mt-10">
              <TabsList>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="suggestions">Improvements</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="careers">Careers</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="mt-6 grid gap-4 md:grid-cols-2">
                <Card className="p-5 border-border/70">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-semibold">Strengths</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {a.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2"><span className="text-primary">•</span>{s}</li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-5 border-border/70">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Gaps to close</span>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {a.gaps.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2"><span className="text-destructive">•</span>{s}</li>
                    ))}
                  </ul>
                </Card>
                <Card className="p-5 border-border/70 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" /> Companies to target
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {a.predicted_companies.map((c: string) => (
                      <Badge key={c} variant="secondary" className="text-sm">{c}</Badge>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-6 grid gap-3 md:grid-cols-2">
                {suggestions.map((s, i) => (
                  <Card key={i} className="p-5 border-border/70">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="grid place-items-center h-8 w-8 rounded-lg bg-accent text-accent-foreground">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <div className="font-semibold">{s.area}</div>
                      </div>
                      <PriorityBadge priority={s.priority} />
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.action}</p>
                    <p className="mt-2 text-xs text-primary">⏱ {s.timeframe}</p>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="roadmap" className="mt-6">
                <Card className="p-5 border-border/70 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall progress</div>
                      <div className="mt-1 font-serif text-2xl font-semibold">{doneTasks} / {totalTasks} tasks</div>
                    </div>
                    <div className="text-3xl font-serif font-semibold text-primary">{roadmapPct}%</div>
                  </div>
                  <Progress value={roadmapPct} className="mt-3" />
                </Card>
                <div className="relative pl-8 space-y-4">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
                  {roadmap.map((r) => (
                    <div key={r.week} className="relative">
                      <div className="absolute -left-6 top-4 grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {r.week}
                      </div>
                      <Card className="p-5 border-border/70">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <div>
                            <div className="text-xs uppercase tracking-widest text-muted-foreground">Week {r.week}</div>
                            <h3 className="font-serif text-lg font-semibold">{r.focus}</h3>
                          </div>
                          <div className="text-xs text-primary italic">→ {r.outcome}</div>
                        </div>
                        <ul className="mt-3 space-y-1.5">
                          {r.tasks.map((t, i) => {
                            const key = `${r.week}:${i}`;
                            const done = completedMap.get(key) ?? false;
                            return (
                              <li key={i}>
                                <button
                                  onClick={() => toggleTask(r.week, i)}
                                  className="flex items-start gap-2 text-left text-sm w-full hover:bg-accent/40 rounded p-1.5 transition"
                                >
                                  {done ? (
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                  )}
                                  <span className={done ? "line-through text-muted-foreground" : ""}>{t}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </Card>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="careers" className="mt-6 grid gap-4 md:grid-cols-2">
                {roles.map((r, i) => (
                  <Card key={i} className="p-5 border-border/70">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <h3 className="font-serif text-lg font-semibold">{r.role}</h3>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.why}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-serif text-2xl font-semibold text-primary">{r.fit_score}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">fit</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {r.key_skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}

function ScoreCard({ score, verdict, summary }: { score: number; verdict: string; summary: string }) {
  const tone = score >= 75 ? "text-primary" : score >= 50 ? "text-accent-foreground" : "text-destructive";
  return (
    <Card className="p-6 border-border/70 bg-gradient-to-br from-card to-accent/30">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <ArrowUpRight className="h-3.5 w-3.5" /> Placement readiness
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`font-serif text-6xl font-semibold ${tone}`}>{score}</span>
        <span className="text-muted-foreground">/ 100</span>
      </div>
      <div className="mt-1 font-semibold">{verdict}</div>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{summary}</p>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const map = {
    high: "bg-destructive/15 text-destructive border-destructive/30",
    medium: "bg-accent text-accent-foreground border-accent",
    low: "bg-muted text-muted-foreground border-border",
  };
  return <Badge className={`${map[priority]} border`}>{priority}</Badge>;
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <Card className="p-10 mt-10 text-center text-muted-foreground border-dashed">
      <Sparkles className="mx-auto h-6 w-6 mb-2 text-primary/70" />
      {msg}
    </Card>
  );
}