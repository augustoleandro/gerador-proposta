import { z } from "zod";

export const formProposalSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  propostalDate: z.date({ required_error: "É necessário informar a data." }),
  orders: z.array(
    z.object({
      orderNumber: z
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
          })
        )
        .min(1, { message: "Pelo menos um item é necessário." }),
      serviceDescription: z
        .string()
        .min(2, { message: "Nome deve ter no mínimo 2 caracteres" }),
    })
  ),
  paymentCondition: z
    .string()
    .min(1, { message: "Condição de pagamento é obrigatória." }),
  executionTime: z
    .string()
    .min(1, { message: "Tempo de execução é obrigatório." }),
  projectType: z.string().min(1, { message: "Tipo de projeto é obrigatório." }),
  proposalTotalValue: z
    .number()
    .min(0.01, { message: "Valor deve ser maior que zero." }),
  docRevision: z.string().min(2, { message: "Revisão é obrigatória." }),
});
