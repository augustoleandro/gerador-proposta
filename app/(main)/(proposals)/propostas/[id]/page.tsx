import FormProposal from "../../components/FormProposal";

export default function ViewProposal({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 flex-col space-y-8 py-10 px-16">
      <div className="flex justify-between items-center">
        <h2 className="h2 text-primary">Proposta</h2>
      </div>
      <FormProposal proposalId={params.id} />
    </div>
  );
}
