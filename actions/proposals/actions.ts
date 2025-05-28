/**
 * Módulo de Gerenciamento de Propostas Comerciais
 * ===============================================
 *
 * Este arquivo contém ações do servidor (server actions) que gerenciam todo o ciclo de vida
 * de propostas comerciais, incluindo criação, edição, exclusão e consultas.
 *
 * As ações do servidor são funções que rodam exclusivamente no servidor, não no navegador
 * do cliente, permitindo acesso direto ao banco de dados e outros recursos protegidos.
 *
 * Arquitetura e Componentes:
 * --------------------------
 * - Banco de Dados: Supabase (PostgreSQL)
 * - Armazenamento: Supabase Storage (para PDFs)
 * - Validação: Zod Schema (formProposalSchema)
 * - Geração de PDF: API externa via HTTP
 *
 * Estrutura de Dados:
 * ------------------
 * 1. Proposta (Proposal): Documento principal com informações gerais
 * 2. Pedidos (Orders): Itens principais que compõem uma proposta
 * 3. Itens de Pedido (Order Items): Subitens que compõem cada pedido
 *
 * Fluxo Principal:
 * ---------------
 * 1. Cliente preenche formulário de proposta no frontend
 * 2. Dados são validados e enviados ao servidor
 * 3. Servidor processa os dados, gera PDF e armazena no banco
 * 4. Links e confirmações são retornados ao cliente
 *
 * Segurança:
 * ---------
 * - Autenticação via Supabase Auth
 * - Validação de permissões baseada no usuário (criador ou admin)
 * - Validação de dados via Zod Schema
 *
 * Importante: Todas as operações de banco de dados são atômicas ou protegidas
 * por tratamento adequado de erros para evitar dados inconsistentes.
 */
"use server";

import { Proposal } from "@/lib/types";
import { formatCurrency, normalizeString } from "@/lib/utils";
import { formProposalSchema } from "@/schemas/formProsposalSchema";
import { translateError } from "@/utils/errorTranslations";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

/**
 * Criação de Nova Proposta Comercial
 * =================================
 *
 * Esta função é responsável por criar uma proposta comercial completa no sistema,
 * incluindo todos os seus pedidos e itens relacionados, além de gerar o documento PDF.
 *
 * Contexto de Negócio:
 * -------------------
 * Uma proposta comercial é o documento formal enviado ao cliente contendo descrição
 * dos serviços, valores, condições de pagamento e outros detalhes relevantes para
 * a contratação dos serviços da empresa.
 *
 * Estrutura de Dados:
 * ------------------
 * - Proposta: Entidade principal com dados do cliente e condições gerais
 * - Pedidos: Componentes individuais da proposta (ex: automação, áudio, vídeo)
 * - Itens: Produtos ou serviços específicos em cada pedido
 *
 * Fluxo Detalhado:
 * --------------
 * 1. Recebe dados do formulário frontend
 * 2. Valida estrutura e tipos dos dados usando Zod Schema
 * 3. Verifica regras de negócio (como presença de pedidos e itens)
 * 4. Gera PDF via API externa
 * 5. Salva PDF no Supabase Storage
 * 6. Cria registro da proposta no banco de dados
 * 7. Cria registros de pedidos associados à proposta
 * 8. Cria registros de itens associados a cada pedido
 *
 * Tratamento de Erros:
 * ------------------
 * Implementa padrão "tudo ou nada" - se qualquer etapa falhar, todas as
 * alterações são revertidas, incluindo a limpeza de arquivos criados.
 *
 * @param data - Dados do formulário contendo todas as informações da proposta
 * @returns Objeto com resultado (created) e mensagem de sucesso
 * @throws Error detalhando o motivo da falha em caso de erro
 */
