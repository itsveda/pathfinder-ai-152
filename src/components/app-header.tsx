import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function AppHeader({ authed = false }: { authed?: boolean }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-primary/15 text-primary">
            <GraduationCap className="h-4 w-4" />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">PathPilot</span>
        </Link>
        <nav className="flex items-center gap-2">
          {authed ? (
            <>
              <Link to="/dashboard" className="text-sm px-3 py-1.5 rounded-md hover:bg-accent/60">
                Dashboard
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm px-3 py-1.5 rounded-md hover:bg-accent/60">
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}