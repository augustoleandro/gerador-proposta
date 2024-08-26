import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./propostas/columns";
import { DataTable } from "./propostas/data-table";
import { getData } from "./propostas/getProposals";

export default async function HomePage() {
  const data = await getData();

  return (
    <div className="flex flex-col space-y-8 py-10 px-16">
      <div className="flex justify-between items-center">
        <h2 className="h2 text-primary">Propostas</h2>
        <Link href="/novaproposta">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
