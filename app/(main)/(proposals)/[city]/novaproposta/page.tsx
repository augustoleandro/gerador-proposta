import FormProposal from "../../components/FormProposal";

function page({ params }: { params: { city: string } }) {
  return (
    <div className="flex-1 flex-col space-y-8 py-10 px-16">
      <div className="flex justify-between items-center">
        <h2 className="h2 text-primary">Nova Proposta</h2>
      </div>
      <FormProposal city={params.city} />
    </div>
  );
}

export default page;
