export type AuthFieldsNameType = "email" | "password" | "name";

export interface AuthFieldsTypes {
  fieldName: AuthFieldsNameType;
  fieldType: "text" | "password" | "email" | "url";
  placeholder?: string;
}

export type AuthFormTypes = {
  fields: AuthFieldsTypes[];
  submitHandler: (data: Record<AuthFieldsNameType, string>) => void;
  title: string;
  subtitle: string;
  footerContent: React.ReactNode;
  isLoading?: boolean;
};

export interface AuthUserResponseType {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string | null;
  is_admin?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminStatsType {
  totals: {
    users: number;
    admins: number;
    designs: number;
    colors: number;
  };
  recent_users: AuthUserResponseType[];
  designs_per_user: {
    id: number;
    email: string;
    name: string;
    total_designs: number;
  }[];
}

export interface AdminUserType extends AuthUserResponseType {
  total_designs?: number;
  total_colors?: number;
}
