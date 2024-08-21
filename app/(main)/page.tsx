import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { columns } from "./proposals/columns";
import { DataTable } from "./proposals/data-table";
import { getData } from "./proposals/getProposals";

export default async function HomePage() {
  const data = await getData();

  return (
    <div className="flex flex-col space-y-8 py-10 px-16">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Propostas</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Proposta
        </Button>
      </div>

      <DataTable columns={columns} data={data} />
    </div>
  );
}
