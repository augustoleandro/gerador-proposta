export type User = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
  user_role?: string;
};

export type Proposal = {
  id: string;
  customer_name: string;
  proposal_date: string;
  proposal_total_value: number;
  payment_condition: string;
  project_type: string;
  doc_revision: string;
  execution_time: string;
  created_at?: string;
  updated_at?: string;
  doc_link?: string;
  created_by: string;
  orders: Order[];
};

export interface Order {
  order_number: string;
  description: string;
  value: number;
  items: OrderItem[];
  service_description: string;
  //category: Category;
  created_at?: string;
  updated_at?: string;
}

export type OrderItem = {
  name: string;
  quantity: string;
  value: number;
  created_at?: string;
  updated_at?: string;
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

export const badgeVariants: Record<Category, BadgeVariant> = {
  AUT: "black",
  AV: "default",
  RD: "secondary",
  SEC: "outline",
};
