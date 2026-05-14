export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      certifications: {
        Row: {
          cert_file_url: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          is_verified: boolean | null
          issue_date: string | null
          issuing_body: string | null
          name: string
          trainer_id: string | null
        }
        Insert: {
          cert_file_url?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          issuing_body?: string | null
          name: string
          trainer_id?: string | null
        }
        Update: {
          cert_file_url?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          issuing_body?: string | null
          name?: string
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          delivery_mode: string | null
          description: string | null
          duration_hours: number | null
          id: string
          is_hrdf_claimable: boolean | null
          price_per_pax: number | null
          title: string
          topic_id: string | null
          trainer_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_mode?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_hrdf_claimable?: boolean | null
          price_per_pax?: number | null
          title: string
          topic_id?: string | null
          trainer_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_mode?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_hrdf_claimable?: boolean | null
          price_per_pax?: number | null
          title?: string
          topic_id?: string | null
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      industries: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          company_name: string | null
          company_user_id: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string | null
          delivery_mode: string | null
          id: string
          message: string
          pax_count: number | null
          preferred_date: string | null
          status: string | null
          trainer_id: string | null
          training_topic: string | null
        }
        Insert: {
          company_name?: string | null
          company_user_id?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string | null
          delivery_mode?: string | null
          id?: string
          message: string
          pax_count?: number | null
          preferred_date?: string | null
          status?: string | null
          trainer_id?: string | null
          training_topic?: string | null
        }
        Update: {
          company_name?: string | null
          company_user_id?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string | null
          delivery_mode?: string | null
          id?: string
          message?: string
          pax_count?: number | null
          preferred_date?: string | null
          status?: string | null
          trainer_id?: string | null
          training_topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_company_user_id_fkey"
            columns: ["company_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_verified_training: boolean | null
          rating: number | null
          reviewer_user_id: string | null
          title: string | null
          trainer_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified_training?: boolean | null
          rating?: number | null
          reviewer_user_id?: string | null
          title?: string | null
          trainer_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_verified_training?: boolean | null
          rating?: number | null
          reviewer_user_id?: string | null
          title?: string | null
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_user_id_fkey"
            columns: ["reviewer_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string | null
          expires_at: string | null
          id: string
          plan: string | null
          price_myr: number | null
          started_at: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trainer_id: string | null
        }
        Insert: {
          billing_cycle?: string | null
          expires_at?: string | null
          id?: string
          plan?: string | null
          price_myr?: number | null
          started_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trainer_id?: string | null
        }
        Update: {
          billing_cycle?: string | null
          expires_at?: string | null
          id?: string
          plan?: string | null
          price_myr?: number | null
          started_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          category: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          trainer_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          trainer_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          trainer_count?: number | null
        }
        Relationships: []
      }
      trainer_gallery: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          image_url: string
          sort_order: number | null
          trainer_id: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
          trainer_id?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_gallery_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_industries: {
        Row: {
          industry_id: string
          trainer_id: string
        }
        Insert: {
          industry_id: string
          trainer_id: string
        }
        Update: {
          industry_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_industries_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_industries_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_languages: {
        Row: {
          language: string
          proficiency: string | null
          trainer_id: string
        }
        Insert: {
          language: string
          proficiency?: string | null
          trainer_id: string
        }
        Update: {
          language?: string
          proficiency?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_languages_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_profiles: {
        Row: {
          approval_status: string | null
          avg_rating: number | null
          bio: string | null
          created_at: string | null
          facebook_url: string | null
          featured_until: string | null
          hrdf_cert_number: string | null
          id: string
          inquiry_count: number | null
          is_featured: boolean | null
          is_identity_verified: boolean | null
          is_offline: boolean | null
          is_online: boolean | null
          is_published: boolean | null
          is_verified_hrdf: boolean | null
          linkedin_url: string | null
          location_city: string | null
          location_state: string | null
          pricing_from: number | null
          pricing_mode: string | null
          pricing_to: number | null
          profile_completeness: number | null
          rejection_reason: string | null
          review_count: number | null
          search_vector: unknown
          slug: string
          tagline: string | null
          updated_at: string | null
          user_id: string | null
          views_count: number | null
          website_url: string | null
          whatsapp_number: string | null
          years_experience: number | null
        }
        Insert: {
          approval_status?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string | null
          facebook_url?: string | null
          featured_until?: string | null
          hrdf_cert_number?: string | null
          id?: string
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_identity_verified?: boolean | null
          is_offline?: boolean | null
          is_online?: boolean | null
          is_published?: boolean | null
          is_verified_hrdf?: boolean | null
          linkedin_url?: string | null
          location_city?: string | null
          location_state?: string | null
          pricing_from?: number | null
          pricing_mode?: string | null
          pricing_to?: number | null
          profile_completeness?: number | null
          rejection_reason?: string | null
          review_count?: number | null
          search_vector?: unknown
          slug: string
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          website_url?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
        }
        Update: {
          approval_status?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string | null
          facebook_url?: string | null
          featured_until?: string | null
          hrdf_cert_number?: string | null
          id?: string
          inquiry_count?: number | null
          is_featured?: boolean | null
          is_identity_verified?: boolean | null
          is_offline?: boolean | null
          is_online?: boolean | null
          is_published?: boolean | null
          is_verified_hrdf?: boolean | null
          linkedin_url?: string | null
          location_city?: string | null
          location_state?: string | null
          pricing_from?: number | null
          pricing_mode?: string | null
          pricing_to?: number | null
          profile_completeness?: number | null
          rejection_reason?: string | null
          review_count?: number | null
          search_vector?: unknown
          slug?: string
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
          views_count?: number | null
          website_url?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_topics: {
        Row: {
          topic_id: string
          trainer_id: string
        }
        Insert: {
          topic_id: string
          trainer_id: string
        }
        Update: {
          topic_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_topics_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Database

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
