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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      acknowledgments: {
        Row: {
          created_at: string
          id: number
          mystery_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          mystery_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          mystery_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acknowledgments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          admission_day: number | null
          admission_month: number | null
          created_at: string
          id: number
          name: string
        }
        Insert: {
          admission_day?: number | null
          admission_month?: number | null
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          admission_day?: number | null
          admission_month?: number | null
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      indulgence_days: {
        Row: {
          created_at: string
          day: number | null
          description: string | null
          id: number
          is_easter: boolean
          month: number | null
          name: string
          year: number | null
        }
        Insert: {
          created_at?: string
          day?: number | null
          description?: string | null
          id?: never
          is_easter?: boolean
          month?: number | null
          name: string
          year?: number | null
        }
        Update: {
          created_at?: string
          day?: number | null
          description?: string | null
          id?: never
          is_easter?: boolean
          month?: number | null
          name?: string
          year?: number | null
        }
        Relationships: []
      }
      intentions: {
        Row: {
          content: string
          created_at: string
          id: number
          month: number
          title: string | null
          year: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          month: number
          title?: string | null
          year: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          month?: number
          title?: string | null
          year?: number
        }
        Relationships: []
      }
      mysteries: {
        Row: {
          id: number
          image_url: string | null
          meditation: string | null
          name: string
          part: string
        }
        Insert: {
          id: number
          image_url?: string | null
          meditation?: string | null
          name: string
          part: string
        }
        Update: {
          id?: number
          image_url?: string | null
          meditation?: string | null
          name?: string
          part?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          group_id: number | null
          id: string
          login: string | null
          role: string | null
          rose_pos: number | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          group_id?: number | null
          id: string
          login?: string | null
          role?: string | null
          rose_pos?: number | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          group_id?: number | null
          id?: string
          login?: string | null
          role?: string | null
          rose_pos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      push_notification_log: {
        Row: {
          key: string
          sent_at: string
        }
        Insert: {
          key: string
          sent_at?: string
        }
        Update: {
          key?: string
          sent_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: number
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: never
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: never
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_members_overview: {
        Args: { p_group_id?: number }
        Returns: {
          acknowledged_at: string
          created_at: string
          current_mystery_id: number
          current_mystery_name: string
          full_name: string
          group_id: number
          group_name: string
          id: string
          login: string
          role: string
          rose_pos: number
        }[]
      }
      get_my_group_id: { Args: never; Returns: number }
      get_mystery_id_for_user: { Args: { p_user_id: string }; Returns: number }
      get_mystery_ids_for_users: {
        Args: { p_user_ids: string[] }
        Returns: {
          mystery_id: number
          user_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      move_user_to_group: {
        Args: { p_group_id: number; p_user_id: string }
        Returns: number
      }
      rotate_group_members: { Args: { p_group_id: number }; Returns: undefined }
      save_push_subscription: {
        Args: { p_auth: string; p_endpoint: string; p_p256dh: string }
        Returns: undefined
      }
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
