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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      calls: {
        Row: {
          agent_id: string | null
          call_metadata: Json | null
          campaign_id: string | null
          contact_id: string | null
          created_at: string
          direction: Database["public"]["Enums"]["call_direction"]
          disconnection_reason: string | null
          duration_seconds: number | null
          ended_at: string | null
          from_number: string | null
          id: string
          organization_id: string | null
          recording_url: string | null
          retell_call_id: string | null
          sentiment: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["call_status"]
          summary: string | null
          to_number: string | null
          transcript: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          call_metadata?: Json | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          direction: Database["public"]["Enums"]["call_direction"]
          disconnection_reason?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          organization_id?: string | null
          recording_url?: string | null
          retell_call_id?: string | null
          sentiment?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"]
          summary?: string | null
          to_number?: string | null
          transcript?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          call_metadata?: Json | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["call_direction"]
          disconnection_reason?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          organization_id?: string | null
          recording_url?: string | null
          retell_call_id?: string | null
          sentiment?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"]
          summary?: string | null
          to_number?: string | null
          transcript?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "voice_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contacts: {
        Row: {
          call_id: string | null
          call_status: Database["public"]["Enums"]["campaign_contact_status"]
          campaign_id: string
          contact_id: string
          created_at: string
          id: string
          in_flight: boolean | null
          updated_at: string
        }
        Insert: {
          call_id?: string | null
          call_status?: Database["public"]["Enums"]["campaign_contact_status"]
          campaign_id: string
          contact_id: string
          created_at?: string
          id?: string
          in_flight?: boolean | null
          updated_at?: string
        }
        Update: {
          call_id?: string | null
          call_status?: Database["public"]["Enums"]["campaign_contact_status"]
          campaign_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          in_flight?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          agent_id: string | null
          call_window_end: string | null
          call_window_start: string | null
          calls_completed: number
          completed_at: string | null
          created_at: string
          daily_cap: number | null
          description: string | null
          id: string
          max_concurrent_calls: number | null
          name: string
          organization_id: string | null
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          timezone: string | null
          total_contacts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          call_window_end?: string | null
          call_window_start?: string | null
          calls_completed?: number
          completed_at?: string | null
          created_at?: string
          daily_cap?: number | null
          description?: string | null
          id?: string
          max_concurrent_calls?: number | null
          name: string
          organization_id?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          timezone?: string | null
          total_contacts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          call_window_end?: string | null
          call_window_start?: string | null
          calls_completed?: number
          completed_at?: string | null
          created_at?: string
          daily_cap?: number | null
          description?: string | null
          id?: string
          max_concurrent_calls?: number | null
          name?: string
          organization_id?: string | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          timezone?: string | null
          total_contacts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "voice_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_agents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          phone_number: string | null
          retell_agent_id: string
          status: Database["public"]["Enums"]["agent_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          phone_number?: string | null
          retell_agent_id: string
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          phone_number?: string | null
          retell_agent_id?: string
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_campaign_contacts: {
        Args: { p_take?: number }
        Returns: {
          campaign_contact_id: string
          campaign_id: string
          contact_id: string
          first_name: string
          from_number: string
          last_name: string
          phone: string
          retell_agent_id: string
          user_id: string
        }[]
      }
      increment_calls_completed: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
      maybe_complete_campaign: {
        Args: { p_campaign_id: string }
        Returns: undefined
      }
    }
    Enums: {
      agent_status: "active" | "inactive" | "archived"
      call_direction: "inbound" | "outbound"
      call_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "failed"
        | "voicemail"
        | "no_answer"
      campaign_contact_status:
        | "pending"
        | "calling"
        | "completed"
        | "failed"
        | "skipped"
      campaign_status:
        | "draft"
        | "scheduled"
        | "in_progress"
        | "paused"
        | "completed"
        | "cancelled"
      user_role: "owner" | "admin" | "member"
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
      agent_status: ["active", "inactive", "archived"],
      call_direction: ["inbound", "outbound"],
      call_status: [
        "pending",
        "in_progress",
        "completed",
        "failed",
        "voicemail",
        "no_answer",
      ],
      campaign_contact_status: [
        "pending",
        "calling",
        "completed",
        "failed",
        "skipped",
      ],
      campaign_status: [
        "draft",
        "scheduled",
        "in_progress",
        "paused",
        "completed",
        "cancelled",
      ],
      user_role: ["owner", "admin", "member"],
    },
  },
} as const
