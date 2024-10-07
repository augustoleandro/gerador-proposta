"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@/lib/types";
import { useState } from "react";
import { NewOrderDialog } from "./NewOrderDialog";

interface OrderInputProps {
  onOrderAdded: (order: Order) => void;
  existingOrders: Order[];
}

const city_options = {
  GYN: "Goiânia",
  BSB: "Brasília",
};

export function OrderInput({ onOrderAdded, existingOrders }: OrderInputProps) {
  const [order_number, setOrderNumber] = useState<string>("");
  const [city, setCity] = useState<string>("GYN");
  const handleAddOrder = (newOrder: Order) => {
    onOrderAdded(newOrder);
    setOrderNumber("");
  };

  return (
    <div className="flex-col w-full mt-2">
      <div className="flex gap-2">
        <Select
          defaultValue={city}
          onValueChange={(value) => {
            setCity(value);
          }}
          value={city}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a cidade" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(city_options).map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
