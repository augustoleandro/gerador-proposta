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
import { OrdersTitles } from "@/lib/options";
import { Order } from "@/lib/types";
import { EditIcon } from "lucide-react";
import { useState } from "react";

export function EditOrderDialog({
  order,
  onSave,
}: {
  order: Order;
  onSave: (order: Order) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(order.value);
  const [description, setDescription] = useState(order.description);

  const handleSave = () => {
    onSave({ orderNumber: order.orderNumber, value, description });
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <EditIcon className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pedido {order.orderNumber} </DialogTitle>
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
