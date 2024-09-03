import { Input } from "@/components/ui/input";
import { Order } from "@/lib/types";
import { useState } from "react";
import { NewOrderDialog } from "./NewOrderDialog";

interface OrderInputProps {
  onOrderAdded: (order: Order) => void;
  existingOrders: Order[];
}

export function OrderInput({ onOrderAdded, existingOrders }: OrderInputProps) {
  const [order_number, setOrderNumber] = useState<string>("");

  const handleAddOrder = (newOrder: Order) => {
    onOrderAdded(newOrder);
    setOrderNumber("");
  };

  return (
    <div className="flex-col w-full">
      <div className="flex gap-2">
        <Input
          placeholder="Nº do pedido"
          value={order_number}
          onChange={(e) => setOrderNumber(e.target.value)}
        />
        <NewOrderDialog
          order_number={order_number}
          totalValue={1000}
          onSave={handleAddOrder}
          resetOrderNumber={() => setOrderNumber("")}
          orders={existingOrders}
        />
      </div>
    </div>
  );
}
