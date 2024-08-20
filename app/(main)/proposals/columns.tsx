"use client";

import { Proposal } from "@/lib/types";
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
