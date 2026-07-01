import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — PathPilot" },
      { name: "description", content: "Sign in or create a PathPilot account to get your AI placement readiness score and career roadmap." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Welcome! Let's set up your profile.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="min-h-screen grid place-items-center px-6" style={{ background: "var(--gradient-hero)" }}>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-primary/15 text-primary">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="font-serif text-xl font-semibold">PathPilot</span>
        </Link>
        <Card className="p-6 border-border/70 shadow-[var(--shadow-soft)]">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <Button variant="outline" className="w-full" onClick={google} type="button">
                <GoogleIcon /> Continue with Google
              </Button>
              <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> or {tab === "signin" ? "sign in" : "sign up"} with email <div className="h-px flex-1 bg-border" />
              </div>
            </div>

            <TabsContent value="signin" className="mt-0">
              <form onSubmit={submit} className="space-y-4">
                <Field label="Email" id="e1" type="email" value={email} onChange={setEmail} />
                <Field label="Password" id="p1" type="password" value={password} onChange={setPassword} />
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-0">
              <form onSubmit={submit} className="space-y-4">
                <Field label="Your name" id="n2" value={name} onChange={setName} />
                <Field label="Email" id="e2" type="email" value={email} onChange={setEmail} />
                <Field label="Password" id="p2" type="password" value={password} onChange={setPassword} />
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, id, type = "text", value, onChange }: {
  label: string; id: string; type?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} required />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.73-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.5l2.63-2.54C16.83 3.4 14.66 2.4 12 2.4 6.8 2.4 2.6 6.6 2.6 12s4.2 9.6 9.4 9.6c5.42 0 9-3.8 9-9.16 0-.62-.07-1.1-.16-1.54H12z" />
    </svg>
  );
}