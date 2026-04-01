export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          auth_id: string;
          session_id: string | null;
          first_name: string | null;
          last_name: string | null;
          age: number | null;
          school: string | null;
          school_year: string | null;
          email: string | null;
          phone_number: string | null;
          persona: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          auth_id: string;
          session_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          age?: number | null;
          school?: string | null;
          school_year?: string | null;
          email?: string | null;
          phone_number?: string | null;
          persona?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          auth_id?: string;
          session_id?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          age?: number | null;
          school?: string | null;
          school_year?: string | null;
          email?: string | null;
          phone_number?: string | null;
          persona?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sections: {
        Row: {
          id: number;
          code: string;
          name: string;
          order_index: number;
        };
        Insert: {
          id: number;
          code: string;
          name: string;
          order_index: number;
        };
        Update: {
          id?: number;
          code?: string;
          name?: string;
          order_index?: number;
        };
        Relationships: [];
      };
      responses: {
        Row: {
          id: number;
          user_id: number;
          section_id: number;
          question_number: number;
          question: string | null;
          response_boolean: boolean | null;
          response_integer: number | null;
          response_text: string | null;
          response_array: unknown | null;
          answered_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          section_id: number;
          question_number: number;
          question?: string | null;
          response_boolean?: boolean | null;
          response_integer?: number | null;
          response_text?: string | null;
          response_array?: unknown | null;
          answered_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          section_id?: number;
          question_number?: number;
          question?: string | null;
          response_boolean?: boolean | null;
          response_integer?: number | null;
          response_text?: string | null;
          response_array?: unknown | null;
          answered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "responses_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "responses_section_id_fkey";
            columns: ["section_id"];
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      section_results: {
        Row: {
          id: number;
          user_id: number;
          section_id: number;
          score_data: Record<string, unknown> | null;
          meta: Record<string, unknown> | null;
          completed_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          section_id: number;
          score_data?: Record<string, unknown> | null;
          meta?: Record<string, unknown> | null;
          completed_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          section_id?: number;
          score_data?: Record<string, unknown> | null;
          meta?: Record<string, unknown> | null;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "section_results_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "section_results_section_id_fkey";
            columns: ["section_id"];
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      survey_responses: {
        Row: {
          id: number;
          survey_slug: string;
          survey_version: number;
          user_id: number | null;
          answers: Record<string, unknown>;
          meta: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          survey_slug?: string;
          survey_version?: number;
          user_id?: number | null;
          answers: Record<string, unknown>;
          meta?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          survey_slug?: string;
          survey_version?: number;
          user_id?: number | null;
          answers?: Record<string, unknown>;
          meta?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "survey_responses_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback: {
        Row: {
          id: number;
          user_id: number;
          section_id: number;
          feedback: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: number;
          section_id: number;
          feedback: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: number;
          section_id?: number;
          feedback?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_section_id_fkey";
            columns: ["section_id"];
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      response_drafts: {
        Row: {
          id: number;
          user_id: number;
          section_id: number;
          draft_data: Record<string, unknown>;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: number;
          section_id: number;
          draft_data: Record<string, unknown>;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: number;
          section_id?: number;
          draft_data?: Record<string, unknown>;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "response_drafts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "response_drafts_section_id_fkey";
            columns: ["section_id"];
            referencedRelation: "sections";
            referencedColumns: ["id"];
          },
        ];
      };
      university: {
        Row: {
          id: number;
          university: string | null;
          faculty: string | null;
          title: string | null;
          title_type: string | null;
          duration: string | null;
          entry_conditions: string | null;
          location: string | null;
          phone_number: string | null;
          web: string | null;
          email: string | null;
        };
        Insert: {
          id?: number;
          university?: string | null;
          faculty?: string | null;
          title?: string | null;
          title_type?: string | null;
          duration?: string | null;
          entry_conditions?: string | null;
          location?: string | null;
          phone_number?: string | null;
          web?: string | null;
          email?: string | null;
        };
        Update: {
          id?: number;
          university?: string | null;
          faculty?: string | null;
          title?: string | null;
          title_type?: string | null;
          duration?: string | null;
          entry_conditions?: string | null;
          location?: string | null;
          phone_number?: string | null;
          web?: string | null;
          email?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
