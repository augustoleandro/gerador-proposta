"use server";

import { formProposalSchema } from "@/schemas/formProsposalSchema";
import { createClient } from "@/utils/supabase/server";

export async function createProposal(data: FormData) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  console.log("user: ", user);

  // Validate and parse data using formProposalSchema
  const proposalData = formProposalSchema.parse({
    customerName: data.get("customerName"),
    proposalDate: new Date(data.get("proposalDate") as string),
    proposalTotalValue: Number(data.get("proposalTotalValue")),
    paymentCondition: data.get("paymentCondition"),
    projectType: data.get("projectType"),
    docRevision: data.get("docRevision"),
    executionTime: data.get("executionTime"),
    orders: JSON.parse(data.get("orders") as string),
  });

  // Save proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .insert([
      {
        customer_name: proposalData.customerName,
        proposal_date: proposalData.proposalDate,
        proposal_total_value: proposalData.proposalTotalValue,
        payment_condition: proposalData.paymentCondition,
        project_type: proposalData.projectType,
        doc_revision: proposalData.docRevision,
        execution_time: proposalData.executionTime,
        created_by: (await supabase.auth.getUser()).data.user?.id || null,
      },
    ])
    .select();

  if (proposalError) {
    throw new Error(`Error saving proposal: ${proposalError.message}`);
  }

  if (!proposal || proposal.length === 0) {
    throw new Error("No proposal was created");
  }

  // Save orders
  for (const order of proposalData.orders) {
    const { data: savedOrder, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          proposal_id: proposal[0].id,
          order_number: order.orderNumber,
          description: order.description,
          value: order.value,
          service_description: order.serviceDescription,
        },
      ])
      .select()
      .single();

    if (orderError) {
      throw new Error(`Error saving order: ${orderError.message}`);
    }

    if (!savedOrder) {
      throw new Error("No order was created");
    }

    // Save order items
    for (const item of order.items) {
      const { error: itemError } = await supabase.from("order_items").insert([
        {
          order_id: savedOrder.id,
          name: item.name,
          quantity: item.quantity,
        },
      ]);

      if (itemError) {
        throw new Error(`Error saving order item: ${itemError.message}`);
      }
    }
  }

  console.log("Proposta: ", JSON.stringify(proposalData, null, 2));
}
