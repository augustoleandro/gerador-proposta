import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectEditable from "@/components/ui/selectEditable";
import { OrdersTitles } from "@/lib/options";
import { badgeVariants, Category, Order } from "@/lib/types";
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
  const [category, setCategory] = useState<Category>(
    order.category as Category
  );
  const [description, setDescription] = useState(order.description);

  const handleSave = () => {
    onSave({
      ...order,
      value,
      description,
      category,
    });
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
            <DialogTitle>Pedido {order.order_number} </DialogTitle>
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
            <div className="flex items-center gap-4">
              <FormLabel htmlFor="category">Categoria</FormLabel>
              <Select
                onValueChange={(value) => setCategory(value as Category)}
                value={category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent id="category">
                  <SelectItem value="AUT">
                    <Badge variant={badgeVariants["AUT"]}>AUT</Badge>
                  </SelectItem>
                  <SelectItem value="AV">
                    <Badge variant={badgeVariants["AV"]}>AV</Badge>
                  </SelectItem>
                  <SelectItem value="RD">
                    <Badge variant={badgeVariants["RD"]}>RD</Badge>
                  </SelectItem>
                  <SelectItem value="SEC">
                    <Badge variant={badgeVariants["SEC"]}>SEC</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
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
