import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import SelectEditable from "@/components/ui/selectEditable";
import { toast } from "@/components/ui/use-toast";
import { OrdersTitles } from "@/lib/options";
import { Order, OrderItem } from "@/lib/types";
import { getOrder } from "@/services/omie";
import { Loader2, PlusIcon } from "lucide-react";
import { useState } from "react";

export function NewOrderDialog({
  orderNumber,
  onSave,
  orders,
  resetOrderNumber,
}: {
  orderNumber: string;
  totalValue: number;
  orders: Order[];
  onSave: (order: Order) => void;
  resetOrderNumber: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(0.0);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);

  const handleSave = () => {
    const serviceDescription = "Serviço";
    onSave({ orderNumber, value, description, items, serviceDescription });
    setOpen(false);
    setValue(0.0);
    setDescription("");
    resetOrderNumber();
    toast({
      variant: "success",
      title: "Pedido adicionado",
      description: "Pedido adicionado com sucesso.",
    });
  };

  const handleFetchOrder = async () => {
    if (orders.some((order) => order.orderNumber === orderNumber)) {
      toast({
        variant: "destructive",
        title: "Pedido já adicionado",
        description: "Este pedido já foi adicionado à proposta.",
      });
      return;
    }

    setIsLoading(true);
    const data = await getOrder(orderNumber);

    if (!data.pedido_venda_produto) {
      toast({
        variant: "destructive",
        title: "Pedido não encontrado",
        description: "Verifique o número do pedido e tente novamente.",
      });
      setIsLoading(false);
      return;
    }

    if (!data.pedido_venda_produto.total_pedido) {
      toast({
        variant: "destructive",
        title: "Pedido inválido",
        description: "Este pedido não possui um valor total válido.",
      });
      setIsLoading(false);
      return;
    }

    if (data) {
      setValue(
        parseFloat(data.pedido_venda_produto.total_pedido.valor_total_pedido)
      );
      const items = data.pedido_venda_produto.det.map((item: any) => ({
        name: item.produto.descricao,
        quantity: String(item.produto.quantidade),
      }));
      setItems([...items, ...items]);
      setOpen(true);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => handleFetchOrder()}
        disabled={isLoading || !orderNumber}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <PlusIcon className="w-4 h-4" />
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pedido {orderNumber} </DialogTitle>
            <DialogDescription>
              Adicionar este pedido à proposta.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <FormLabel htmlFor="totalValue" className="text-nowrap">
                Valor (R$)
              </FormLabel>
              <Input
                id="totalValue"
                type="text"
                inputMode="decimal"
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^0-9,]/g, "")
                    .replace(",", ".");
                  setValue(parseFloat(value) || 0);
                }}
                value={value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              />
            </div>
            <div className="flex items-center gap-4">
              <FormLabel htmlFor="orderTitle">Descrição</FormLabel>
              <SelectEditable
                placeholder="Selecione ou digite..."
                options={OrdersTitles}
                value={description}
                onChange={setDescription}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={!value || !description}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
