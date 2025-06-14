"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Order } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { TableProperties } from "lucide-react";
import { useState } from "react";

const serviceDescriptionTemplates = [
  {
    label: "Automação Residencial",
    description:
      "Iluminação: até XX circuitos luminotécnicos ON/OFF;\nIluminação: até XX circuitos luminotécnicos dimmerizáveis;\nAr-Condicionado: até XX unidades;\nPersianas e cortinas: até XX unidades;\n",
  },
  {
    label: "Áudio e Vídeo",
    description: "Áudio e Vídeo",
  },
  {
    label: "Segurança",
    description: "Segurança",
  },
  {
    label: "Rede e Wi-Fi",
    description: "Rede e Wi-Fi",
  },
];

export function OrderItemsDialog({
  order,
  onSave,
}: {
  order: Order;
  onSave: (order: Order) => void;
}) {
  const [service_description, setServiceDescription] = useState(
    order.service_description || ""
  );
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave({
      ...order,
      service_description: service_description.trimStart(),
    });
    setOpen(false);
  };

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        <TableProperties className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent
          className="sm:max-w-[900px] max-h-[90vh] flex flex-col"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{order.description}</DialogTitle>
            <DialogDescription>Descrição de itens do pedido</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 w-full">
            <div className="max-h-[320px] w-full overflow-auto border-secondary border-[2px] rounded-md">
              <Table className="w-full">
                <TableHeader className="sticky top-0 bg-primary z-10">
                  <TableRow>
                    <TableHead className="bg-primary/30 text-white">
                      Item
                    </TableHead>
                    <TableHead className="bg-primary/30 text-white text-right">
                      Quantidade
                    </TableHead>
                    <TableHead className="bg-primary/30 text-white text-right">
                      Valor/un.
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(item.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-2">
              <FormLabel
                htmlFor="selectDescription"
                className="text-secondary-foreground"
              >
                Template:
              </FormLabel>
              <Select onValueChange={setServiceDescription}>
                <SelectTrigger>
                  <SelectValue placeholder="Templates prontos..." />
                </SelectTrigger>
                <SelectContent>
                  {serviceDescriptionTemplates.map((template) => (
                    <SelectItem
                      key={template.label}
                      value={template.description}
                    >
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <FormLabel
                htmlFor="serviceDescription"
                className="text-secondary-foreground"
              >
                Descrição do Serviço:
              </FormLabel>

              <Textarea
                id="serviceDescription"
                placeholder="Digite ou edite a descrição do serviço..."
                className="h-32 mt-2 resize-none"
                value={service_description}
                onChange={(e) => setServiceDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleSave}
                disabled={service_description.length === 0}
              >
                Salvar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
