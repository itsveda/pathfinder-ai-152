import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const CourseSchema = z.object({
  title: z.string(),
  provider: z.string(),
  description: z.string(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  duration: z.string(),
  topics: z.array(z.string()),
  match_reason: z.string(),
  roadmap_step: z.number().int().min(1).max(8),
  url: z.string(),
});

const OutputSchema = z.object({ courses: z.array(CourseSchema) });

export const generateRecommendations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const { supabase, userId } = context;

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (profileErr || !profile) throw new Error("Profile not found");

    const gateway = createLovableAiGatewayProvider(key);
    const prompt = `You are an academic learning advisor. Recommend 8 online courses tailored to this learner.

Learner profile:
- Name: ${profile.display_name ?? "student"}
- Education level: ${profile.education_level ?? "unspecified"}
- Current skills: ${(profile.skills ?? []).join(", ") || "none listed"}
- Interests: ${(profile.interests ?? []).join(", ") || "none listed"}
- Career goal: ${profile.career_goals ?? "unspecified"}
- Weekly study hours available: ${profile.weekly_hours ?? 5}

Guidelines:
- Choose real, well-known courses from platforms like Coursera, edX, Udemy, freeCodeCamp, MIT OCW, Khan Academy, DataCamp, Kaggle.
- Order them as a progression: roadmap_step 1 is the first course to take, higher numbers build on earlier ones.
- match_reason: one sentence, explain why this course fits THIS learner (reference their skills/goal).
- level and duration should be honest for the specific course.
- url: the course landing page URL (best guess is fine; must be a plausible https URL).
- topics: 3-6 concise topic tags.`;

    const { output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      output: Output.object({ schema: OutputSchema }),
      prompt,
    });

    // Wipe previous suggestions (keep saved & in-progress ones)
    await supabase
      .from("courses")
      .delete()
      .eq("user_id", userId)
      .eq("saved", false)
      .eq("status", "suggested");

    const rows = output.courses.map((c) => ({
      user_id: userId,
      title: c.title,
      provider: c.provider,
      description: c.description,
      level: c.level,
      duration: c.duration,
      topics: c.topics,
      match_reason: c.match_reason,
      roadmap_step: c.roadmap_step,
      url: c.url,
      status: "suggested",
    }));

    const { error: insertErr } = await supabase.from("courses").insert(rows);
    if (insertErr) throw new Error(insertErr.message);

    await supabase.from("profiles").update({ onboarded: true }).eq("id", userId);

    return { count: rows.length };
  });