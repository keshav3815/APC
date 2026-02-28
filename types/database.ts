export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'user' | 'librarian'
export type MemberType = 'volunteer' | 'donor' | 'mentor' | 'student'
export type BookStatus = 'available' | 'borrowed' | 'reserved' | 'lost' | 'damaged'
export type BookCategory = 'school' | 'competitive' | 'skill' | 'self-help' | 'other'
export type EventType = 'workshop' | 'donation-drive' | 'seminar' | 'meetup' | 'other'
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
export type DonationPurpose = 'education' | 'food' | 'health' | 'general'
export type DonationType = 'one-time' | 'monthly' | 'annual'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type TransactionType = 'income' | 'expense'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: UserRole
          is_active: boolean
          email_verified: boolean
          village: string | null
          city: string | null
          state: string | null
          bio: string | null
          skills: string[] | null
          interests: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          email_verified?: boolean
          village?: string | null
          city?: string | null
          state?: string | null
          bio?: string | null
          skills?: string[] | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          email_verified?: boolean
          village?: string | null
          city?: string | null
          state?: string | null
          bio?: string | null
          skills?: string[] | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      hero_content: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          cta_primary_text: string | null
          cta_primary_link: string | null
          cta_secondary_text: string | null
          cta_secondary_link: string | null
          background_image: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          cta_primary_text?: string | null
          cta_primary_link?: string | null
          cta_secondary_text?: string | null
          cta_secondary_link?: string | null
          background_image?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          cta_primary_text?: string | null
          cta_primary_link?: string | null
          cta_secondary_text?: string | null
          cta_secondary_link?: string | null
          background_image?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stats: {
        Row: {
          id: string
          key: string
          label: string
          value: number
          icon: string | null
          color: string | null
          display_order: number
          is_visible: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          label: string
          value?: number
          icon?: string | null
          color?: string | null
          display_order?: number
          is_visible?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          label?: string
          value?: number
          icon?: string | null
          color?: string | null
          display_order?: number
          is_visible?: boolean
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string | null
          phone: string | null
          photo_url: string | null
          role: string
          member_type: MemberType
          contribution: string | null
          village: string | null
          skills: string[] | null
          is_active: boolean
          joined_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          photo_url?: string | null
          role: string
          member_type?: MemberType
          contribution?: string | null
          village?: string | null
          skills?: string[] | null
          is_active?: boolean
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: string
          member_type?: MemberType
          contribution?: string | null
          village?: string | null
          skills?: string[] | null
          is_active?: boolean
          joined_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          accession_number: string
          title: string
          author: string | null
          isbn: string | null
          publisher: string | null
          publication_year: number | null
          category: BookCategory
          description: string | null
          cover_image: string | null
          status: BookStatus
          condition: string | null
          location: string | null
          donor_id: string | null
          donor_name: string | null
          added_by: string | null
          total_copies: number
          available_copies: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          accession_number: string
          title: string
          author?: string | null
          isbn?: string | null
          publisher?: string | null
          publication_year?: number | null
          category?: BookCategory
          description?: string | null
          cover_image?: string | null
          status?: BookStatus
          condition?: string | null
          location?: string | null
          donor_id?: string | null
          donor_name?: string | null
          added_by?: string | null
          total_copies?: number
          available_copies?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          accession_number?: string
          title?: string
          author?: string | null
          isbn?: string | null
          publisher?: string | null
          publication_year?: number | null
          category?: BookCategory
          description?: string | null
          cover_image?: string | null
          status?: BookStatus
          condition?: string | null
          location?: string | null
          donor_id?: string | null
          donor_name?: string | null
          added_by?: string | null
          total_copies?: number
          available_copies?: number
          created_at?: string
          updated_at?: string
        }
      }
      library_patrons: {
        Row: {
          id: string
          patron_id: string
          user_id: string | null
          name: string
          email: string | null
          phone: string | null
          address: string | null
          max_books_allowed: number
          is_active: boolean
          membership_start: string
          membership_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patron_id: string
          user_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          max_books_allowed?: number
          is_active?: boolean
          membership_start?: string
          membership_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patron_id?: string
          user_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          max_books_allowed?: number
          is_active?: boolean
          membership_start?: string
          membership_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      book_issues: {
        Row: {
          id: string
          book_id: string
          patron_id: string
          issued_by: string | null
          issue_date: string
          due_date: string
          return_date: string | null
          returned_by: string | null
          status: string
          fine_amount: number
          fine_paid: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          book_id: string
          patron_id: string
          issued_by?: string | null
          issue_date?: string
          due_date: string
          return_date?: string | null
          returned_by?: string | null
          status?: string
          fine_amount?: number
          fine_paid?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          book_id?: string
          patron_id?: string
          issued_by?: string | null
          issue_date?: string
          due_date?: string
          return_date?: string | null
          returned_by?: string | null
          status?: string
          fine_amount?: number
          fine_paid?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          slug: string | null
          description: string | null
          event_type: EventType
          status: EventStatus
          start_date: string
          end_date: string | null
          location: string | null
          venue_address: string | null
          is_online: boolean
          online_link: string | null
          cover_image: string | null
          capacity: number | null
          registered_count: number
          organizer_id: string | null
          is_featured: boolean
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug?: string | null
          description?: string | null
          event_type?: EventType
          status?: EventStatus
          start_date: string
          end_date?: string | null
          location?: string | null
          venue_address?: string | null
          is_online?: boolean
          online_link?: string | null
          cover_image?: string | null
          capacity?: number | null
          registered_count?: number
          organizer_id?: string | null
          is_featured?: boolean
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string | null
          description?: string | null
          event_type?: EventType
          status?: EventStatus
          start_date?: string
          end_date?: string | null
          location?: string | null
          venue_address?: string | null
          is_online?: boolean
          online_link?: string | null
          cover_image?: string | null
          capacity?: number | null
          registered_count?: number
          organizer_id?: string | null
          is_featured?: boolean
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string | null
          name: string
          email: string
          phone: string | null
          status: string
          attended: boolean
          registered_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          status?: string
          attended?: boolean
          registered_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          status?: string
          attended?: boolean
          registered_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          title: string
          slug: string | null
          description: string | null
          purpose: DonationPurpose
          target_amount: number
          raised_amount: number
          start_date: string
          end_date: string | null
          cover_image: string | null
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug?: string | null
          description?: string | null
          purpose?: DonationPurpose
          target_amount: number
          raised_amount?: number
          start_date?: string
          end_date?: string | null
          cover_image?: string | null
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string | null
          description?: string | null
          purpose?: DonationPurpose
          target_amount?: number
          raised_amount?: number
          start_date?: string
          end_date?: string | null
          cover_image?: string | null
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          campaign_id: string | null
          user_id: string | null
          donor_name: string
          donor_email: string | null
          donor_phone: string | null
          amount: number
          donation_type: DonationType
          purpose: DonationPurpose
          payment_method: string | null
          payment_status: PaymentStatus
          transaction_id: string | null
          is_anonymous: boolean
          message: string | null
          receipt_sent: boolean
          donated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          user_id?: string | null
          donor_name: string
          donor_email?: string | null
          donor_phone?: string | null
          amount: number
          donation_type?: DonationType
          purpose?: DonationPurpose
          payment_method?: string | null
          payment_status?: PaymentStatus
          transaction_id?: string | null
          is_anonymous?: boolean
          message?: string | null
          receipt_sent?: boolean
          donated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          user_id?: string | null
          donor_name?: string
          donor_email?: string | null
          donor_phone?: string | null
          amount?: number
          donation_type?: DonationType
          purpose?: DonationPurpose
          payment_method?: string | null
          payment_status?: PaymentStatus
          transaction_id?: string | null
          is_anonymous?: boolean
          message?: string | null
          receipt_sent?: boolean
          donated_at?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          transaction_type: TransactionType
          category: string
          description: string | null
          amount: number
          transaction_date: string
          reference_id: string | null
          receipt_url: string | null
          added_by: string | null
          verified: boolean
          verified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_type: TransactionType
          category: string
          description?: string | null
          amount: number
          transaction_date: string
          reference_id?: string | null
          receipt_url?: string | null
          added_by?: string | null
          verified?: boolean
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_type?: TransactionType
          category?: string
          description?: string | null
          amount?: number
          transaction_date?: string
          reference_id?: string | null
          receipt_url?: string | null
          added_by?: string | null
          verified?: boolean
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          user_id: string | null
          name: string
          role: string | null
          content: string
          rating: number | null
          photo_url: string | null
          category: string | null
          is_featured: boolean
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          role?: string | null
          content: string
          rating?: number | null
          photo_url?: string | null
          category?: string | null
          is_featured?: boolean
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          role?: string | null
          content?: string
          rating?: number | null
          photo_url?: string | null
          category?: string | null
          is_featured?: boolean
          is_approved?: boolean
          created_at?: string
        }
      }
      volunteer_applications: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          phone: string
          city: string | null
          skills: string | null
          interests: string | null
          availability: string | null
          experience: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email: string
          phone: string
          city?: string | null
          skills?: string | null
          interests?: string | null
          availability?: string | null
          experience?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          email?: string
          phone?: string
          city?: string | null
          skills?: string | null
          interests?: string | null
          availability?: string | null
          experience?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string | null
          type: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message?: string | null
          type?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string | null
          type?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      book_donations: {
        Row: {
          id: string
          donor_name: string
          donor_email: string
          donor_phone: string
          book_title: string
          author: string
          category: string
          book_type: string
          condition: string
          quantity: number
          status: string
          received_by: string | null
          received_at: string | null
          notes: string
          created_at: string
        }
        Insert: {
          id?: string
          donor_name: string
          donor_email: string
          donor_phone: string
          book_title: string
          author: string
          category: string
          book_type: string
          condition: string
          quantity?: number
          status?: string
          received_by?: string | null
          received_at?: string | null
          notes?: string
          created_at?: string
        }
        Update: {
          id?: string
          donor_name?: string
          donor_email?: string
          donor_phone?: string
          book_title?: string
          author?: string
          category?: string
          book_type?: string
          condition?: string
          quantity?: number
          status?: string
          received_by?: string | null
          received_at?: string | null
          notes?: string
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          exam_name: string
          organization: string
          level: string
          state: string | null
          description: string | null
          eligibility: string | null
          qualification: string | null
          age_limit: string | null
          application_start_date: string | null
          application_last_date: string | null
          exam_date: string | null
          official_website: string | null
          notification_pdf: string | null
          application_fee: string | null
          selection_process: string | null
          status: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exam_name: string
          organization: string
          level?: string
          state?: string | null
          description?: string | null
          eligibility?: string | null
          qualification?: string | null
          age_limit?: string | null
          application_start_date?: string | null
          application_last_date?: string | null
          exam_date?: string | null
          official_website?: string | null
          notification_pdf?: string | null
          application_fee?: string | null
          selection_process?: string | null
          status?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exam_name?: string
          organization?: string
          level?: string
          state?: string | null
          description?: string | null
          eligibility?: string | null
          qualification?: string | null
          age_limit?: string | null
          application_start_date?: string | null
          application_last_date?: string | null
          exam_date?: string | null
          official_website?: string | null
          notification_pdf?: string | null
          application_fee?: string | null
          selection_process?: string | null
          status?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      saved_exams: {
        Row: {
          id: string
          student_id: string
          exam_id: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          exam_id: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          exam_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_exams_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_exams_exam_id_fkey"
            columns: ["exam_id"]
            referencedRelation: "exams"
            referencedColumns: ["id"]
          }
        ]
      }
      exam_reminders: {
        Row: {
          id: string
          student_id: string
          exam_id: string
          reminder_type: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          exam_id: string
          reminder_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          exam_id?: string
          reminder_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_reminders_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_reminders_exam_id_fkey"
            columns: ["exam_id"]
            referencedRelation: "exams"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      member_type: MemberType
      book_status: BookStatus
      book_category: BookCategory
      event_type: EventType
      event_status: EventStatus
      donation_purpose: DonationPurpose
      donation_type: DonationType
      payment_status: PaymentStatus
      transaction_type: TransactionType
    }
  }
}