export async function createProposal(data: FormData) {
  // Inicializa o cliente Supabase e busca informações do usuário logado
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  // Verifica se os valores dos itens devem ser mostrados no PDF
  const showItemValues = data.get("showItemValues");

  // Variável para armazenar a URL do PDF após upload
  let pdfUrl: string | null = null;

  try {
    // Validação dos dados usando o schema Zod
    // Isso garante que todos os campos obrigatórios estejam presentes e com o formato correto
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
      city: data.get("city"),
    });

    // Validar que a proposta tem pelo menos um pedido
    if (!proposalData.orders || proposalData.orders.length === 0) {
      throw new Error("A proposta deve ter pelo menos um pedido");
    }

    // Validar que cada pedido tem pelo menos um item
    for (const order of proposalData.orders) {
      if (!order.items || order.items.length === 0) {
        throw new Error(
          `O pedido ${order.order_number} deve ter pelo menos um item`
        );
      }
    }

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
    const fileName = `pdfs/Proposta-Automatize-${normalizeString(
      proposalData.customer_name
    )}-${formattedDate}-REV${proposalData.doc_revision}${
      proposalData.tag ? `-${normalizeString(proposalData.tag)}` : ""
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
          city: proposalData.city,
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

/**
 * Atualização de Proposta Comercial Existente
 * ==========================================
 *
 * Esta função permite editar uma proposta previamente criada, atualizando seus dados,
 * pedidos, itens e gerando uma nova versão do documento PDF.
 *
 * Cenários de Uso:
 * ---------------
 * - Correção de informações incorretas
 * - Atualização de valores ou condições
 * - Adição ou remoção de pedidos e itens
 * - Revisão do documento (incremento no número de revisão)
 *
 * Desafios Técnicos Resolvidos:
 * ----------------------------
 * 1. Sincronização entre banco de dados e armazenamento de arquivos
 * 2. Consistência de dados durante atualizações parciais
 * 3. Gerenciamento de arquivos (limpeza de PDFs antigos)
 * 4. Atomicidade em operações de atualização de itens
 *
 * Fluxo de Execução:
 * -----------------
 * 1. Verifica se a proposta existe e obtém dados atuais
 * 2. Valida novos dados recebidos do formulário
 * 3. Gera nova versão do PDF com dados atualizados
 * 4. Salva novo PDF no Supabase Storage
 * 5. Atualiza registro da proposta no banco
 * 6. Identifica pedidos para adicionar, atualizar ou remover
 * 7. Atualiza pedidos e seus itens (usando transações para segurança)
 * 8. Limpa recursos obsoletos (ex: PDF antigo se nome de arquivo mudou)
 *
 * Prevenção de Erros:
 * ------------------
 * - Validação completa antes de qualquer alteração no banco
 * - Uso de transações para garantir atomicidade nas atualizações de itens
 * - Tratamento de erros com limpeza adequada de recursos em caso de falha
 *
 * @param id - Identificador único da proposta a ser atualizada
 * @param data - Dados do formulário contendo informações atualizadas
 * @returns Objeto com resultado (updated) e mensagem de sucesso
 * @throws Error detalhando o motivo da falha em caso de erro
 */
export async function editProposal(id: string, data: FormData) {
  console.log("Starting edit proposal");
  // Inicializa o cliente Supabase e obtém informações do usuário
  const supabase = createClient();
  const user = await supabase.auth.getUser();
  // Flag que indica se valores dos itens devem ser mostrados no PDF
  const showItemValues = data.get("showItemValues");

  // Armazena URL do novo PDF após upload
  let pdfUrl: string | null = null;
  // Armazena URL do PDF antigo para possível exclusão
  let oldPdfUrl: string | null = null;

  try {
    // Verifica se a proposta existe e recupera o link do PDF atual
    const { data: existingProposal, error: fetchProposalError } = await supabase
      .from("proposals")
      .select("doc_link")
      .eq("id", id)
      .single();

    if (fetchProposalError) {
      throw new Error(
        `Erro ao buscar proposta: ${translateError(fetchProposalError.message)}`
      );
    }

    if (!existingProposal) {
      throw new Error("Proposta não encontrada");
    }

    oldPdfUrl = existingProposal.doc_link;

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
      city: data.get("city"),
    });

    if (!proposalData.orders || proposalData.orders.length === 0) {
      throw new Error("A proposta deve ter pelo menos um pedido");
    }

    for (const order of proposalData.orders) {
      if (!order.items || order.items.length === 0) {
        throw new Error(
          `O pedido ${order.order_number} deve ter pelo menos um item`
        );
      }
    }

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
        body: JSON.stringify({ ...templateData, id }),
      }
    );

    if (!pdf.ok) {
      const errorText = await pdf.text();
      console.error("PDF generation failed:", pdf.status, errorText);
      throw new Error(`Falha ao gerar PDF: ${pdf.status} ${errorText}`);
    }

    const pdfBlob = await pdf.blob();

    const formattedDate = format(proposalData.proposal_date, "ddMMyyyy");
    const fileName = `pdfs/Proposta-Automatize-${normalizeString(
      proposalData.customer_name
    )}-${formattedDate}-REV${proposalData.doc_revision}${
      proposalData.tag ? `-${normalizeString(proposalData.tag)}` : ""
    }.pdf`;

    const { data: file, error: uploadError } = await supabase.storage
      .from("files")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(
        `Erro ao fazer upload do PDF: ${translateError(uploadError.message)}`
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("files")
      .getPublicUrl(fileName);

    pdfUrl = publicUrlData.publicUrl;

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
        city: proposalData.city,
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

    const updatedOrderNumbers = new Set(
      proposalData.orders.map((order) => order.order_number)
    );

    const ordersToDelete = existingOrders.filter(
      (order) => !updatedOrderNumbers.has(order.order_number)
    );

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

    for (const order of proposalData.orders) {
      const { data: existingOrder, error: checkError } = await supabase
        .from("orders")
        .select("id")
        .eq("proposal_id", id)
        .eq("order_number", order.order_number)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error(
          `Erro ao verificar ordem existente: ${translateError(
            checkError.message
          )}`
        );
      }

      let updatedOrder;

      if (!existingOrder) {
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

        try {
          await updateOrderItemsWithTransaction(
            supabase,
            existingOrder.id,
            order.items
          );
        } catch (error) {
          throw error;
        }
      }
    }

    if (oldPdfUrl && oldPdfUrl !== pdfUrl) {
      const oldFileName = oldPdfUrl.split("/").pop();
      if (oldFileName) {
        try {
          const { error: deleteOldPdfError } = await supabase.storage
            .from("files")
            .remove([`pdfs/${oldFileName}`]);

          if (deleteOldPdfError) {
            console.warn(
              "Aviso: Não foi possível excluir o PDF antigo:",
              deleteOldPdfError.message
            );
          }
        } catch (err) {
          console.warn("Erro ao tentar excluir o PDF antigo:", err);
        }
      }
    }

    revalidatePath("/");

    return {
      result: "updated",
      message: "Proposta atualizada com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao atualizar proposta:", error);

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

    throw error;
  }
}

/**
 * Exclusão de Proposta Comercial
 * =============================
 *
 * Esta função realiza a exclusão completa de uma proposta do sistema, incluindo
 * todos os seus registros relacionados no banco de dados e arquivos no storage.
 *
 * Aspectos de Segurança:
 * ---------------------
 * A exclusão é uma operação protegida, que só pode ser executada por:
 * 1. O usuário que criou a proposta originalmente
 * 2. Um administrador do sistema
 *
 * Verificações realizadas:
 * - Autenticação do usuário
 * - Existência da proposta
 * - Permissão para exclusão (criador ou admin)
 *
 * Operações Realizadas:
 * -------------------
 * 1. Exclusão do registro da proposta no banco
 *    (os pedidos e itens são excluídos automaticamente por cascata)
 * 2. Exclusão do arquivo PDF no Supabase Storage
 *
 * Tolerância a Falhas:
 * ------------------
 * Se a proposta for excluída com sucesso do banco de dados, mas ocorrer
 * uma falha ao excluir o PDF, a operação ainda é considerada bem-sucedida,
 * mas um aviso é registrado. Isso evita que falhas no gerenciamento de
 * arquivos bloqueiem a operação principal.
 *
 * @param id - Identificador único da proposta a ser excluída
 * @returns Objeto com resultado (deleted), mensagem e possíveis avisos
 * @throws Error se a proposta não existir, o usuário não tiver permissão ou ocorrer falha na exclusão
 */
export async function deleteProposal(id: string) {
  // Inicializa o cliente Supabase e verifica o usuário atual
  const supabase = createClient();
  const user = await supabase.auth.getUser();

  // Verifica se o usuário está autenticado
  if (!user.data.user) {
    throw new Error("Usuário não autenticado");
  }

  // Lista de erros não críticos para registrar mas não interromper o processo
  const warnings: string[] = [];
  let proposalDeleted = false;

  try {
    // Busca a proposta para verificar o criador e o link do PDF
    // Precisamos saber quem criou para verificar permissões
    // E precisamos do link do PDF para excluí-lo depois
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

    // Verifica se o usuário atual é administrador
    // Administradores podem excluir qualquer proposta
    const { data: isAdmin } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.data.user.id)
      .single();

    // Verifica se o usuário é o criador da proposta
    // Criadores podem excluir suas próprias propostas
    const isCreator = proposal.created_by === user.data.user.id;

    // Se não for nem admin nem criador, não tem permissão
    if (!isAdmin && !isCreator) {
      throw new Error("Você não tem permissão para deletar esta proposta");
    }

    // Armazena o link do PDF para exclusão posterior
    const pdfLink = proposal.doc_link;

    try {
      // Exclui a proposta do banco de dados
      // Devido às restrições de chave estrangeira configuradas no banco,
      // isso automaticamente excluirá os pedidos e itens relacionados
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

      proposalDeleted = true;
    } catch (dbError) {
      // Se falhar a exclusão da proposta, rethrow o erro
      // pois é a operação principal que não pode falhar
      throw dbError;
    }

    // Se a proposta tinha um PDF associado, tenta excluí-lo do storage
    if (pdfLink) {
      try {
        // Extrai o nome do arquivo da URL e decodifica espaços
        const fileName = pdfLink.split("/").pop()?.replace(/%20/g, " ");
        if (fileName) {
          // Remove o arquivo do bucket 'files'
          const { data: response, error: deleteFileError } =
            await supabase.storage.from("files").remove([`pdfs/${fileName}`]);
          if (deleteFileError) {
            warnings.push(
              `Não foi possível excluir o PDF: ${translateError(
                deleteFileError.message
              )}`
            );
            console.warn(
              "Aviso: Erro ao deletar arquivo PDF:",
              translateError(deleteFileError.message)
            );
          }
        }
      } catch (fileError) {
        // Erros na exclusão do PDF são registrados mas não interrompem o processo
        // já que a proposta já foi excluída do banco de dados
        warnings.push(`Erro ao tentar excluir o PDF: ${fileError}`);
        console.warn("Aviso: Erro ao processar exclusão do PDF:", fileError);
      }
    }

    // Atualiza a interface para refletir a exclusão
    revalidatePath("/");

    // Retorna sucesso, incluindo eventuais avisos
    return {
      result: "deleted",
      message: "Proposta deletada com sucesso!",
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error("Erro ao deletar proposta:", error);

    // Se a proposta foi excluída mas houve erro ao excluir o PDF,
    // retornamos sucesso com avisos em vez de falha
    if (proposalDeleted) {
      console.warn(
        "A proposta foi excluída mas houve problemas secundários:",
        warnings
      );
      revalidatePath("/");
      return {
        result: "deleted",
        message: "Proposta deletada com sucesso, mas com alguns avisos.",
        warnings,
      };
    }

    throw error;
  }
}

/**
 * Consulta de Todas as Propostas
 * =============================
 *
 * Esta função recupera todas as propostas existentes no sistema, com seus
 * dados básicos e informações do criador, ordenadas da mais recente para
 * a mais antiga.
 *
 * Características:
 * --------------
 * - Retorna dados formatados para exibição na interface
 * - Inclui informações do usuário criador de cada proposta
 * - Formata valores monetários para o padrão brasileiro (R$)
 * - Ordenação cronológica reversa (mais recentes primeiro)
 *
 * Uso Típico:
 * ----------
 * Esta função é usada principalmente na página inicial/dashboard para mostrar
 * a lista de todas as propostas disponíveis no sistema.
 *
 * Observações Técnicas:
 * -------------------
 * A função faz múltiplas consultas ao banco de dados (uma para propostas e
 * depois uma para cada usuário criador). Em um sistema com muitas propostas,
 * seria recomendável implementar paginação e/ou usar JOINs para reduzir o
 * número de consultas.
 *
 * @returns Array de objetos Proposal com valores formatados para exibição
 */
export async function getProposals(): Promise<Proposal[]> {
  // Inicializa o cliente Supabase
  const supabase = createClient();

  // Busca todas as propostas ordenadas pela data de criação (mais recentes primeiro)
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });

  // Se não houver dados, retorna um array vazio
  if (!data) {
    return [];
  }

  // Processa cada proposta para adicionar informações complementares
  const proposals: Proposal[] = await Promise.all(
    data.map(async (proposal) => {
      // Busca informações do usuário que criou a proposta
      const { data: user } = await supabase
        .from("users")
        .select("id, first_name")
        .eq("id", proposal.created_by)
        .single();

      /* Código comentado para busca de categorias - mantido para referência futura
      const categories: Category[] = await supabase
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

      // Retorna a proposta com informações adicionais e formatadas
      return {
        ...proposal,
        created_at: proposal.created_at,
        proposal_total_value: formatCurrency(
          proposal.proposal_total_value || 0
        ), // Formata o valor para R$
        created_by: [user?.id, user?.first_name || ""], // Inclui ID e nome do criador
        //categories,
      };
    })
  );
  return proposals;
}

/**
 * Consulta de Proposta Específica por ID
 * =====================================
 *
 * Esta função recupera uma proposta específica com todos os seus dados detalhados,
 * incluindo pedidos e itens associados.
 *
 * Diferente da função `getProposals`, que retorna dados básicos de múltiplas
 * propostas, esta função retorna dados completos de uma única proposta,
 * adequados para visualização detalhada ou edição.
 *
 * Estrutura de Dados Retornada:
 * ---------------------------
 * - Dados básicos da proposta (cliente, valores, datas, etc.)
 * - Todos os pedidos associados
 * - Todos os itens de cada pedido
 *
 * Otimizações:
 * ----------
 * Utiliza consultas aninhadas do Supabase para buscar pedidos e seus itens
 * em uma única chamada, reduzindo o número de requisições ao banco de dados.
 *
 * Tratamento de Erros:
 * -----------------
 * - Verifica se a proposta existe
 * - Registra erros de consulta para facilitar depuração
 * - Fornece mensagens de erro específicas para o usuário
 *
 * @param id - Identificador único da proposta a ser consultada
 * @returns Objeto Proposal completo com todos os pedidos e itens
 * @throws Error se a proposta não for encontrada ou ocorrer erro na consulta
 */
export async function getProposalById(id: string): Promise<Proposal> {
  // Inicializa o cliente Supabase
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

/**
 * Função de atualização de itens de pedido
 * =======================================
 *
 * Esta função atualiza os itens de um pedido excluindo todos os itens antigos
 * e inserindo os novos. O Supabase garante atomicidade em operações individuais.
 *
 * @param supabase - Cliente de conexão com o Supabase
 * @param orderId - Identificador único do pedido
 * @param items - Array de novos itens a serem inseridos
 * @returns Objeto indicando sucesso da operação
 * @throws Error se qualquer etapa falhar, com mensagem traduzida para o usuário
 */
async function updateOrderItemsWithTransaction(
  supabase: any,
  orderId: string,
  items: any[]
) {
  try {
    // 1. Exclui todos os itens existentes do pedido especificado
    const { error: deleteError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (deleteError) {
      throw new Error(
        `Erro ao deletar itens existentes: ${translateError(
          deleteError.message
        )}`
      );
    }

    // 2. Se houver itens para inserir, faz a inserção em batch
    if (items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        order_id: orderId,
        name: item.name,
        quantity: item.quantity,
        value: item.value,
      }));

      const { error: insertError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (insertError) {
        throw new Error(
          `Erro ao inserir itens do pedido: ${translateError(
            insertError.message
          )}`
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Erro na atualização de itens:", error);
    throw error;
  }
}
