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
      appointment_reports: {
        Row: {
          additional_notes: string | null
          appointment_id: string
          created_at: string
          created_by_admin_id: string
          diagnoses: string | null
          findings_summary: string | null
          follow_up_date: string | null
          follow_up_notes: string | null
          id: string
          lifestyle_recommendations: string | null
          medications_prescribed: string | null
          purpose_of_visit: string | null
          recommendations_summary: string | null
          referrals: string | null
          report_content: string
          symptoms_reported: string | null
          tests_ordered: string | null
          treatment_plan: string | null
          updated_at: string
          vitals_blood_pressure: string | null
          vitals_height: string | null
          vitals_other: string | null
          vitals_temperature: string | null
          vitals_weight: string | null
        }
        Insert: {
          additional_notes?: string | null
          appointment_id: string
          created_at?: string
          created_by_admin_id: string
          diagnoses?: string | null
          findings_summary?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          lifestyle_recommendations?: string | null
          medications_prescribed?: string | null
          purpose_of_visit?: string | null
          recommendations_summary?: string | null
          referrals?: string | null
          report_content: string
          symptoms_reported?: string | null
          tests_ordered?: string | null
          treatment_plan?: string | null
          updated_at?: string
          vitals_blood_pressure?: string | null
          vitals_height?: string | null
          vitals_other?: string | null
          vitals_temperature?: string | null
          vitals_weight?: string | null
        }
        Update: {
          additional_notes?: string | null
          appointment_id?: string
          created_at?: string
          created_by_admin_id?: string
          diagnoses?: string | null
          findings_summary?: string | null
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          lifestyle_recommendations?: string | null
          medications_prescribed?: string | null
          purpose_of_visit?: string | null
          recommendations_summary?: string | null
          referrals?: string | null
          report_content?: string
          symptoms_reported?: string | null
          tests_ordered?: string | null
          treatment_plan?: string | null
          updated_at?: string
          vitals_blood_pressure?: string | null
          vitals_height?: string | null
          vitals_other?: string | null
          vitals_temperature?: string | null
          vitals_weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reports_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
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
      form_submissions: {
        Row: {
          auth_tag: string
          form_id: string
          id: string
          iv: string
          submission_data_encrypted: string
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          auth_tag: string
          form_id: string
          id?: string
          iv: string
          submission_data_encrypted: string
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          auth_tag?: string
          form_id?: string
          id?: string
          iv?: string
          submission_data_encrypted?: string
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          schema_definition: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          schema_definition: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          schema_definition?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_item_batches: {
        Row: {
          batch_number: string
          created_at: string | null
          expiration_date: string
          id: string
          item_id: string
          quantity: number
        }
        Insert: {
          batch_number: string
          created_at?: string | null
          expiration_date: string
          id?: string
          item_id: string
          quantity: number
        }
        Update: {
          batch_number?: string
          created_at?: string | null
          expiration_date?: string
          id?: string
          item_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_item_batches_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          brand_name: string | null
          category: string | null
          controlled_substance_code: string | null
          created_at: string | null
          drug_classification: string | null
          fda_registration_number: string | null
          form: string | null
          generic_name: string | null
          id: string
          is_active: boolean | null
          item_name: string
          max_stock_level: number | null
          min_stock_level: number | null
          packaging: string | null
          prescription_requirement: string | null
          purchase_cost: number | null
          quantity_on_hand: number
          reorder_level: number | null
          reorder_quantity: number | null
          selling_price: number | null
          sku: string | null
          storage_requirements: string | null
          strength_dosage: string | null
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand_name?: string | null
          category?: string | null
          controlled_substance_code?: string | null
          created_at?: string | null
          drug_classification?: string | null
          fda_registration_number?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          item_name: string
          max_stock_level?: number | null
          min_stock_level?: number | null
          packaging?: string | null
          prescription_requirement?: string | null
          purchase_cost?: number | null
          quantity_on_hand?: number
          reorder_level?: number | null
          reorder_quantity?: number | null
          selling_price?: number | null
          sku?: string | null
          storage_requirements?: string | null
          strength_dosage?: string | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_name?: string | null
          category?: string | null
          controlled_substance_code?: string | null
          created_at?: string | null
          drug_classification?: string | null
          fda_registration_number?: string | null
          form?: string | null
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          item_name?: string
          max_stock_level?: number | null
          min_stock_level?: number | null
          packaging?: string | null
          prescription_requirement?: string | null
          purchase_cost?: number | null
          quantity_on_hand?: number
          reorder_level?: number | null
          reorder_quantity?: number | null
          selling_price?: number | null
          sku?: string | null
          storage_requirements?: string | null
          strength_dosage?: string | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
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
      provider_service_schedules: {
        Row: {
          clinic_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          provider_id: string
          service_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          provider_id: string
          service_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          provider_id?: string
          service_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_service_schedules_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_service_schedules_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_service_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
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
          weekly_availability: Json | null
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
          weekly_availability?: Json | null
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
          weekly_availability?: Json | null
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          additional_details: Json | null
          category: string | null
          category_id: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          requirements: string | null
          requires_provider_assignment: boolean
          typical_duration_minutes: number | null
          updated_at: string
        }
        Insert: {
          additional_details?: Json | null
          category?: string | null
          category_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          requirements?: string | null
          requires_provider_assignment?: boolean
          typical_duration_minutes?: number | null
          updated_at?: string
        }
        Update: {
          additional_details?: Json | null
          category?: string | null
          category_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          requirements?: string | null
          requires_provider_assignment?: boolean
          typical_duration_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
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
      stock_logs: {
        Row: {
          batch_id: string | null
          change_quantity: number
          created_at: string | null
          id: string
          item_id: string
          remarks: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          batch_id?: string | null
          change_quantity: number
          created_at?: string | null
          id?: string
          item_id: string
          remarks?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          batch_id?: string | null
          change_quantity?: number
          created_at?: string | null
          id?: string
          item_id?: string
          remarks?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "inventory_item_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_logs_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_medical_records: {
        Row: {
          created_at: string
          created_by_admin_id: string
          id: string
          record_details: string | null
          record_file_url: string | null
          record_title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by_admin_id: string
          id?: string
          record_details?: string | null
          record_file_url?: string | null
          record_title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by_admin_id?: string
          id?: string
          record_details?: string | null
          record_file_url?: string | null
          record_title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
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
      debug_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
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
      get_all_users_with_roles: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          first_name: string
          last_name: string
          created_at: string
          role: string
          email: string
        }[]
      }
      get_clinic_service_provider_ids: {
        Args: { _clinic_id: string; _service_id: string }
        Returns: {
          provider_id: string
        }[]
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_users_with_roles: {
        Args: { role_filter?: string; search_term?: string }
        Returns: Database["public"]["CompositeTypes"]["user_with_role"][]
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
      search_appointments: {
        Args: {
          search_term: string
          page_num: number
          page_size: number
          clinic_id_param?: string
        }
        Returns: {
          id: string
          appointment_datetime: string
          status: string
          provider_first_name: string
          provider_last_name: string
          service_name: string
          clinic_name: string
          patient_first_name: string
          patient_last_name: string
          patient_email: string
          total_count: number
        }[]
      }
      search_users: {
        Args: {
          search_term: string
          role_filter?: string
          limit_val?: number
          offset_val?: number
          sort_by?: string
          sort_order?: string
        }
        Returns: {
          user_id: string
          first_name: string
          last_name: string
          email: string
          created_at: string
          role: string
          total_count: number
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
      user_with_role: {
        user_id: string | null
        first_name: string | null
        last_name: string | null
        email: string | null
        created_at: string | null
        role: string | null
      }
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
    Enums: {
      appointment_status_enum: [
        "pending_confirmation",
        "confirmed",
        "cancelled_by_user",
        "cancelled_by_clinic",
        "completed",
        "no_show",
      ],
      availability_slot_type_enum: ["available", "unavailable", "break"],
    },
  },
} as const
