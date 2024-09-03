"use server";

import { Proposal } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
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
        customer_name: proposalData.customer_name,
        proposal_date: proposalData.proposal_date,
        proposal_total_value: proposalData.proposal_total_value,
        payment_condition: proposalData.payment_condition,
        project_type: proposalData.project_type,
        doc_revision: proposalData.doc_revision,
        execution_time: proposalData.execution_time,
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
          order_number: order.order_number,
          description: order.description,
          value: order.value,
          service_description: order.service_description,
          category_id: await supabase
            .from("categories")
            .select("id")
            .eq("name", order.category)
            .single()
            .then(({ data }) => data?.id),
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

export async function getProposals(): Promise<Proposal[]> {
  const supabase = createClient();

  const { data, error } = await supabase.from("proposals").select("*");

  if (!data) {
    return [];
  }

  const proposals = await Promise.all(
    data.map(async (proposal) => {
      const { data: user } = await supabase
        .from("users")
        .select("first_name")
        .eq("id", proposal.created_by)
        .single();

      const categories_ids = await supabase
        .from("orders")
        .select("category_id")
        .eq("proposal_id", proposal.id)
        .then(({ data }) =>
          Array.from(new Set(data?.map((category) => category.category_id)))
        );

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("name")
        .in("id", categories_ids);
      const categories = Array.from(
        new Set(categoriesData?.map((cat) => cat.name))
      );

      return {
        ...proposal,
        created_at: formatDate(proposal.created_at || ""),
        proposal_total_value: formatCurrency(
          proposal.proposal_total_value || ""
        ),
        created_by: user?.first_name || "",
        categories: categories,
      };
    })
  );
  return proposals;
}

export async function getProposalById(id: string): Promise<Proposal> {
  const supabase = createClient();

  const { data: proposalData, error: proposalError } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();

  if (!proposalData) {
    throw new Error("Proposal not found");
  }

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(*)
    `
    )
    .eq("proposal_id", id);

  if (ordersError) {
    throw new Error("Error fetching orders");
  }

  return {
    ...proposalData,
    orders: ordersData || [],
  };
}
