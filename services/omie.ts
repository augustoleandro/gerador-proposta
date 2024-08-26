//Get data from Omie API

export async function getOrders() {
  const response = await fetch(
    "https://app.omie.com.br/api/v1/pedidos/pedido/listar"
  );
  const data = await response.json();
  return data;
}

export async function getOrder(orderNumber: string) {
  const response = await fetch(`/api/omie/produtos/pedido/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      call: "ConsultarPedido",
      app_key: process.env.OMIE_APP_KEY,
      app_secret: process.env.OMIE_APP_SECRET,
      param: [
        {
          numero_pedido: orderNumber,
        },
      ],
    }),
  });
  const data = await response.json();
  console.log("data: ", data);
  return data;
}
