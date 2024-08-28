"use client";

import { createProposal } from "@/actions/proposals/actions";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectTypes } from "@/lib/options";
import { Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  FileTextIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EditOrderDialog } from "./EditOrderDialog";
import { NewOrderDialog } from "./NewOrderDialog";

const formSchema = z.object({
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
});

function FormProposal() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      propostalDate: new Date(),
      orders: [],
      paymentCondition: "Entrada + 02 (duas parcelas) iguais",
      executionTime: "60 dias após liberação pela obra",
      projectType: "Soluções de Tecnologia Residencial",
    },
  });

  const [orderNumber, setOrderNumber] = useState<string>("");

  async function onSubmit(data: z.infer<typeof formSchema>) {
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

    await createProposal(formData);
  }

  function addOrder(newOrder: Order) {
    form.setValue("orders", [...form.getValues("orders"), newOrder]);
    console.log("orders: ", form.getValues("orders"));
  }

  function removeOrder(orderNumber: string) {
    form.setValue(
      "orders",
      form.getValues("orders").filter((o) => o.orderNumber !== orderNumber)
    );
  }

  function editOrder(order: Order) {
    form.setValue("orders", [
      ...form
        .getValues("orders")
        .filter((o) => o.orderNumber !== order.orderNumber),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <div className="space-y-4">
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col">
                  <FormLabel className="text-secondary-foreground leading-2">
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
              name="propostalDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-secondary-foreground leading-2">
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
          </div>
          <div>
            <FormField
              control={form.control}
              name="projectType"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col">
                  <FormLabel className="text-secondary-foreground leading-2">
                    Finalidade do projeto:
                  </FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      {...field}
                    >
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
              name="paymentCondition"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col">
                  <FormLabel className="text-secondary-foreground leading-2">
                    Condição de pagamento:
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite a condição de pagamento..."
                      defaultValue={field.value}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="executionTime"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col">
                  <FormLabel className="text-secondary-foreground leading-2">
                    Prazo de execução:
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o prazo de execução..."
                      defaultValue={field.value}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="orders"
            render={({ field }) => (
              <FormItem className="flex-col w-1/4">
                <FormLabel className="text-secondary-foreground leading-2">
                  Adicionar Pedido (OMIE):
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nº do pedido"
                      {...field}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      value={orderNumber}
                    />
                    <NewOrderDialog
                      orderNumber={orderNumber}
                      totalValue={1000}
                      onSave={addOrder}
                      resetOrderNumber={() => setOrderNumber("")}
                      orders={orders}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº do Pedido</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor (R$)</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders && orders.length > 0 ? (
                  <>
                    {orders.map((order, index) => (
                      <TableRow key={order.orderNumber}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex items-center h-min mr-2 py-0">
                              <Button
                                type="button"
                                className="bg-transparent hover:bg-transparent disabled:opacity-0 py-0"
                                size="sm"
                                onClick={() => moveOrder(index, "up")}
                                disabled={index === 0}
                              >
                                <ArrowUpIcon className="w-3 h-3 text-secondary-foreground hover:text-primary p-0" />
                              </Button>
                              <Button
                                type="button"
                                className="bg-transparent hover:bg-transparent disabled:opacity-0 p-0"
                                size="sm"
                                onClick={() => moveOrder(index, "down")}
                                disabled={index === orders.length - 1}
                              >
                                <ArrowDownIcon className="w-3 h-3 text-secondary-foreground hover:text-primary" />
                              </Button>
                            </div>
                            {order.orderNumber}
                          </div>
                        </TableCell>
                        <TableCell>{order.description}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(order.value)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <EditOrderDialog order={order} onSave={editOrder} />
                            <Button
                              type="button"
                              onClick={() => {
                                console.log("order: ", order.orderNumber);
                                removeOrder(order.orderNumber);
                              }}
                              variant="destructive"
                              size="sm"
                            >
                              <Trash2Icon className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-primary/10 hover:bg-primary/10">
                      <TableCell colSpan={2} className="font-bold text-right">
                        Total:
                      </TableCell>
                      <TableCell className="font-bold">
                        {(() => {
                          const proposalTotalValue = orders.reduce(
                            (sum, order) => sum + order.value,
                            0
                          );
                          form.setValue(
                            "proposalTotalValue",
                            proposalTotalValue
                          );
                          return new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(proposalTotalValue);
                        })()}
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Pedido não adicionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Button type="submit" className="max-w-32 mt-4">
            <FileTextIcon className="w-4 h-4 mr-2 text-white" />
            Gerar proposta
          </Button>
        </div>
      </form>
    </Form>
  );
}
export default FormProposal;
