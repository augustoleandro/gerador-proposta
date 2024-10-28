export async function getOrders() {
  const response = await fetch("/api/omie/pedidos");
  const data = await response.json();
  return data;
}

export async function getOrder(order_number: string, city: string) {
  try {
    const response = await fetch(`/api/omie/pedido?city=${city}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_number }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Omie Service Error: ", error);
  }
}
