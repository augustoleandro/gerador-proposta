import FormProposal from "../../components/FormProposal";

export default function ViewProposal({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Visualizar Proposta</h1>
      <FormProposal proposalId={params.id} />
    </div>
  );
}
