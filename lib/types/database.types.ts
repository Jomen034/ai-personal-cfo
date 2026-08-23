export type Database = {
  public: {
    Tables: {
      households: {
        Row: { id: string; name: string; emoji_icon: string | null; invite_code: string; created_at: string | null };
        Insert: { id?: string; name: string; emoji_icon?: string | null; invite_code: string; created_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["households"]["Insert"]>;
      };
      household_members: {
        Row: { id: string; household_id: string; auth_user_id: string; display_name: string; role: "admin" | "partner"; is_active: boolean; left_at: string | null; created_at: string | null };
        Insert: { id?: string; household_id: string; auth_user_id: string; display_name: string; role?: "admin" | "partner"; is_active?: boolean; left_at?: string | null; created_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["household_members"]["Insert"]>;
      };
      accounts: {
        Row: { id: string; household_id: string; name: string; account_type: string; current_balance: number; created_at: string | null };
        Insert: { id?: string; household_id: string; name: string; account_type: string; current_balance?: number; created_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["accounts"]["Insert"]>;
      };
      categories: {
        Row: { id: string; household_id: string | null; name: string; type: "income" | "expense"; parent_category_id: string | null; icon: string | null; is_default: boolean };
        Insert: { id?: string; household_id?: string | null; name: string; type: "income" | "expense"; parent_category_id?: string | null; icon?: string | null; is_default?: boolean };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      transactions: {
        Row: { id: string; household_id: string; member_id: string; account_id: string; category_id: string; transaction_type: "income" | "expense"; amount: number; transaction_date: string; note: string | null; created_at: string | null };
        Insert: { id?: string; household_id: string; member_id: string; account_id: string; category_id: string; transaction_type: "income" | "expense"; amount: number; transaction_date: string; note?: string | null; created_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
    };
    Functions: {
      join_household_by_invite: { Args: { join_code: string }; Returns: { household_id: string; member_id: string } };
      create_household: { Args: { household_name: string; new_invite_code: string }; Returns: { household_id: string; invite_code?: string; already_exists: boolean } };
    };
  };
};