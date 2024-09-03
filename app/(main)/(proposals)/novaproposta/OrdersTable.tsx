import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Order } from "@/lib/types";
import { formProposalSchema } from "@/schemas/formProsposalSchema";
import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { EditOrderDialog } from "./EditOrderDialog";
import { OrderItemsDialog } from "./OrderItemsDialog";

interface OrdersTableProps {
  orders: Order[];
  form: UseFormReturn<z.infer<typeof formProposalSchema>>;
  moveOrder: (index: number, direction: "up" | "down") => void;
  editOrder: (order: Order) => void;
  removeOrder: (order_number: string) => void;
}

function OrdersTable({
  orders,
  moveOrder,
  editOrder,
  removeOrder,
  form,
}: OrdersTableProps) {
  return (
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
              <TableRow key={order.order_number}>
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
                    {order.order_number}
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
                    <OrderItemsDialog order={order} onSave={editOrder} />
                    <EditOrderDialog order={order} onSave={editOrder} />
                    <Button
                      type="button"
                      onClick={() => {
                        removeOrder(order.order_number);
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
                  if (form && typeof form.setValue === "function") {
                    form.setValue("proposal_total_value", proposalTotalValue);
                  }
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
  );
}

export default OrdersTable;
