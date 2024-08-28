export async function getOrders() {
  const response = await fetch("/api/omie/pedidos");
  const data = await response.json();
  return data;
}

export async function getOrder(orderNumber: string) {
  try {
    const response = await fetch("/api/omie/pedido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderNumber }),
    });
    const data = await response.json();
    console.log("Omie Service: ", data);
    return data;
  } catch (error) {
    console.error("Omie Service Error: ", error);
  }
}
