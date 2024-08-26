export type User = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
};

export type Proposal = {
  id: string;
  customer: string;
  customer_doc: string;
  created_at?: string;
  updated_at?: string;
  total_value?: string;
  pdf_link?: string;
  created_by: string;
  categories?: number[];
};

export type Category = "AUT" | "AV" | "RD" | "SEC";

export type BadgeVariant =
  | "default"
  | "outline"
  | "destructive"
  | "secondary"
  | "black"
  | null
  | undefined;

export type Order = {
  orderNumber: string;
  description: string;
  value: number;
};
