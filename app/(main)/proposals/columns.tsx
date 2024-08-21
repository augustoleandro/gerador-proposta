"use client";

import { Badge } from "@/components/ui/badge";
import { Category, Proposal } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<Proposal>[] = [
  {
    accessorKey: "customer",
    header: "Cliente",
  },
  {
    accessorKey: "customer_doc",
    header: "CPNJ/CPF",
  },

  {
    accessorKey: "categories",
    header: "Categorias",
    cell: ({ row }) => {
      const categories: Category[] = row.getValue("categories");
      return categories.map((category) => (
        <Badge key={category} className="mr-1" variant="default">
          {category}
        </Badge>
      ));
    },
  },
  {
    accessorKey: "total_value",
    header: "Valor",
  },
  {
    accessorKey: "created_by",
    header: "Criado por",
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
  },
  {
    accessorKey: "pdf_link",
    header: "Link",
  },
];
