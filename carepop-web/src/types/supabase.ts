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
      appointments: {
        Row: {
          appointment_datetime: string
          clinic_id: string | null
          created_at: string
          duration_minutes: number
          end_time: string | null
          id: string
          notes: string | null
          notes_clinic: string | null
          notes_user: string | null
          provider_id: string | null
          service_id: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["appointment_status_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_datetime: string
          clinic_id?: string | null
          created_at?: string
          duration_minutes: number
          end_time?: string | null
          id?: string
          notes?: string | null
          notes_clinic?: string | null
          notes_user?: string | null
          provider_id?: string | null
          service_id?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["appointment_status_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_datetime?: string
          clinic_id?: string | null
          created_at?: string
          duration_minutes?: number
          end_time?: string | null
          id?: string
          notes?: string | null
          notes_clinic?: string | null
          notes_user?: string | null
          provider_id?: string | null
          service_id?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["appointment_status_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_services: {
        Row: {
          clinic_id: string
          clinic_specific_price: number | null
          created_at: string
          is_offered: boolean
          service_id: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          clinic_specific_price?: number | null
          created_at?: string
          is_offered?: boolean
          service_id: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          clinic_specific_price?: number | null
          created_at?: string
          is_offered?: boolean
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          additional_notes: string | null
          contact_email: string | null
          contact_phone: string | null
          country_code: string | null
          created_at: string | null
          fpop_chapter_affiliation: string | null
          full_address: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          name: string
          operating_hours: string | null
          postal_code: string | null
          region: string | null
          services_offered: string[] | null
          street_address: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          additional_notes?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string | null
          fpop_chapter_affiliation?: string | null
          full_address?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          name: string
          operating_hours?: string | null
          postal_code?: string | null
          region?: string | null
          services_offered?: string[] | null
          street_address?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          additional_notes?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string | null
          fpop_chapter_affiliation?: string | null
          full_address?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          name?: string
          operating_hours?: string | null
          postal_code?: string | null
          region?: string | null
          services_offered?: string[] | null
          street_address?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      facilities: {
        Row: {
          accepting_new_patients: boolean
          address: string | null
          contact_numbers: string[] | null
          contact_person_name: string | null
          coordinates: unknown | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          operating_hours: Json | null
          services_offered: string[] | null
          social_media_links: Json | null
          updated_at: string
        }
        Insert: {
          accepting_new_patients?: boolean
          address?: string | null
          contact_numbers?: string[] | null
          contact_person_name?: string | null
          coordinates?: unknown | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          operating_hours?: Json | null
          services_offered?: string[] | null
          social_media_links?: Json | null
          updated_at?: string
        }
        Update: {
          accepting_new_patients?: boolean
          address?: string | null
          contact_numbers?: string[] | null
          contact_person_name?: string | null
          coordinates?: unknown | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          operating_hours?: Json | null
          services_offered?: string[] | null
          social_media_links?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          age: number | null
          assigned_sex_at_birth: string | null
          avatar_url: string | null
          barangay_code: string | null
          city_municipality_code: string | null
          civil_status: string | null
          contact_no: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender_identity: string | null
          granular_consents: Json | null
          last_name: string | null
          middle_initial: string | null
          occupation: string | null
          philhealth_no: string | null
          phone_number: string | null
          pronouns: string | null
          province_code: string | null
          religion: string | null
          street: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          age?: number | null
          assigned_sex_at_birth?: string | null
          avatar_url?: string | null
          barangay_code?: string | null
          city_municipality_code?: string | null
          civil_status?: string | null
          contact_no?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender_identity?: string | null
          granular_consents?: Json | null
          last_name?: string | null
          middle_initial?: string | null
          occupation?: string | null
          philhealth_no?: string | null
          phone_number?: string | null
          pronouns?: string | null
          province_code?: string | null
          religion?: string | null
          street?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          age?: number | null
          assigned_sex_at_birth?: string | null
          avatar_url?: string | null
          barangay_code?: string | null
          city_municipality_code?: string | null
          civil_status?: string | null
          contact_no?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender_identity?: string | null
          granular_consents?: Json | null
          last_name?: string | null
          middle_initial?: string | null
          occupation?: string | null
          philhealth_no?: string | null
          phone_number?: string | null
          pronouns?: string | null
          province_code?: string | null
          religion?: string | null
          street?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          notes: string | null
          provider_id: string
          slot_type: Database["public"]["Enums"]["availability_slot_type_enum"]
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          is_active?: boolean
          notes?: string | null
          provider_id: string
          slot_type?: Database["public"]["Enums"]["availability_slot_type_enum"]
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          provider_id?: string
          slot_type?: Database["public"]["Enums"]["availability_slot_type_enum"]
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_facilities: {
        Row: {
          clinic_id: string
          created_at: string
          provider_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          provider_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_facilities_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_facilities_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_schedule_overrides: {
        Row: {
          clinic_id: string | null
          created_at: string
          end_time: string | null
          id: string
          is_available: boolean
          notes: string | null
          override_date: string
          provider_id: string
          start_time: string | null
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_available: boolean
          notes?: string | null
          override_date: string
          provider_id: string
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          is_available?: boolean
          notes?: string | null
          override_date?: string
          provider_id?: string
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_schedule_overrides_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_schedule_overrides_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_services: {
        Row: {
          created_at: string | null
          is_active: boolean | null
          provider_id: string
          service_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          is_active?: boolean | null
          provider_id: string
          service_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          is_active?: boolean | null
          provider_id?: string
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_service"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_specialties: {
        Row: {
          created_at: string
          provider_id: string
          specialty_id: string
        }
        Insert: {
          created_at?: string
          provider_id: string
          specialty_id: string
        }
        Update: {
          created_at?: string
          provider_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_specialties_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_weekly_schedules: {
        Row: {
          clinic_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          provider_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          provider_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          provider_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_weekly_schedules_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_weekly_schedules_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          accepting_new_patients: boolean
          avatar_url: string | null
          birth_date: string | null
          contact_number: string | null
          coordinates: unknown | null
          created_at: string
          email: string | null
          first_name: string
          full_name: string | null
          id: string
          is_active: boolean
          last_name: string
          sex: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepting_new_patients?: boolean
          avatar_url?: string | null
          birth_date?: string | null
          contact_number?: string | null
          coordinates?: unknown | null
          created_at?: string
          email?: string | null
          first_name: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_name: string
          sex?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepting_new_patients?: boolean
          avatar_url?: string | null
          birth_date?: string | null
          contact_number?: string | null
          coordinates?: unknown | null
          created_at?: string
          email?: string | null
          first_name?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string
          sex?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          additional_details: Json | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          requires_provider_assignment: boolean
          typical_duration_minutes: number | null
          updated_at: string
        }
        Insert: {
          additional_details?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          requires_provider_assignment?: boolean
          typical_duration_minutes?: number | null
          updated_at?: string
        }
        Update: {
          additional_details?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          requires_provider_assignment?: boolean
          typical_duration_minutes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_facility_tsvector: {
        Args: {
          _name: string
          _address: string
          _email: string
          _services_offered: string[]
          _contact_person_name: string
          _contact_numbers: string[]
        }
        Returns: unknown
      }
      generate_provider_tsvector: {
        Args: {
          _first_name: string
          _last_name: string
          _contact_email: string
          _contact_phone: string
        }
        Returns: unknown
      }
      get_clinic_service_provider_ids: {
        Args: { _clinic_id: string; _service_id: string }
        Returns: {
          provider_id: string
        }[]
      }
      is_admin: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      nearby_clinics: {
        Args: {
          search_lat: number
          search_lon: number
          search_radius_meters: number
        }
        Returns: {
          id: string
        }[]
      }
    }
    Enums: {
      appointment_status_enum:
        | "pending_confirmation"
        | "confirmed"
        | "cancelled_by_user"
        | "cancelled_by_clinic"
        | "completed"
        | "no_show"
      availability_slot_type_enum: "available" | "unavailable" | "break"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never 