"use client";

import { Badge } from "@/components/ui/badge";
import { BadgeVariant, Category, Proposal } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import Link from "next/link";

const CategoryColors: Record<Category, BadgeVariant> = {
  AUT: "default",
  AV: "black",
  RD: "secondary",
  SEC: "outline",
};

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
        <Badge
          key={category}
          className="mr-1"
          variant={CategoryColors[category]}
        >
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
    cell: ({ row }) => {
      const link: string = row.getValue("pdf_link");
      return (
        <Link href={link} target="_blank" className="flex justify-end">
          <Download className="w-4 h-4 text-primary" />
        </Link>
      );
    },
  },
];
