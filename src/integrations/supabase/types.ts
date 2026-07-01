export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration: string | null
          id: string
          level: string | null
          match_reason: string | null
          progress: number
          provider: string | null
          roadmap_step: number | null
          saved: boolean
          status: string
          title: string
          topics: string[] | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          level?: string | null
          match_reason?: string | null
          progress?: number
          provider?: string | null
          roadmap_step?: number | null
          saved?: boolean
          status?: string
          title: string
          topics?: string[] | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          level?: string | null
          match_reason?: string | null
          progress?: number
          provider?: string | null
          roadmap_step?: number | null
          saved?: boolean
          status?: string
          title?: string
          topics?: string[] | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      placement_assessments: {
        Row: {
          category_scores: Json
          created_at: string
          gaps: string[]
          id: string
          predicted_companies: string[]
          readiness_score: number
          recommended_roles: Json
          roadmap: Json
          strengths: string[]
          suggestions: Json
          summary: string
          user_id: string
          verdict: string
        }
        Insert: {
          category_scores: Json
          created_at?: string
          gaps?: string[]
          id?: string
          predicted_companies?: string[]
          readiness_score: number
          recommended_roles: Json
          roadmap: Json
          strengths?: string[]
          suggestions: Json
          summary: string
          user_id: string
          verdict: string
        }
        Update: {
          category_scores?: Json
          created_at?: string
          gaps?: string[]
          id?: string
          predicted_companies?: string[]
          readiness_score?: number
          recommended_roles?: Json
          roadmap?: Json
          strengths?: string[]
          suggestions?: Json
          summary?: string
          user_id?: string
          verdict?: string
        }
        Relationships: []
      }
      placement_profiles: {
        Row: {
          backlogs: number | null
          branch: string | null
          certifications: string[] | null
          cgpa: number | null
          coding_platforms: string[] | null
          created_at: string
          degree: string | null
          dream_companies: string | null
          full_name: string | null
          id: string
          internships_count: number | null
          onboarded: boolean
          projects_count: number | null
          soft_skills: string[] | null
          target_roles: string[] | null
          technical_skills: string[] | null
          tenth_percent: number | null
          twelfth_percent: number | null
          updated_at: string
          weekly_prep_hours: number | null
          year_of_study: string | null
        }
        Insert: {
          backlogs?: number | null
          branch?: string | null
          certifications?: string[] | null
          cgpa?: number | null
          coding_platforms?: string[] | null
          created_at?: string
          degree?: string | null
          dream_companies?: string | null
          full_name?: string | null
          id: string
          internships_count?: number | null
          onboarded?: boolean
          projects_count?: number | null
          soft_skills?: string[] | null
          target_roles?: string[] | null
          technical_skills?: string[] | null
          tenth_percent?: number | null
          twelfth_percent?: number | null
          updated_at?: string
          weekly_prep_hours?: number | null
          year_of_study?: string | null
        }
        Update: {
          backlogs?: number | null
          branch?: string | null
          certifications?: string[] | null
          cgpa?: number | null
          coding_platforms?: string[] | null
          created_at?: string
          degree?: string | null
          dream_companies?: string | null
          full_name?: string | null
          id?: string
          internships_count?: number | null
          onboarded?: boolean
          projects_count?: number | null
          soft_skills?: string[] | null
          target_roles?: string[] | null
          technical_skills?: string[] | null
          tenth_percent?: number | null
          twelfth_percent?: number | null
          updated_at?: string
          weekly_prep_hours?: number | null
          year_of_study?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          career_goals: string | null
          created_at: string
          display_name: string | null
          education_level: string | null
          id: string
          interests: string[] | null
          onboarded: boolean
          skills: string[] | null
          updated_at: string
          weekly_hours: number | null
        }
        Insert: {
          career_goals?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          id: string
          interests?: string[] | null
          onboarded?: boolean
          skills?: string[] | null
          updated_at?: string
          weekly_hours?: number | null
        }
        Update: {
          career_goals?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          id?: string
          interests?: string[] | null
          onboarded?: boolean
          skills?: string[] | null
          updated_at?: string
          weekly_hours?: number | null
        }
        Relationships: []
      }
      roadmap_progress: {
        Row: {
          completed: boolean
          id: string
          task_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          id?: string
          task_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          id?: string
          task_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
