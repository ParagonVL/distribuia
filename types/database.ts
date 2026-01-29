export type UserPlan = "free" | "starter" | "pro";
export type InputType = "youtube" | "article" | "text";
export type ToneType = "profesional" | "cercano" | "tecnico";
export type OutputFormat = "x_thread" | "linkedin_post" | "linkedin_article";
export type ConversionStatus = "pending" | "processing" | "completed" | "failed";

export interface User {
  id: string;
  plan: UserPlan;
  conversions_used_this_month: number;
  billing_cycle_start: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  low_usage_email_sent_this_cycle: boolean;
  email_notifications_enabled: boolean;
  last_conversion_at: string | null;
  reengagement_email_sent: boolean;
  created_at: string;
}

export interface Conversion {
  id: string;
  user_id: string;
  input_type: InputType;
  input_url: string | null;
  input_text: string;
  tone: ToneType;
  topics: string[] | null;
  status: ConversionStatus;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Output {
  id: string;
  conversion_id: string;
  format: OutputFormat;
  content: string;
  version: number;
  created_at: string;
}

// Supabase Database type definition
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          plan: UserPlan;
          conversions_used_this_month: number;
          billing_cycle_start: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          low_usage_email_sent_this_cycle: boolean;
          email_notifications_enabled: boolean;
          last_conversion_at: string | null;
          reengagement_email_sent: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          plan?: UserPlan;
          conversions_used_this_month?: number;
          billing_cycle_start?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          low_usage_email_sent_this_cycle?: boolean;
          email_notifications_enabled?: boolean;
          last_conversion_at?: string | null;
          reengagement_email_sent?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan?: UserPlan;
          conversions_used_this_month?: number;
          billing_cycle_start?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          low_usage_email_sent_this_cycle?: boolean;
          email_notifications_enabled?: boolean;
          last_conversion_at?: string | null;
          reengagement_email_sent?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      conversions: {
        Row: {
          id: string;
          user_id: string;
          input_type: InputType;
          input_url: string | null;
          input_text: string;
          tone: ToneType;
          topics: string[] | null;
          status: ConversionStatus;
          error_message: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          input_type: InputType;
          input_url?: string | null;
          input_text: string;
          tone: ToneType;
          topics?: string[] | null;
          status?: ConversionStatus;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          input_type?: InputType;
          input_url?: string | null;
          input_text?: string;
          tone?: ToneType;
          topics?: string[] | null;
          status?: ConversionStatus;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      outputs: {
        Row: {
          id: string;
          conversion_id: string;
          format: OutputFormat;
          content: string;
          version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversion_id: string;
          format: OutputFormat;
          content: string;
          version?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversion_id?: string;
          format?: OutputFormat;
          content?: string;
          version?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "outputs_conversion_id_fkey";
            columns: ["conversion_id"];
            isOneToOne: false;
            referencedRelation: "conversions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      reset_monthly_conversions: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: {
      user_plan: UserPlan;
      input_type: InputType;
      tone_type: ToneType;
      output_format: OutputFormat;
      conversion_status: ConversionStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for Supabase queries
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Conversion with related outputs
export interface ConversionWithOutputs extends Conversion {
  outputs: Output[];
}
