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

export type Category = {
  id: string;
  name: "AUT" | "AV" | "RD" | "SEC";
};
