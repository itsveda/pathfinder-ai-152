import { createFileRoute, Link } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Compass, Route as RouteIcon, Sparkles, BookmarkCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <AppHeader />
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-24 grid gap-16 lg:grid-cols-[1.15fr_.85fr] items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 text-primary px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" /> AI learning companion
            </span>
            <h1 className="mt-6 font-serif text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
              A quieter way to <em className="italic text-primary">learn what matters</em> next.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Tell Kindred about your skills, curiosities, and goals. It curates a personal
              course roadmap — thoughtfully sequenced, honestly matched, and easy to keep up with.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth">
                  Start your roadmap <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how">How it works</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free to try · Email or Google sign-in · No credit card
            </p>
          </div>

          <Card className="p-6 bg-card/80 backdrop-blur border-border/70 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Your roadmap · preview
            </div>
            <div className="mt-4 space-y-3">
              {[
                { s: 1, t: "Python for Everybody", p: "Coursera · 4 weeks" },
                { s: 2, t: "Intro to Data Analysis", p: "DataCamp · 6 weeks" },
                { s: 3, t: "SQL for Data Science", p: "edX · 5 weeks" },
                { s: 4, t: "Applied ML with Python", p: "Coursera · 8 weeks" },
              ].map((c) => (
                <div key={c.s} className="flex items-start gap-3 p-3 rounded-lg bg-parchment/60 border border-border/60">
                  <div className="grid place-items-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {c.s}
                  </div>
                  <div>
                    <div className="font-medium">{c.t}</div>
                    <div className="text-xs text-muted-foreground">{c.p}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center">
            Personal in three steps.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { i: Compass, t: "Share your context", d: "Skills, interests, education, career goal, and how much time you actually have each week." },
              { i: Sparkles, t: "Get matched courses", d: "AI curates real courses from Coursera, edX, MIT OCW and more — with an honest reason for each pick." },
              { i: RouteIcon, t: "Follow a roadmap", d: "A sequenced learning path. Save what interests you, track progress, and adjust as you grow." },
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

          <div className="mt-16 rounded-2xl p-10 border border-border/60 bg-card/70 text-center">
            <BookmarkCheck className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-4 font-serif text-2xl font-semibold">Ready to begin?</h3>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Build your profile in under two minutes and let Kindred suggest what to learn next.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link to="/auth">Create your account</Link>
            </Button>
          </div>
        </section>

        <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kindred · A calm way to learn
        </footer>
      </main>
    </div>
  );
}
