export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string
          created_by: string | null
          effective_from: string
          effective_to: string | null
          id: string
          mentor_external_id: string
          notes: string | null
          role: Database["public"]["Enums"]["mentor_role"]
          status: string
          student_external_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          mentor_external_id: string
          notes?: string | null
          role?: Database["public"]["Enums"]["mentor_role"]
          status?: string
          student_external_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          mentor_external_id?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["mentor_role"]
          status?: string
          student_external_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          new_values: Json | null
          old_values: Json | null
          timestamp: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      counseling_sessions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          name: string
          priority: string | null
          rejection_reason: string | null
          session_date: string
          session_type: string
          start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          name: string
          priority?: string | null
          rejection_reason?: string | null
          session_date: string
          session_type?: string
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          name?: string
          priority?: string | null
          rejection_reason?: string | null
          session_date?: string
          session_type?: string
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      goal_versions: {
        Row: {
          action_plan: string | null
          area_of_focus: string
          change_summary: string | null
          changed_at: string
          changed_by: string | null
          goal_id: string
          id: string
          knowledge_how: string | null
          knowledge_what: string | null
          previous_values: Json | null
          skills_how: string | null
          skills_what: string | null
          smart_goal_text: string
          status: Database["public"]["Enums"]["goal_status"]
          target_date: string | null
          version_number: number
        }
        Insert: {
          action_plan?: string | null
          area_of_focus: string
          change_summary?: string | null
          changed_at?: string
          changed_by?: string | null
          goal_id: string
          id?: string
          knowledge_how?: string | null
          knowledge_what?: string | null
          previous_values?: Json | null
          skills_how?: string | null
          skills_what?: string | null
          smart_goal_text: string
          status: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          version_number: number
        }
        Update: {
          action_plan?: string | null
          area_of_focus?: string
          change_summary?: string | null
          changed_at?: string
          changed_by?: string | null
          goal_id?: string
          id?: string
          knowledge_how?: string | null
          knowledge_what?: string | null
          previous_values?: Json | null
          skills_how?: string | null
          skills_what?: string | null
          smart_goal_text?: string
          status?: Database["public"]["Enums"]["goal_status"]
          target_date?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "goal_versions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          action_plan: string | null
          area_of_focus: string
          created_at: string
          created_by: string | null
          id: string
          knowledge_how: string | null
          knowledge_what: string | null
          session_id: string | null
          skills_how: string | null
          skills_what: string | null
          smart_goal_text: string
          status: Database["public"]["Enums"]["goal_status"]
          student_external_id: string
          target_date: string | null
          updated_at: string
          version_number: number
        }
        Insert: {
          action_plan?: string | null
          area_of_focus: string
          created_at?: string
          created_by?: string | null
          id?: string
          knowledge_how?: string | null
          knowledge_what?: string | null
          session_id?: string | null
          skills_how?: string | null
          skills_what?: string | null
          smart_goal_text: string
          status?: Database["public"]["Enums"]["goal_status"]
          student_external_id: string
          target_date?: string | null
          updated_at?: string
          version_number?: number
        }
        Update: {
          action_plan?: string | null
          area_of_focus?: string
          created_at?: string
          created_by?: string | null
          id?: string
          knowledge_how?: string | null
          knowledge_what?: string | null
          session_id?: string | null
          skills_how?: string | null
          skills_what?: string | null
          smart_goal_text?: string
          status?: Database["public"]["Enums"]["goal_status"]
          student_external_id?: string
          target_date?: string | null
          updated_at?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_goals_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "counseling_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_logs: {
        Row: {
          created_at: string
          created_by: string | null
          expected_outcome_next: string | null
          focus_of_meeting: string
          id: string
          next_session_datetime: string | null
          next_steps: string | null
          problems_encountered: string | null
          resolutions_discussed: string | null
          session_id: string
          updated_at: string
          updates_from_previous: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected_outcome_next?: string | null
          focus_of_meeting: string
          id?: string
          next_session_datetime?: string | null
          next_steps?: string | null
          problems_encountered?: string | null
          resolutions_discussed?: string | null
          session_id: string
          updated_at?: string
          updates_from_previous?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected_outcome_next?: string | null
          focus_of_meeting?: string
          id?: string
          next_session_datetime?: string | null
          next_steps?: string | null
          problems_encountered?: string | null
          resolutions_discussed?: string | null
          session_id?: string
          updated_at?: string
          updates_from_previous?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_meeting_logs_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "counseling_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_participants: {
        Row: {
          created_at: string
          id: string
          participation_status: string | null
          session_id: string
          student_external_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          participation_status?: string | null
          session_id: string
          student_external_id: string
        }
        Update: {
          created_at?: string
          id?: string
          participation_status?: string | null
          session_id?: string
          student_external_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "counseling_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          department: string | null
          display_name: string | null
          external_id: string | null
          id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          external_id?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          external_id?: string | null
          id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      assignment_mode: "app_managed" | "upstream_managed"
      goal_status: "proposed" | "in_progress" | "completed" | "archived"
      mentor_role: "primary" | "co_mentor"
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
    Enums: {
      assignment_mode: ["app_managed", "upstream_managed"],
      goal_status: ["proposed", "in_progress", "completed", "archived"],
      mentor_role: ["primary", "co_mentor"],
    },
  },
} as const
