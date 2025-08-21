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
          cancellation_reason: string | null
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
          cancellation_reason?: string | null
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
          cancellation_reason?: string | null
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
      departments: {
        Row: {
          created_at: string | null
          department_id: string
          department_name: string
          description: string | null
          id: string
          institution_id: string | null
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id: string
          department_name: string
          description?: string | null
          id?: string
          institution_id?: string | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string
          department_name?: string
          description?: string | null
          id?: string
          institution_id?: string | null
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
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
      institutions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          institution_id: string
          institution_name: string
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id: string
          institution_name: string
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string
          institution_name?: string
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      mentor_assignments: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          assignment_type: string | null
          created_at: string | null
          end_date: string | null
          id: string
          mentor_id: string
          notes: string | null
          status: string | null
          student_id: string
          student_name: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_date?: string | null
          assignment_type?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          mentor_id: string
          notes?: string | null
          status?: string | null
          student_id: string
          student_name?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_date?: string | null
          assignment_type?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          mentor_id?: string
          notes?: string | null
          status?: string | null
          student_id?: string
          student_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_feedback: {
        Row: {
          additional_support_needed: string | null
          challenges_faced: string | null
          created_at: string
          follow_up_required: boolean
          follow_up_timeline: string | null
          goals_achieved_rating: number
          id: string
          improvement_areas: string | null
          key_outcomes: string | null
          mentor_external_id: string
          mentor_reflection: string | null
          next_steps_recommended: string
          session_id: string
          session_quality_rating: number
          student_engagement_rating: number
          student_progress_notes: string
          updated_at: string
        }
        Insert: {
          additional_support_needed?: string | null
          challenges_faced?: string | null
          created_at?: string
          follow_up_required?: boolean
          follow_up_timeline?: string | null
          goals_achieved_rating: number
          id?: string
          improvement_areas?: string | null
          key_outcomes?: string | null
          mentor_external_id: string
          mentor_reflection?: string | null
          next_steps_recommended: string
          session_id: string
          session_quality_rating: number
          student_engagement_rating: number
          student_progress_notes: string
          updated_at?: string
        }
        Update: {
          additional_support_needed?: string | null
          challenges_faced?: string | null
          created_at?: string
          follow_up_required?: boolean
          follow_up_timeline?: string | null
          goals_achieved_rating?: number
          id?: string
          improvement_areas?: string | null
          key_outcomes?: string | null
          mentor_external_id?: string
          mentor_reflection?: string | null
          next_steps_recommended?: string
          session_id?: string
          session_quality_rating?: number
          student_engagement_rating?: number
          student_progress_notes?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_feed: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          in_app_notifications: boolean
          push_notifications: boolean
          session_invitations: boolean
          session_reminders: boolean
          session_updates: boolean
          updated_at: string
          user_external_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          push_notifications?: boolean
          session_invitations?: boolean
          session_reminders?: boolean
          session_updates?: boolean
          updated_at?: string
          user_external_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          push_notifications?: boolean
          session_invitations?: boolean
          session_reminders?: boolean
          session_updates?: boolean
          updated_at?: string
          user_external_id?: string
          user_type?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_required: boolean | null
          action_url: string | null
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_external_id: string
          user_type: string
        }
        Insert: {
          action_required?: boolean | null
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_external_id: string
          user_type: string
        }
        Update: {
          action_required?: boolean | null
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_external_id?: string
          user_type?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string | null
          department_id: string | null
          id: string
          institution_id: string | null
          program_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          institution_id?: string | null
          program_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          institution_id?: string | null
          program_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_system_role: boolean
          name: string
          permissions: Json
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean
          name: string
          permissions?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system_role?: boolean
          name?: string
          permissions?: Json
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_feedback: {
        Row: {
          comments: string | null
          created_at: string
          id: string
          improvement_suggestions: string | null
          mentee_external_id: string
          mentor_helpfulness: number
          overall_rating: number
          session_effectiveness: number
          session_id: string
          updated_at: string
          would_recommend: boolean
        }
        Insert: {
          comments?: string | null
          created_at?: string
          id?: string
          improvement_suggestions?: string | null
          mentee_external_id: string
          mentor_helpfulness: number
          overall_rating: number
          session_effectiveness: number
          session_id: string
          updated_at?: string
          would_recommend?: boolean
        }
        Update: {
          comments?: string | null
          created_at?: string
          id?: string
          improvement_suggestions?: string | null
          mentee_external_id?: string
          mentor_helpfulness?: number
          overall_rating?: number
          session_effectiveness?: number
          session_id?: string
          updated_at?: string
          would_recommend?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "session_feedback_session_id_fkey"
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
      staff: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          designation: string | null
          email: string
          id: string
          mobile: string | null
          name: string
          staff_id: string
          status: string | null
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email: string
          id?: string
          mobile?: string | null
          name: string
          staff_id: string
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string
          id?: string
          mobile?: string | null
          name?: string
          staff_id?: string
          status?: string | null
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string | null
          gpa: number | null
          id: string
          mobile: string | null
          name: string
          program: string | null
          roll_no: string | null
          semester_year: number | null
          status: string | null
          student_id: string
          synced_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          gpa?: number | null
          id?: string
          mobile?: string | null
          name: string
          program?: string | null
          roll_no?: string | null
          semester_year?: number | null
          status?: string | null
          student_id: string
          synced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          gpa?: number | null
          id?: string
          mobile?: string | null
          name?: string
          program?: string | null
          roll_no?: string | null
          semester_year?: number | null
          status?: string | null
          student_id?: string
          synced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          designation: string | null
          display_name: string | null
          email: string | null
          external_id: string | null
          id: string
          institution: string | null
          is_synced_from_staff: boolean | null
          last_login: string | null
          login_count: number | null
          mobile: string | null
          role: string
          staff_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          display_name?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          institution?: string | null
          is_synced_from_staff?: boolean | null
          last_login?: string | null
          login_count?: number | null
          mobile?: string | null
          role?: string
          staff_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          display_name?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          institution?: string | null
          is_synced_from_staff?: boolean | null
          last_login?: string | null
          login_count?: number | null
          mobile?: string | null
          role?: string
          staff_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_role_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          id: string
          role_id: string
          status: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          role_id: string
          status?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          role_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          errors: Json | null
          id: string
          sync_status: string | null
          sync_type: string
          users_created: number | null
          users_processed: number | null
          users_updated: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          errors?: Json | null
          id?: string
          sync_status?: string | null
          sync_type: string
          users_created?: number | null
          users_processed?: number | null
          users_updated?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          errors?: Json | null
          id?: string
          sync_status?: string | null
          sync_type?: string
          users_created?: number | null
          users_processed?: number | null
          users_updated?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      active_mentor_assignments: {
        Row: {
          assigned_by: string | null
          assigned_date: string | null
          assignment_type: string | null
          created_at: string | null
          end_date: string | null
          id: string | null
          mentor_department: string | null
          mentor_designation: string | null
          mentor_email: string | null
          mentor_id: string | null
          mentor_name: string | null
          notes: string | null
          status: string | null
          student_id: string | null
          student_name: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_assignments_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "staff_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      comprehensive_user_analytics: {
        Row: {
          activity_status: string | null
          department: string | null
          display_name: string | null
          external_id: string | null
          goals_created: number | null
          institution: string | null
          is_synced_from_staff: boolean | null
          joined_date: string | null
          last_login: string | null
          login_count: number | null
          recent_activity_count: number | null
          role: string | null
          sessions_created: number | null
          staff_id: string | null
          user_id: string | null
          user_type: string | null
        }
        Relationships: []
      }
      staff_directory: {
        Row: {
          avatar_url: string | null
          department: string | null
          designation: string | null
          id: string | null
          name: string | null
          staff_id: string | null
          status: string | null
        }
        Insert: {
          avatar_url?: string | null
          department?: string | null
          designation?: string | null
          id?: string | null
          name?: string | null
          staff_id?: string | null
          status?: string | null
        }
        Update: {
          avatar_url?: string | null
          department?: string | null
          designation?: string | null
          id?: string | null
          name?: string | null
          staff_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          activity_status: string | null
          department: string | null
          display_name: string | null
          goals_created: number | null
          id: string | null
          institution: string | null
          joined_date: string | null
          last_login: string | null
          login_count: number | null
          recent_activity_count: number | null
          role: string | null
          sessions_created: number | null
          user_id: string | null
        }
        Insert: {
          activity_status?: never
          department?: string | null
          display_name?: string | null
          goals_created?: never
          id?: string | null
          institution?: string | null
          joined_date?: string | null
          last_login?: string | null
          login_count?: number | null
          recent_activity_count?: never
          role?: string | null
          sessions_created?: never
          user_id?: string | null
        }
        Update: {
          activity_status?: never
          department?: string | null
          display_name?: string | null
          goals_created?: never
          id?: string | null
          institution?: string | null
          joined_date?: string | null
          last_login?: string | null
          login_count?: number | null
          recent_activity_count?: never
          role?: string | null
          sessions_created?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      change_user_role: {
        Args: { new_role: string; target_user_id: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { user_uuid?: string }
        Returns: Json
      }
      log_user_activity: {
        Args: {
          activity_data?: Json
          activity_type: string
          user_agent_string?: string
          user_ip?: string
        }
        Returns: undefined
      }
      make_user_admin: {
        Args: { target_email: string }
        Returns: boolean
      }
      set_user_role: {
        Args: { new_role: string; target_email: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: { permission_name: string; user_uuid?: string }
        Returns: boolean
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
