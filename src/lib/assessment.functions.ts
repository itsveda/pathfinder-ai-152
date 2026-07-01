import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const SuggestionSchema = z.object({
  area: z.string(),
  action: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  timeframe: z.string(),
});

const RoadmapItemSchema = z.object({
  week: z.number().int().min(1).max(24),
  focus: z.string(),
  tasks: z.array(z.string()),
  outcome: z.string(),
});

const RoleSchema = z.object({
  role: z.string(),
  fit_score: z.number().int().min(0).max(100),
  why: z.string(),
  key_skills: z.array(z.string()),
});

const OutputSchema = z.object({
  readiness_score: z.number().int().min(0).max(100),
  verdict: z.string(),
  summary: z.string(),
  category_scores: z.object({
    academics: z.number().int().min(0).max(100),
    technical_skills: z.number().int().min(0).max(100),
    projects_experience: z.number().int().min(0).max(100),
    aptitude_communication: z.number().int().min(0).max(100),
    problem_solving: z.number().int().min(0).max(100),
  }),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  suggestions: z.array(SuggestionSchema),
  roadmap: z.array(RoadmapItemSchema),
  recommended_roles: z.array(RoleSchema),
  predicted_companies: z.array(z.string()),
});

export const generateAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const { supabase, userId } = context;

    const { data: profile, error: profileErr } = await supabase
      .from("placement_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (profileErr || !profile) throw new Error("Placement profile not found");

    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `You are an experienced campus placement coach at an Indian engineering / tier-1 university. Assess this student's placement readiness honestly and give an actionable improvement plan.

Student profile:
- Name: ${profile.full_name ?? "Student"}
- Degree: ${profile.degree ?? "n/a"} in ${profile.branch ?? "n/a"} (${profile.year_of_study ?? "n/a"})
- CGPA: ${profile.cgpa ?? "n/a"} / 10
- Class 10: ${profile.tenth_percent ?? "n/a"}%   Class 12: ${profile.twelfth_percent ?? "n/a"}%
- Active backlogs: ${profile.backlogs ?? 0}
- Technical skills: ${(profile.technical_skills ?? []).join(", ") || "none listed"}
- Soft skills: ${(profile.soft_skills ?? []).join(", ") || "none listed"}
- Projects completed: ${profile.projects_count ?? 0}
- Internships done: ${profile.internships_count ?? 0}
- Certifications: ${(profile.certifications ?? []).join(", ") || "none"}
- Coding platforms active on: ${(profile.coding_platforms ?? []).join(", ") || "none"}
- Target roles: ${(profile.target_roles ?? []).join(", ") || "unspecified"}
- Dream companies: ${profile.dream_companies ?? "unspecified"}
- Weekly prep hours available: ${profile.weekly_prep_hours ?? 10}

Instructions:
- readiness_score (0-100): honest overall placement readiness.
- verdict: one short phrase like "Placement-ready", "Almost ready", "Needs 3 months of focused prep", "Needs significant work".
- summary: 2-3 sentences addressed to the student.
- category_scores: score each dimension 0-100 based on the profile.
- strengths: 3-5 concrete strengths.
- gaps: 3-5 concrete, specific gaps (not vague).
- suggestions: 5-7 prioritised improvement actions. Each with area, concrete action, priority, timeframe.
- roadmap: 6-12 week plan. Each item = {week, focus, tasks (3-5 concrete tasks), outcome}.
- recommended_roles: 3-5 roles that fit the profile with fit_score, one-line why, and 3-5 key_skills each.
- predicted_companies: 5-10 realistic companies the student can target given profile.
Be honest and specific; do not sugar-coat. Reference the student's actual numbers.`;

    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({ schema: OutputSchema }),
      prompt,
    });

    const { error: insertErr } = await supabase.from("placement_assessments").insert({
      user_id: userId,
      readiness_score: output.readiness_score,
      verdict: output.verdict,
      summary: output.summary,
      category_scores: output.category_scores,
      strengths: output.strengths,
      gaps: output.gaps,
      suggestions: output.suggestions,
      roadmap: output.roadmap,
      recommended_roles: output.recommended_roles,
      predicted_companies: output.predicted_companies,
    });
    if (insertErr) throw new Error(insertErr.message);

    await supabase.from("placement_profiles").update({ onboarded: true }).eq("id", userId);

    return { ok: true, score: output.readiness_score };
  });