"use server";

import { Proposal } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { formProposalSchema } from "@/schemas/formProsposalSchema";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export async function createProposal(data: FormData) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  let createdProposal: any = null;

  try {
    // Validate and parse data using formProposalSchema
    const proposalData = formProposalSchema.parse({
      customer_name: data.get("customer_name"),
      proposal_date: new Date(data.get("proposal_date") as string),
      proposal_total_value: Number(data.get("proposal_total_value")),
      payment_condition: data.get("payment_condition"),
      project_type: data.get("project_type"),
      doc_revision: data.get("doc_revision"),
      execution_time: data.get("execution_time"),
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
          created_by: user.data.user?.id || null,
        },
      ])
      .select();

    if (proposalError) {
      throw new Error(`Error saving proposal: ${proposalError.message}`);
    }

    createdProposal = proposal;

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
            /* category_id: await supabase
            .from("categories")
            .select("id")
            .eq("name", order.category)
            .single()
            .then(({ data }) => data?.id), */
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

    // Generate PDF
    const pdf = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/generate-pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(proposalData),
      }
    );

    if (!pdf.ok) {
      const errorText = await pdf.text();
      console.error("PDF generation failed:", pdf.status, errorText);
      throw new Error(`Falha ao gerar PDF: ${pdf.status} ${errorText}`);
    }

    const pdfBlob = await pdf.blob();

    // Save PDF to Supabase storage
    const formattedDate = format(proposalData.proposal_date, "ddMMyyyy");
    const fileName = `pdfs/Proposta-Automatize-${proposalData.customer_name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ç/g, "c")}-${formattedDate}-REV${
      proposalData.doc_revision
    }.pdf`;

    const { data: file, error: uploadError } = await supabase.storage
      .from("files")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
      });

    if (uploadError) {
      throw new Error(`Error uploading PDF: ${uploadError.message}`);
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("files")
      .getPublicUrl(fileName);

    // Update proposal with doc_link
    const { error: updateError } = await supabase
      .from("proposals")
      .update({ doc_link: publicUrlData.publicUrl })
      .eq("id", proposal[0].id);

    if (updateError) {
      throw new Error(
        `Error updating proposal with doc_link: ${updateError.message}`
      );
    }

    console.log(
      "Nova Proposta adicionada: ",
      JSON.stringify(proposalData, null, 2)
    );

    revalidatePath("/");

    return {
      result: "created",
      message: "Proposta criada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar proposta:", error);

    // Se a proposta foi criada mas houve um erro depois, vamos deletá-la
    if (createdProposal) {
      const { error: deleteError } = await supabase
        .from("proposals")
        .delete()
        .eq("id", createdProposal.id);

      if (deleteError) {
        console.error("Erro ao deletar proposta após falha:", deleteError);
      }
    }

    throw error; // Re-throw o erro para que possa ser tratado pelo chamador
  }
}

export async function editProposal(id: string, data: FormData) {
  console.log("Starting edit proposal");
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  // Validate and parse data using formProposalSchema
  const proposalData = formProposalSchema.parse({
    customer_name: data.get("customer_name"),
    proposal_date: new Date(data.get("proposal_date") as string),
    proposal_total_value: Number(data.get("proposal_total_value")),
    payment_condition: data.get("payment_condition"),
    project_type: data.get("project_type"),
    doc_revision: data.get("doc_revision"),
    execution_time: data.get("execution_time"),
    orders: JSON.parse(data.get("orders") as string),
  });

  // Update proposal
  const { data: updatedProposal, error: proposalError } = await supabase
    .from("proposals")
    .update({
      customer_name: proposalData.customer_name,
      proposal_date: proposalData.proposal_date,
      proposal_total_value: proposalData.proposal_total_value,
      payment_condition: proposalData.payment_condition,
      project_type: proposalData.project_type,
      doc_revision: proposalData.doc_revision,
      execution_time: proposalData.execution_time,
    })
    .eq("id", id)
    .select();

  if (proposalError) {
    throw new Error(`Error updating proposal: ${proposalError.message}`);
  }

  if (!updatedProposal || updatedProposal.length === 0) {
    throw new Error("No proposal was updated");
  }

  // Update existing orders and items
  // Primeiro, busque todas as orders existentes para esta proposal
  const { data: existingOrders, error: fetchError } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("proposal_id", id);

  if (fetchError) {
    throw new Error(`Error fetching existing orders: ${fetchError.message}`);
  }

  // Crie um conjunto de order_numbers da nova lista de orders
  const updatedOrderNumbers = new Set(
    proposalData.orders.map((o) => o.order_number)
  );

  // Identifique e delete as orders que não estão mais na lista atualizada
  for (const existingOrder of existingOrders || []) {
    if (!updatedOrderNumbers.has(existingOrder.order_number)) {
      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .eq("id", existingOrder.id);

      if (deleteError) {
        throw new Error(`Error deleting order: ${deleteError.message}`);
      }
    }
  }

  // Agora, atualize ou insira as orders da nova lista
  for (const order of proposalData.orders) {
    const { data: updatedOrder, error: orderError } = await supabase
      .from("orders")
      .upsert(
        {
          proposal_id: id,
          order_number: order.order_number,
          description: order.description,
          value: order.value,
          service_description: order.service_description,
          /* category_id: await supabase
            .from("categories")
            .select("id")
            .eq("name", order.category)
            .single()
            .then(({ data }) => data?.id), */
        },
        { onConflict: "proposal_id,order_number" }
      )
      .select()
      .single();

    if (orderError) {
      throw new Error(`Error updating order: ${orderError.message}`);
    }

    if (!updatedOrder) {
      throw new Error("No order was updated or created");
    }

    // Atualizar ou inserir os itens da ordem
    for (const item of order.items) {
      const { error: itemError } = await supabase.from("order_items").upsert({
        order_id: updatedOrder.id,
        name: item.name,
        quantity: item.quantity,
      });

      if (itemError) {
        throw new Error(
          `Error updating/inserting order item: ${itemError.message}`
        );
      }
    }
  }

  console.log("Proposta atualizada: ", JSON.stringify(proposalData, null, 2));

  revalidatePath("/");

  return {
    result: "updated",
    message: "Proposta atualizada com sucesso!",
  };
}

export async function getProposals(): Promise<Proposal[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) {
    return [];
  }

  const proposals: Proposal[] = await Promise.all(
    data.map(async (proposal) => {
      const { data: user } = await supabase
        .from("users")
        .select("first_name")
        .eq("id", proposal.created_by)
        .single();

      /* const categories: Category[] = await supabase
        .from("orders")
        .select("category_id")
        .eq("proposal_id", proposal.id)
        .then(async ({ data }) => {
          const categoryIds = Array.from(
            new Set(data?.map((order) => order.category_id))
          );
          const { data: categoriesData } = await supabase
            .from("categories")
            .select("name")
            .in("id", categoryIds);
          return Array.from(new Set(categoriesData?.map((cat) => cat.name)));
        }); */

      return {
        ...proposal,
        created_at: proposal.created_at,
        proposal_total_value: formatCurrency(
          proposal.proposal_total_value || 0
        ),
        created_by: user?.first_name || "",
        //categories,
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
      items:order_items(*),
    `
    )
    .eq("proposal_id", id);

  if (ordersError) {
    throw new Error("Error fetching orders");
  }

  /* const processedOrders = ordersData?.map((order) => ({
    ...order,
    category: order.category?.name || null,
  })); */

  return {
    ...proposalData,
    orders: ordersData || [],
  };
}
