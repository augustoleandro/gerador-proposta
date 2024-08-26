"use client";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import { getOrder } from "@/services/omie";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Edit3Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OrderDialog } from "./OrderDialog";

const formSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: "Nome deve ter no mínimo 2 caracteres" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),
  propostalDate: z.date({ required_error: "É necessário informar a data." }),
  orderNumber: z.number().min(0),
});

function FormProposal() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      propostalDate: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const [orders, setOrders] = useState<Order[]>([]);

  const [orderNumber, setOrderNumber] = useState<string>("");

  const addOrder = async (newOrder: Order) => {
    await getOrder(orderNumber);
    setOrders([...orders, newOrder]);
  };

  const removeOrder = (orderNumber: string) => {
    setOrders(orders.filter((o) => o.orderNumber !== orderNumber));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        <div className="space-y-4">
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem className="flex-1 flex-col justify-between">
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
                <FormItem className="flex flex-col justify-between">
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
          <FormField
            control={form.control}
            name="orderNumber"
            render={({ field }) => (
              <FormItem className="flex-col justify-between w-1/4">
                <FormLabel className="text-secondary-foreground leading-2">
                  Adicionar Pedido:
                </FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nº do pedido"
                      {...field}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      value={orderNumber}
                    />
                    <OrderDialog
                      orderNumber="1"
                      totalValue={1000}
                      onSave={addOrder}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {orders && orders.length > 0 && (
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
                  {orders.map((order) => (
                    <TableRow key={order.orderNumber}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.description}</TableCell>
                      <TableCell>
                        {formatCurrency(String(order.value))}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Edit3Icon className="w-4 h-4" />
                          </Button>
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
                </TableBody>
              </Table>
            </div>
          )}
          <Button type="submit" className="max-w-32 mt-4">
            Enviar
          </Button>
        </div>
      </form>
    </Form>
  );
}
export default FormProposal;
