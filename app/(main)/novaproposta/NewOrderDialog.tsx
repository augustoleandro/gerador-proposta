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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectEditable from "@/components/ui/selectEditable";
import { toast } from "@/components/ui/use-toast";
import { OrdersTitles } from "@/lib/options";
import { Order } from "@/lib/types";
import { getOrder } from "@/services/omie";
import { Loader2, PlusIcon } from "lucide-react";
import { useState } from "react";

export function NewOrderDialog({
  orderNumber,
  totalValue,
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
  const [value, setValue] = useState(totalValue);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    onSave({ orderNumber, value, description });
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
      setOpen(true);
    }
    setIsLoading(false);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => handleFetchOrder()}
        disabled={isLoading}
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
              <Label htmlFor="totalValue" className="text-nowrap">
                Valor (R$)
              </Label>
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
              <Label htmlFor="orderTitle">Descrição</Label>
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
