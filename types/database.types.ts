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
      cafe_features: {
        Row: {
          cafe_id: number
          feature_id: number
        }
        Insert: {
          cafe_id: number
          feature_id: number
        }
        Update: {
          cafe_id?: number
          feature_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "cafe_features_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cafe_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      cafes: {
        Row: {
          about: Json | null
          area_service: boolean | null
          booking_appointment_link: string | null
          borough: string | null
          business_status: string | null
          category: string | null
          cid: string | null
          city: string | null
          city_slug: string | null
          description: string | null
          full_address: string | null
          google_id: string | null
          h3: string | null
          id: number
          kgmid: string | null
          lat: number | null
          latitude: string | null
          located_in: string | null
          location: unknown | null
          location_link: string | null
          location_reviews_link: string | null
          logo: string | null
          long: number | null
          longitude: string | null
          name: string | null
          order_links: string | null
          other_hours: string | null
          owner_id: string | null
          owner_link: string | null
          owner_title: string | null
          phone: string | null
          photo: string | null
          photos_count: number | null
          place_id: string | null
          plus_code: string | null
          popular_times: string | null
          postal_code: string | null
          posts: string | null
          query: string | null
          range: string | null
          rating: string | null
          rating_num: number | null
          reservation_links: string | null
          reviews: number | null
          reviews_id: string | null
          reviews_link: string | null
          reviews_per_score: string | null
          reviews_per_score_1: string | null
          reviews_per_score_2: string | null
          reviews_per_score_3: string | null
          reviews_per_score_4: string | null
          reviews_per_score_5: number | null
          reviews_tags: string | null
          site: string | null
          slug_name: string | null
          state: string | null
          street: string | null
          street_view: string | null
          subtypes: string | null
          time_zone: string | null
          type: string | null
          typical_time_spent: string | null
          verified: boolean | null
          working_hours: string | null
          working_hours_old_format: string | null
        }
        Insert: {
          about?: Json | null
          area_service?: boolean | null
          booking_appointment_link?: string | null
          borough?: string | null
          business_status?: string | null
          category?: string | null
          cid?: string | null
          city?: string | null
          city_slug?: string | null
          description?: string | null
          full_address?: string | null
          google_id?: string | null
          h3?: string | null
          id?: number
          kgmid?: string | null
          lat?: number | null
          latitude?: string | null
          located_in?: string | null
          location?: unknown | null
          location_link?: string | null
          location_reviews_link?: string | null
          logo?: string | null
          long?: number | null
          longitude?: string | null
          name?: string | null
          order_links?: string | null
          other_hours?: string | null
          owner_id?: string | null
          owner_link?: string | null
          owner_title?: string | null
          phone?: string | null
          photo?: string | null
          photos_count?: number | null
          place_id?: string | null
          plus_code?: string | null
          popular_times?: string | null
          postal_code?: string | null
          posts?: string | null
          query?: string | null
          range?: string | null
          rating?: string | null
          rating_num?: number | null
          reservation_links?: string | null
          reviews?: number | null
          reviews_id?: string | null
          reviews_link?: string | null
          reviews_per_score?: string | null
          reviews_per_score_1?: string | null
          reviews_per_score_2?: string | null
          reviews_per_score_3?: string | null
          reviews_per_score_4?: string | null
          reviews_per_score_5?: number | null
          reviews_tags?: string | null
          site?: string | null
          slug_name?: string | null
          state?: string | null
          street?: string | null
          street_view?: string | null
          subtypes?: string | null
          time_zone?: string | null
          type?: string | null
          typical_time_spent?: string | null
          verified?: boolean | null
          working_hours?: string | null
          working_hours_old_format?: string | null
        }
        Update: {
          about?: Json | null
          area_service?: boolean | null
          booking_appointment_link?: string | null
          borough?: string | null
          business_status?: string | null
          category?: string | null
          cid?: string | null
          city?: string | null
          city_slug?: string | null
          description?: string | null
          full_address?: string | null
          google_id?: string | null
          h3?: string | null
          id?: number
          kgmid?: string | null
          lat?: number | null
          latitude?: string | null
          located_in?: string | null
          location?: unknown | null
          location_link?: string | null
          location_reviews_link?: string | null
          logo?: string | null
          long?: number | null
          longitude?: string | null
          name?: string | null
          order_links?: string | null
          other_hours?: string | null
          owner_id?: string | null
          owner_link?: string | null
          owner_title?: string | null
          phone?: string | null
          photo?: string | null
          photos_count?: number | null
          place_id?: string | null
          plus_code?: string | null
          popular_times?: string | null
          postal_code?: string | null
          posts?: string | null
          query?: string | null
          range?: string | null
          rating?: string | null
          rating_num?: number | null
          reservation_links?: string | null
          reviews?: number | null
          reviews_id?: string | null
          reviews_link?: string | null
          reviews_per_score?: string | null
          reviews_per_score_1?: string | null
          reviews_per_score_2?: string | null
          reviews_per_score_3?: string | null
          reviews_per_score_4?: string | null
          reviews_per_score_5?: number | null
          reviews_tags?: string | null
          site?: string | null
          slug_name?: string | null
          state?: string | null
          street?: string | null
          street_view?: string | null
          subtypes?: string | null
          time_zone?: string | null
          type?: string | null
          typical_time_spent?: string | null
          verified?: boolean | null
          working_hours?: string | null
          working_hours_old_format?: string | null
        }
        Relationships: []
      }
      cafes_komplit: {
        Row: {
          about: Json | null
          area_service: boolean | null
          booking_appointment_link: string | null
          borough: string | null
          business_status: string | null
          category: string | null
          cid: string | null
          city: string | null
          description: string | null
          full_address: string | null
          google_id: string | null
          h3: string | null
          id: number
          kgmid: string | null
          latitude: string | null
          located_in: string | null
          location_link: string | null
          location_reviews_link: string | null
          logo: string | null
          longitude: string | null
          name: string | null
          order_links: string | null
          other_hours: string | null
          owner_id: string | null
          owner_link: string | null
          owner_title: string | null
          phone: string | null
          photo: string | null
          photos_count: number | null
          place_id: string | null
          plus_code: string | null
          popular_times: string | null
          postal_code: string | null
          posts: string | null
          query: string | null
          range: string | null
          rating: string | null
          reservation_links: string | null
          reviews: number | null
          reviews_id: string | null
          reviews_link: string | null
          reviews_per_score: string | null
          reviews_per_score_2: string | null
          reviews_per_score_3: string | null
          reviews_per_score_4: string | null
          reviews_per_score_5: string | null
          reviews_per_score_6: number | null
          reviews_tags: string | null
          site: string | null
          state: string | null
          street: string | null
          street_view: string | null
          subtypes: string | null
          time_zone: string | null
          type: string | null
          typical_time_spent: string | null
          verified: boolean | null
          working_hours: string | null
          working_hours_old_format: string | null
        }
        Insert: {
          about?: Json | null
          area_service?: boolean | null
          booking_appointment_link?: string | null
          borough?: string | null
          business_status?: string | null
          category?: string | null
          cid?: string | null
          city?: string | null
          description?: string | null
          full_address?: string | null
          google_id?: string | null
          h3?: string | null
          id?: number
          kgmid?: string | null
          latitude?: string | null
          located_in?: string | null
          location_link?: string | null
          location_reviews_link?: string | null
          logo?: string | null
          longitude?: string | null
          name?: string | null
          order_links?: string | null
          other_hours?: string | null
          owner_id?: string | null
          owner_link?: string | null
          owner_title?: string | null
          phone?: string | null
          photo?: string | null
          photos_count?: number | null
          place_id?: string | null
          plus_code?: string | null
          popular_times?: string | null
          postal_code?: string | null
          posts?: string | null
          query?: string | null
          range?: string | null
          rating?: string | null
          reservation_links?: string | null
          reviews?: number | null
          reviews_id?: string | null
          reviews_link?: string | null
          reviews_per_score?: string | null
          reviews_per_score_2?: string | null
          reviews_per_score_3?: string | null
          reviews_per_score_4?: string | null
          reviews_per_score_5?: string | null
          reviews_per_score_6?: number | null
          reviews_tags?: string | null
          site?: string | null
          state?: string | null
          street?: string | null
          street_view?: string | null
          subtypes?: string | null
          time_zone?: string | null
          type?: string | null
          typical_time_spent?: string | null
          verified?: boolean | null
          working_hours?: string | null
          working_hours_old_format?: string | null
        }
        Update: {
          about?: Json | null
          area_service?: boolean | null
          booking_appointment_link?: string | null
          borough?: string | null
          business_status?: string | null
          category?: string | null
          cid?: string | null
          city?: string | null
          description?: string | null
          full_address?: string | null
          google_id?: string | null
          h3?: string | null
          id?: number
          kgmid?: string | null
          latitude?: string | null
          located_in?: string | null
          location_link?: string | null
          location_reviews_link?: string | null
          logo?: string | null
          longitude?: string | null
          name?: string | null
          order_links?: string | null
          other_hours?: string | null
          owner_id?: string | null
          owner_link?: string | null
          owner_title?: string | null
          phone?: string | null
          photo?: string | null
          photos_count?: number | null
          place_id?: string | null
          plus_code?: string | null
          popular_times?: string | null
          postal_code?: string | null
          posts?: string | null
          query?: string | null
          range?: string | null
          rating?: string | null
          reservation_links?: string | null
          reviews?: number | null
          reviews_id?: string | null
          reviews_link?: string | null
          reviews_per_score?: string | null
          reviews_per_score_2?: string | null
          reviews_per_score_3?: string | null
          reviews_per_score_4?: string | null
          reviews_per_score_5?: string | null
          reviews_per_score_6?: number | null
          reviews_tags?: string | null
          site?: string | null
          state?: string | null
          street?: string | null
          street_view?: string | null
          subtypes?: string | null
          time_zone?: string | null
          type?: string | null
          typical_time_spent?: string | null
          verified?: boolean | null
          working_hours?: string | null
          working_hours_old_format?: string | null
        }
        Relationships: []
      }
      features: {
        Row: {
          feature_slug: string | null
          id: number
          name: string | null
        }
        Insert: {
          feature_slug?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          feature_slug?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      old_cafe_directories_sheet1: {
        Row: {
          c1: string | null
          c2: string | null
        }
        Insert: {
          c1?: string | null
          c2?: string | null
        }
        Update: {
          c1?: string | null
          c2?: string | null
        }
        Relationships: []
      }
      old_transformed_cafe_data: {
        Row: {
          feature: string | null
          id: number | null
        }
        Insert: {
          feature?: string | null
          id?: number | null
        }
        Update: {
          feature?: string | null
          id?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          id: number
          location: unknown
          name: string
        }
        Insert: {
          id?: number
          location: unknown
          name: string
        }
        Update: {
          id?: number
          location?: unknown
          name?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          description: string | null
          id: number
          location: unknown
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          location: unknown
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          location?: unknown
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_city: {
        Row: {
          city: string | null
          city_slug: string | null
        }
        Relationships: []
      }
      v_price_range: {
        Row: {
          range: string | null
        }
        Relationships: []
      }
      v_rating: {
        Row: {
          rating: number | null
        }
        Relationships: []
      }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
