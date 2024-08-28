import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://app.omie.com.br/api/v1/pedidos/pedido/listar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          call: "ListarPedidos",
          app_key: process.env.OMIE_APP_KEY,
          app_secret: process.env.OMIE_APP_SECRET,
          param: [{}],
        }),
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching orders", error },
      { status: 500 }
    );
  }
}
