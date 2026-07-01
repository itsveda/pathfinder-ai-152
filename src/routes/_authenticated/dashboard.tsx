import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateRecommendations } from "@/lib/recommendations.functions";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Bookmark, BookmarkCheck, ExternalLink, RefreshCw, Search, Sparkles,
  CheckCircle2, Circle, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Course = {
  id: string; title: string; provider: string | null; description: string | null;
  level: string | null; duration: string | null; topics: string[] | null;
  match_reason: string | null; url: string | null; saved: boolean;
  progress: number; status: string; roadmap_step: number | null;
};

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const runRecs = useServerFn(generateRecommendations);
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("no user");
      const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).single();
      if (error) throw error;
      return data;
    },
  });

  const coursesQ = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("roadmap_step", { ascending: true });
      if (error) throw error;
      return data as Course[];
    },
  });

  useEffect(() => {
    if (profileQ.data && !profileQ.data.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profileQ.data, navigate]);

  const regen = useMutation({
    mutationFn: () => runRecs({ data: undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Fresh recommendations ready");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const courses = coursesQ.data ?? [];
  const filtered = courses.filter((c) => {
    const q = query.toLowerCase();
    const matchesQ = !q ||
      c.title.toLowerCase().includes(q) ||
      (c.provider ?? "").toLowerCase().includes(q) ||
      (c.topics ?? []).some((t) => t.toLowerCase().includes(q));
    const matchesLevel = !levelFilter || c.level === levelFilter;
    return matchesQ && matchesLevel;
  });

  const saved = courses.filter((c) => c.saved);
  const inProgress = courses.filter((c) => c.progress > 0 && c.progress < 100);
  const completed = courses.filter((c) => c.progress >= 100);
  const roadmap = [...courses].sort((a, b) => (a.roadmap_step ?? 99) - (b.roadmap_step ?? 99));

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <AppHeader authed />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="font-serif text-4xl font-semibold mt-1">
              {profileQ.data?.display_name ?? "Learner"}
            </h1>
            <p className="mt-1 text-muted-foreground max-w-xl">
              {profileQ.data?.career_goals ?? "Your personalized learning space"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/onboarding">Edit profile</Link>
            </Button>
            <Button onClick={() => regen.mutate()} disabled={regen.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${regen.isPending ? "animate-spin" : ""}`} />
              {regen.isPending ? "Curating…" : "Refresh recommendations"}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4 mt-8">
          <Stat label="Recommendations" value={courses.length} />
          <Stat label="Saved" value={saved.length} />
          <Stat label="In progress" value={inProgress.length} />
          <Stat label="Completed" value={completed.length} />
        </div>

        <Tabs defaultValue="recs" className="mt-10">
          <TabsList>
            <TabsTrigger value="recs">Recommendations</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="recs" className="mt-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search title, topic, or provider…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-1">
                {["Beginner", "Intermediate", "Advanced"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevelFilter(levelFilter === l ? null : l)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition ${
                      levelFilter === l ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-accent"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {coursesQ.isLoading ? (
              <EmptyState msg="Loading your recommendations…" />
            ) : filtered.length === 0 ? (
              <EmptyState msg={courses.length === 0 ? "No recommendations yet — hit refresh." : "No matches."} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 mt-6">
                {filtered.map((c) => <CourseCard key={c.id} c={c} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="roadmap" className="mt-6">
            {roadmap.length === 0 ? <EmptyState msg="Your roadmap will appear once you have recommendations." /> : (
              <div className="relative pl-8 space-y-4">
                <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
                {roadmap.map((c, i) => (
                  <div key={c.id} className="relative">
                    <div className="absolute -left-6 top-4 grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                      {c.roadmap_step ?? i + 1}
                    </div>
                    <CourseCard c={c} compact />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {saved.length === 0 ? <EmptyState msg="Tap the bookmark on any course to save it here." /> : (
              <div className="grid gap-4 md:grid-cols-2">
                {saved.map((c) => <CourseCard key={c.id} c={c} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-6 space-y-4">
            {inProgress.length + completed.length === 0 ? (
              <EmptyState msg="Mark a course started to see progress here." />
            ) : (
              <>
                {inProgress.map((c) => <ProgressRow key={c.id} c={c} />)}
                {completed.map((c) => <ProgressRow key={c.id} c={c} />)}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4 border-border/70">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-3xl font-semibold">{value}</div>
    </Card>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <Card className="p-10 text-center text-muted-foreground border-dashed">
      <Sparkles className="mx-auto h-6 w-6 mb-2 text-primary/70" />
      {msg}
    </Card>
  );
}

function CourseCard({ c, compact = false }: { c: Course; compact?: boolean }) {
  const qc = useQueryClient();
  async function update(patch: Partial<Course>) {
    const { error } = await supabase.from("courses").update(patch).eq("id", c.id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["courses"] });
  }
  return (
    <Card className={`p-5 border-border/70 bg-card/80 ${compact ? "" : "h-full"} flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">{c.provider}</div>
          <h3 className="font-serif text-lg font-semibold leading-snug mt-0.5">{c.title}</h3>
        </div>
        <button
          onClick={() => update({ saved: !c.saved })}
          className="p-1.5 rounded-md hover:bg-accent transition"
          aria-label={c.saved ? "Unsave" : "Save"}
        >
          {c.saved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5 text-muted-foreground" />}
        </button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{c.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {c.level && <Badge variant="secondary">{c.level}</Badge>}
        {c.duration && <Badge variant="secondary">{c.duration}</Badge>}
        {(c.topics ?? []).slice(0, 3).map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
      </div>

      {c.match_reason && (
        <div className="text-xs italic text-primary/90 border-l-2 border-primary/40 pl-3">
          {c.match_reason}
        </div>
      )}

      {c.progress > 0 && (
        <div>
          <Progress value={c.progress} />
          <div className="text-xs text-muted-foreground mt-1">{c.progress}% complete</div>
        </div>
      )}

      <div className="flex items-center gap-2 mt-auto pt-2">
        {c.url && (
          <Button size="sm" variant="outline" asChild>
            <a href={c.url} target="_blank" rel="noreferrer noopener">
              Open <ExternalLink className="h-3.5 w-3.5 ml-1" />
            </a>
          </Button>
        )}
        {c.progress === 0 ? (
          <Button size="sm" onClick={() => update({ progress: 10 })}>
            Start <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        ) : c.progress < 100 ? (
          <Button size="sm" variant="secondary" onClick={() => update({ progress: Math.min(100, c.progress + 25) })}>
            +25% progress
          </Button>
        ) : (
          <Badge className="bg-primary/15 text-primary border-primary/30">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completed
          </Badge>
        )}
      </div>
    </Card>
  );
}

function ProgressRow({ c }: { c: Course }) {
  const qc = useQueryClient();
  async function set(v: number) {
    const { error } = await supabase.from("courses").update({ progress: v }).eq("id", c.id);
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["courses"] });
  }
  return (
    <Card className="p-4 border-border/70 flex items-center gap-4">
      <div className="grid place-items-center h-9 w-9 rounded-full bg-accent">
        {c.progress >= 100 ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-primary/60" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate">
            <div className="font-medium truncate">{c.title}</div>
            <div className="text-xs text-muted-foreground">{c.provider}</div>
          </div>
          <div className="text-sm font-medium">{c.progress}%</div>
        </div>
        <Progress value={c.progress} className="mt-2" />
      </div>
      <div className="flex gap-1">
        {c.progress < 100 && (
          <Button size="sm" variant="secondary" onClick={() => set(Math.min(100, c.progress + 25))}>+25%</Button>
        )}
        {c.progress > 0 && c.progress < 100 && (
          <Button size="sm" variant="ghost" onClick={() => set(100)}>Mark done</Button>
        )}
      </div>
    </Card>
  );
}