import { getProposals } from "@/actions/proposals/actions";
import { ColumnProposalTable } from "./components/ColumnPropostalTable";
import { DataProposalTable } from "./components/DataProposalTable";
import DropDownNewPropostal from "./components/DropDownNewPropostal";

export default async function HomePage() {
  const data = await getProposals();

  return (
    <div className="flex flex-col space-y-2 py-8 px-8">
      <div className="flex justify-between items-center">
        <h2 className="h2 text-primary">Propostas</h2>
        <DropDownNewPropostal />
      </div>

      <DataProposalTable columns={ColumnProposalTable} data={data} />
    </div>
  );
}
