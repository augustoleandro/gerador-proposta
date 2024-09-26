"use client";

import {
  createProposal,
  editProposal,
  getProposalById,
} from "@/actions/proposals/actions";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { ProjectTypes } from "@/lib/options";
import { Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formProposalSchema } from "@/schemas/formProsposalSchema";
import { translateError } from "@/utils/errorTranslations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, FileTextIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OrderInput } from "./OrderInput";
import OrdersTable from "./OrdersTable";

interface FormProposalProps {
  proposalId?: string;
}

function FormProposal({ proposalId }: FormProposalProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItemValues, setShowItemValues] = useState(false);

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
    setIsSubmitting(true);

    try {
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

      formData.append("showItemValues", showItemValues.toString());

      let result;
      if (proposalId) {
        result = await editProposal(proposalId, formData);
      } else {
        result = await createProposal(formData);
      }

      if (result.result === "created") {
        toast({
          title: `Proposta criada com sucesso!`,
          variant: "success",
        });
      } else if (result.result === "updated") {
        toast({
          title: `Proposta atualizada com sucesso!`,
          variant: "success",
        });
      }
      router.push("/");
    } catch (error) {
      console.error(
        `Error ${proposalId ? "updating" : "creating"} proposal:`,
        error
      );
      toast({
        title: `Erro ao ${proposalId ? "atualizar" : "criar"} proposta`,
        description:
          error instanceof Error
            ? translateError(error.message)
            : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
    const currentOrders = form.getValues("orders");
    const orderIndex = currentOrders.findIndex(
      (o) => o.order_number === order.order_number
    );
    if (orderIndex !== -1) {
      const newOrders = [...currentOrders];
      newOrders[orderIndex] = order;
      form.setValue("orders", newOrders);
    }
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
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
          <div className="w-full flex justify-end items-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <Switch
                id="show-values"
                checked={showItemValues}
                onCheckedChange={(checked) => {
                  setShowItemValues(checked);
                }}
              />
              <Label
                htmlFor="show-values"
                className="text-sm text-secondary-foreground"
              >
                Mostrar valores
              </Label>
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-36"
              disabled={
                isSubmitting ||
                orders.length === 0 ||
                Object.keys(form.formState.errors).length > 0
              }
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileTextIcon className="w-4 h-4 mr-2 text-white" />
              )}
              {isSubmitting ? "Aguarde..." : proposalId ? "Atualizar" : "Gerar"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
export default FormProposal;
