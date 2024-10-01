"use server";

import { Proposal } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { formProposalSchema } from "@/schemas/formProsposalSchema";
import { translateError } from "@/utils/errorTranslations";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export async function createProposal(data: FormData) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  const showItemValues = data.get("showItemValues");

  let pdfUrl: string | null = null;

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
      tag: data.get("tag"),
      orders: JSON.parse(data.get("orders") as string),
    });

    // Generate PDF first
    const templateData = {
      ...proposalData,
      showItemValues,
    };

    const pdf = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/generate-pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
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
      .replace(/ç/g, "c")}-${formattedDate}-REV${proposalData.doc_revision}${
      proposalData.tag ? `-${proposalData.tag}` : ""
    }.pdf`;

    const { data: file, error: uploadError } = await supabase.storage
      .from("files")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
      });

    if (uploadError) {
      throw new Error(
        `Erro ao fazer upload do PDF: ${translateError(uploadError.message)}`
      );
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("files")
      .getPublicUrl(fileName);

    pdfUrl = publicUrlData.publicUrl;

    // Now save the proposal
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
          doc_link: pdfUrl,
          tag: proposalData.tag,
        },
      ])
      .select();

    if (proposalError) {
      throw new Error(
        `Erro ao salvar a proposta: ${translateError(proposalError.message)}`
      );
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
          },
        ])
        .select()
        .single();

      if (orderError) {
        throw new Error(
          `Erro ao salvar a ordem: ${translateError(orderError.message)}`
        );
      }

      if (!savedOrder) {
        throw new Error("Nenhuma ordem foi criada");
      }

      // Save order items
      for (const item of order.items) {
        const { error: itemError } = await supabase.from("order_items").insert([
          {
            order_id: savedOrder.id,
            name: item.name,
            quantity: item.quantity,
            value: item.value,
          },
        ]);

        if (itemError) {
          throw new Error(
            `Erro ao salvar o item da ordem: ${translateError(
              itemError.message
            )}`
          );
        }
      }
    }

    /* console.log(
      "Nova Proposta adicionada: ",
      JSON.stringify(proposalData, null, 2)
    ); */

    revalidatePath("/");

    return {
      result: "created",
      message: "Proposta criada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar proposta:", error);

    // Se o PDF foi criado mas houve um erro depois, vamos deletá-lo
    if (pdfUrl) {
      const fileName = pdfUrl.split("/").pop();
      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from("files")
          .remove([fileName]);

        if (deleteError) {
          console.error(
            "Erro ao deletar PDF após falha:",
            translateError(deleteError.message)
          );
        }
      }
    }

    throw error; // Re-throw o erro para que possa ser tratado pelo chamador
  }
}

export async function editProposal(id: string, data: FormData) {
  console.log("Starting edit proposal");
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  const showItemValues = data.get("showItemValues");

  let pdfUrl: string | null = null;

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
      tag: data.get("tag"),
      orders: JSON.parse(data.get("orders") as string),
    });

    // Generate PDF first
    const templateData = {
      ...proposalData,
      showItemValues,
    };

    // Generate new PDF first
    const pdf = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/generate-pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...templateData, id }),
      }
    );

    if (!pdf.ok) {
      const errorText = await pdf.text();
      console.error("PDF generation failed:", pdf.status, errorText);
      throw new Error(`Falha ao gerar PDF: ${pdf.status} ${errorText}`);
    }

    const pdfBlob = await pdf.blob();

    // Save new PDF to Supabase storage
    const formattedDate = format(proposalData.proposal_date, "ddMMyyyy");
    const fileName = `pdfs/Proposta-Automatize-${proposalData.customer_name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ç/g, "c")}-${formattedDate}-REV${proposalData.doc_revision}${
      proposalData.tag ? `-${proposalData.tag}` : ""
    }.pdf`;

    const { data: file, error: uploadError } = await supabase.storage
      .from("files")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
        upsert: true, // This will overwrite if the file already exists
      });

    if (uploadError) {
      throw new Error(
        `Erro ao fazer upload do PDF: ${translateError(uploadError.message)}`
      );
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from("files")
      .getPublicUrl(fileName);

    pdfUrl = publicUrlData.publicUrl;

    // Now update the proposal
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
        doc_link: pdfUrl,
        tag: proposalData.tag,
      })
      .eq("id", id)
      .select()
      .single();

    if (proposalError) {
      throw new Error(
        `Erro ao atualizar a proposta: ${translateError(proposalError.message)}`
      );
    }

    if (!updatedProposal) {
      throw new Error("Nenhuma proposta foi atualizada");
    }

    // Fetch all existing orders for this proposal
    const { data: existingOrders, error: fetchError } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("proposal_id", id);

    if (fetchError) {
      throw new Error(
        `Erro ao buscar ordens existentes: ${translateError(
          fetchError.message
        )}`
      );
    }

    // Create a set of order numbers from the incoming data
    const updatedOrderNumbers = new Set(
      proposalData.orders.map((order) => order.order_number)
    );

    // Find orders to delete (those in existingOrders but not in updatedOrderNumbers)
    const ordersToDelete = existingOrders.filter(
      (order) => !updatedOrderNumbers.has(order.order_number)
    );

    // Delete orders that are no longer present
    for (const order of ordersToDelete) {
      const { error: deleteError } = await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (deleteError) {
        throw new Error(
          `Erro ao deletar ordem: ${translateError(deleteError.message)}`
        );
      }
    }

    // Update or insert orders
    for (const order of proposalData.orders) {
      // Check if the order already exists
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id")
        .eq("proposal_id", id)
        .eq("order_number", order.order_number)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is the code for "no rows returned"
        throw new Error(
          `Erro ao verificar ordem existente: ${translateError(
            checkError.message
          )}`
        );
      }

      let updatedOrder;

      if (!existingOrder) {
        // If the order doesn't exist, insert a new one
        const { data: newOrder, error: orderError } = await supabase
          .from("orders")
          .insert([
            {
              proposal_id: id,
              order_number: order.order_number,
              description: order.description,
              value: order.value,
              service_description: order.service_description,
            },
          ])
          .select()
          .single();

        if (orderError) {
          throw new Error(
            `Erro ao inserir nova ordem: ${translateError(orderError.message)}`
          );
        }

        updatedOrder = newOrder;

        // Insert items only for new orders
        for (const item of order.items) {
          const { error: itemError } = await supabase
            .from("order_items")
            .insert({
              order_id: updatedOrder.id,
              name: item.name,
              quantity: item.quantity,
              value: item.value,
            });

          if (itemError) {
            throw new Error(
              `Erro ao inserir item do pedido: ${translateError(
                itemError.message
              )}`
            );
          }
        }
      } else {
        // If the order already exists, just update the order data, not the items
        const { data: updatedOrderData, error: updateError } = await supabase
          .from("orders")
          .update({
            description: order.description,
            value: order.value,
            service_description: order.service_description,
          })
          .eq("id", existingOrder.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(
            `Erro ao atualizar ordem existente: ${translateError(
              updateError.message
            )}`
          );
        }

        updatedOrder = updatedOrderData;
      }
    }

    revalidatePath("/");

    return {
      result: "updated",
      message: "Proposta atualizada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao atualizar proposta:", error);

    // If the PDF was created but there was an error afterwards, let's delete it
    if (pdfUrl) {
      const fileName = pdfUrl.split("/").pop();
      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from("files")
          .remove([fileName]);

        if (deleteError) {
          console.error(
            "Erro ao deletar PDF após falha:",
            translateError(deleteError.message)
          );
        }
      }
    }

    throw error; // Re-throw the error so it can be handled by the caller
  }
}

export async function deleteProposal(id: string) {
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    throw new Error("Usuário não autenticado");
  }

  try {
    // Buscar a proposta para verificar o criador e o link do PDF
    const { data: proposal, error: fetchError } = await supabase
      .from("proposals")
      .select("created_by, doc_link")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(
        `Erro ao buscar proposta: ${translateError(fetchError.message)}`
      );
    }

    if (!proposal) {
      throw new Error("Proposta não encontrada");
    }

    const { data: isAdmin } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.data.user.id)
      .single();

    const isCreator = proposal.created_by === user.data.user.id;

    if (!isAdmin && !isCreator) {
      throw new Error("Você não tem permissão para deletar esta proposta");
    }

    // Deletar a proposta
    const { error: deleteProposalError } = await supabase
      .from("proposals")
      .delete()
      .eq("id", id);

    if (deleteProposalError) {
      throw new Error(
        `Erro ao deletar proposta: ${translateError(
          deleteProposalError.message
        )}`
      );
    }

    // Deletar o PDF do storage
    if (proposal.doc_link) {
      const fileName = proposal.doc_link.split("/").pop()?.replace(/%20/g, " ");
      console.log("fileName: ", fileName);
      if (fileName) {
        const { data: response, error: deleteFileError } =
          await supabase.storage.from("files").remove([`pdfs/${fileName}`]);
        if (deleteFileError) {
          console.error(
            "Erro ao deletar arquivo PDF:",
            translateError(deleteFileError.message)
          );
        }
      }
    }

    revalidatePath("/");

    return {
      result: "deleted",
      message: "Proposta deletada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao deletar proposta:", error);
    throw error;
  }
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
        .select("id, first_name")
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
        created_by: [user?.id, user?.first_name || ""],
        //categories,
      };
    })
  );
  return proposals;
}

export async function getProposalById(id: string): Promise<Proposal> {
  const supabase = createClient();

  try {
    const { data: proposalData, error: proposalError } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", id)
      .single();

    if (proposalError) {
      console.error(`Erro ao buscar proposta: ${proposalError.message}`);
      throw new Error(`Erro ao buscar proposta: ${proposalError.message}`);
    }

    if (!proposalData) {
      console.error(`Proposta não encontrada para o ID: ${id}`);
      throw new Error("Proposta não encontrada");
    }

    console.log(`Proposta encontrada, buscando pedidos...`);

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

    console.log(`Pedidos encontrados: ${ordersData?.length || 0}`);

    /* const processedOrders = ordersData?.map((order) => ({
      ...order,
      category: order.category?.name || null,
    })); */

    return {
      ...proposalData,
      orders: ordersData || [],
    };
  } catch (error) {
    console.error("Error fetching proposal by ID:", error);
    throw error;
  }
}
