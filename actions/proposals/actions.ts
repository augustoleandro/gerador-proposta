"use server";

export async function createProposal(data: FormData) {
  const orders = JSON.parse(data.get("orders") as string);
  const proposalData = {
    ...Object.fromEntries(data),
    orders,
  };

  console.log("Proposta: ", JSON.stringify(proposalData, null, 2));
}
