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
  customerName: string;
  proposalDate: string;
  proposalTotalValue: number;
  paymentCondition: string;
  projectType: string;
  docRevision: string;
  executionTime: string;
  createdAt?: string;
  updatedAt?: string;
  docLink?: string;
  createdBy: string;
  orders: Order[];
};

export interface Order {
  orderNumber: string;
  description: string;
  value: number;
  items: OrderItem[];
  serviceDescription: string;
  category: Category;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderItem = {
  name: string;
  quantity: string;
  createdAt?: string;
  updatedAt?: string;
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
