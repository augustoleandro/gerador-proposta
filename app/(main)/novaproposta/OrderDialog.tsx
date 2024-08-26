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
import { Order } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

const suggestions_titles = [
  "Solução de Automação",
  "Solução de Home-Theater",
  "Solução de Áudio e Vídeo",
  "Solução de Áudio",
  "Solução de Vídeo",
  "Solução de Segurança",
];

export function OrderDialog({
  orderNumber,
  totalValue,
  onSave,
}: {
  orderNumber: string;
  totalValue: number;
  onSave: (order: Order) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(totalValue);
  const [description, setDescription] = useState("");

  const handleSave = () => {
    onSave({ orderNumber, value, description });
    setOpen(false);
    setValue(0.0);
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
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
              pattern="^\d{1,}(?:\,\d{1,2})?$"
              onChange={(e) => {
                const input = e.target;
                const cursorPosition = input.selectionStart;
                const numericValue = parseFloat(
                  e.target.value.replace(".", "").replace(",", ".")
                );
                setValue(isNaN(numericValue) ? 0 : numericValue);
                // Restore cursor position after React re-renders
                setTimeout(() => {
                  input.setSelectionRange(cursorPosition, cursorPosition);
                }, 0);
              }}
              value={value.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="orderTitle">Descrição</Label>
            <SelectEditable
              options={suggestions_titles}
              value={description}
              onChange={setDescription}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
