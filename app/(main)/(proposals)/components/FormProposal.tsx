"use client";

import { createProposal, getProposalById } from "@/actions/proposals/actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectTypes } from "@/lib/options";
import { Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formProposalSchema } from "@/schemas/formProsposalSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FileTextIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OrderInput } from "../novaproposta/OrderInput";
import OrdersTable from "../novaproposta/OrdersTable";

interface FormProposalProps {
  proposalId?: string;
}

function FormProposal({ proposalId }: FormProposalProps) {
  const form = useForm<z.infer<typeof formProposalSchema>>({
    resolver: zodResolver(formProposalSchema),
    defaultValues: {
      proposal_date: new Date(),
      orders: [],
      payment_condition: "Entrada + 02 (duas parcelas) iguais",
      execution_time: "60 dias após liberação pela obra",
      project_type: "Soluções de Tecnologia Residencial",
      doc_revision: "00",
    },
  });

  useEffect(() => {
    async function fetchProposalData() {
      if (proposalId) {
        try {
          const proposalData = await getProposalById(proposalId);
          console.log("proposalData", proposalData);
          form.reset({
            ...proposalData,
            proposal_date: new Date(proposalData.proposal_date),
          });
        } catch (error) {
          console.error("Error loading proposal data:", error);
        }
      }
    }
    fetchProposalData();
  }, [proposalId, form]);

  async function onSubmit(data: z.infer<typeof formProposalSchema>) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "orders") {
        formData.append(key, JSON.stringify(value));
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, value.toString());
      }
    });
    try {
      const result = await createProposal(formData);
      console.log("Proposal created successfully:", result);
      // Adicione aqui a lógica para lidar com o sucesso (ex: mostrar uma mensagem, redirecionar, etc.)
    } catch (error) {
      console.error("Error creating proposal:", error);
      // Adicione aqui a lógica para lidar com o erro (ex: mostrar uma mensagem de erro)
    }
  }

  function addOrder(newOrder: Order) {
    if (!newOrder.items || newOrder.items.length === 0) {
      console.error("Tentativa de adicionar pedido sem itens");
      return;
    }
    form.setValue("orders", [...form.getValues("orders"), newOrder]);
  }

  function removeOrder(order_number: string) {
    form.setValue(
      "orders",
      form.getValues("orders").filter((o) => o.order_number !== order_number)
    );
  }

  function editOrder(order: Order) {
    form.setValue("orders", [
      ...form
        .getValues("orders")
        .filter((o) => o.order_number !== order.order_number),
      order,
    ]);
  }

  function moveOrder(index: number, direction: "up" | "down") {
    const newOrders = [...form.getValues("orders")];
    if (direction === "up" && index > 0) {
      [newOrders[index], newOrders[index - 1]] = [
        newOrders[index - 1],
        newOrders[index],
      ];
    } else if (direction === "down" && index < newOrders.length - 1) {
      [newOrders[index], newOrders[index + 1]] = [
        newOrders[index + 1],
        newOrders[index],
      ];
    }
    form.setValue("orders", newOrders);
  }

  const orders = form.watch("orders");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) =>
          console.error("Form validation errors:", errors)
        )}
        className="flex flex-col"
      >
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col">
                  <FormLabel className="text-secondary-foreground">
                    Nome do cliente:
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome do cliente..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="proposal_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-secondary-foreground">
                    Data:
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal leading-8",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        locale={ptBR}
                        lang="pt-BR"
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="leading-8" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doc_revision"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col max-w-14">
                  <FormLabel className="text-secondary-foreground">
                    Rev.:
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name="project_type"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col">
                  <FormLabel className="text-secondary-foreground">
                    Finalidade do projeto:
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} {...field}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de projeto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ProjectTypes.map((projectType) => (
                          <SelectItem key={projectType} value={projectType}>
                            {projectType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="payment_condition"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col">
                  <FormLabel className="text-secondary-foreground">
                    Condição de pagamento:
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite a condição de pagamento..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="execution_time"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col">
                  <FormLabel className="text-secondary-foreground">
                    Prazo de execução:
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o prazo de execução..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-col w-1/4">
            <FormLabel className="text-secondary-foreground">
              Adicionar Pedido (OMIE):
            </FormLabel>
            <OrderInput
              onOrderAdded={addOrder}
              existingOrders={form.getValues("orders") as Order[]}
            />
          </div>
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            <OrdersTable
              orders={orders as Order[]}
              moveOrder={moveOrder}
              editOrder={editOrder}
              removeOrder={removeOrder}
              form={form}
            />
          </div>
          <div className="w-full flex justify-end">
            <Button type="submit" size="lg" className="mt-4">
              <FileTextIcon className="w-4 h-4 mr-2 text-white" />
              {proposalId ? "Atualizar proposta" : "Gerar proposta"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
export default FormProposal;
