"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Proposal } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpDown, Download, EditIcon } from "lucide-react";
import Link from "next/link";
import { DeleteProposalDialog } from "./DeleteProposalDialog";

export const ColumnProposalTable: ColumnDef<Proposal>[] = [
  {
    accessorKey: "customer_name",
    header: ({ column }) => {
      return (
        <div className="w-64 flex items-center justify-start">
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
    cell: ({ cell }) => (
      <div className="overflow-hidden text-ellipsis">
        {cell.getValue() as string}
      </div>
    ),
  },
  {
    accessorKey: "tag",
    header: "Tag",
    cell: ({ row }) => {
      const tag = row.original.tag;
      return tag ? <Badge variant="default">{tag}</Badge> : "-";
    },
  },
  /* {
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
  }, */
  {
    accessorKey: "proposal_total_value",
    header: "Valor",
  },
  {
    accessorKey: "created_by",
    header: "Criado por",
    cell: ({ row }) => {
      const createdBy = row.original.created_by;
      return createdBy[1];
    },
  },
  {
    accessorKey: "created_at",
    header: "Criado em",
    cell: ({ row }) => {
      const dateValue = row.getValue("created_at");
      if (!dateValue) return "Data inválida";

      const date = parseISO(dateValue as string);
      if (!isValid(date)) return "Data inválida";

      return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
    },
  },
  {
    accessorKey: "city",
    header: "Automatize",
    cell: ({ row }) => {
      const city = row.original.city;
      return city === "gyn" ? "Goiânia" : "Brasília";
    },
  },
  {
    id: "actions",
    header: ({ column }) => {
      return <div className="w-16"></div>;
    },
    cell: ({ row }) => {
      const proposalId: string = row.original.id || "";
      const docLink: string = row.original.doc_link || "#";

      return (
        <div className="w-full flex items-center justify-end space-x-2">
          <Link href={`/propostas/${proposalId}`} className="link-button">
            <EditIcon className="w-5 h-5" />
          </Link>
          <Link href={docLink} target="_blank" className="link-button">
            <Download className="w-5 h-5" />
          </Link>
          <DeleteProposalDialog proposalId={proposalId} />
        </div>
      );
    },
  },
];
