"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { badgeVariants, Category, Proposal } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download, EyeIcon } from "lucide-react";
import Link from "next/link";

export const columns: ColumnDef<Proposal>[] = [
  {
    accessorKey: "customer_name",
    header: ({ column }) => {
      return (
        <div className="flex items-center justify-start">
          Cliente
          <Button
            className="p-2 hover:bg-transparent"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
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
          variant={badgeVariants[category]}
        >
          {category}
        </Badge>
      ));
    },
  },
  {
    accessorKey: "proposal_total_value",
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
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const proposalId: string = row.original.id || "";
      const docLink: string = row.original.doc_link || "#";
      return (
        <div className="flex items-center justify-end space-x-2">
          <Link href={`/propostas/${proposalId}`} className="link-button">
            <EyeIcon className="w-5 h-5" />
          </Link>
          <Link href={docLink} target="_blank" className="link-button">
            <Download className="w-5 h-5" />
          </Link>
        </div>
      );
    },
  },
];
