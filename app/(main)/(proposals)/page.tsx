import { getProposals } from "@/actions/proposals/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ColumnProposalTable } from "./components/ColumnPropostalTable";
import { DataProposalTable } from "./components/DataProposalTable";

export default async function HomePage() {
  const data = await getProposals();

  return (
    <div className="flex flex-col space-y-2 py-8 px-8">
      <div className="flex justify-between items-center">
        <h2 className="h2 text-primary">Propostas</h2>
        <Link href="/novaproposta">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </Link>
      </div>

      <DataProposalTable columns={ColumnProposalTable} data={data} />
    </div>
  );
}
