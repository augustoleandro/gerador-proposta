import { z } from "zod";

export const formProposalSchema = z.object({
  customer_name: z
    .string()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  proposal_date: z.date({ required_error: "É necessário informar a data." }),
  orders: z.array(
    z.object({
      order_number: z
        .string()
        .min(1, { message: "Número do pedido é obrigatório." }),
      description: z.string().min(1, { message: "Descrição é obrigatória." }),
      value: z
        .number()
        .min(0.01, { message: "Valor deve ser maior que zero." }),
      items: z
        .array(
          z.object({
            name: z.string().min(1, { message: "Nome é obrigatório." }),
            quantity: z
              .string()
              .min(1, { message: "Quantidade deve ser maior que zero." }),
            value: z.number(),
          })
        )
        .min(1, { message: "Pelo menos um item é necessário." }),
      service_description: z
        .string()
        .min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
      //category: z.string().min(1, { message: "Categoria é obrigatória." }),
    })
  ),
  payment_condition: z
    .string()
    .min(1, { message: "Condição de pagamento é obrigatória." }),
  execution_time: z
    .string()
    .min(1, { message: "Tempo de execução é obrigatório." }),
  project_type: z
    .string()
    .min(1, { message: "Tipo de projeto é obrigatório." }),
  proposal_total_value: z
    .number()
    .min(0.01, { message: "Valor deve ser maior que zero." }),
  doc_revision: z.string().min(2, { message: "Revisão é obrigatória." }),
  tag: z
    .string()
    .max(20, { message: "Tag deve ter no máximo 20 caracteres." })
    .optional()
    .nullable(),
  city: z.string().optional().nullable(),
});
