import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city");
  const { order_number } = await request.json();
  try {
    const response = await fetch(
      "https://app.omie.com.br/api/v1/produtos/pedido/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          call: "ConsultarPedido",
          app_key:
            city === "gyn"
              ? process.env.OMIE_APP_KEY
              : process.env.BSB_OMIE_APP_KEY,
          app_secret:
            city === "gyn"
              ? process.env.OMIE_APP_SECRET
              : process.env.BSB_OMIE_APP_SECRET,
          param: [
            {
              numero_pedido: order_number,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("API response:", text);
      return NextResponse.json(
        { message: "API request failed", status: response.status },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Unexpected content type:", contentType, "Response:", text);
      return NextResponse.json(
        { message: "Unexpected content type from API" },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Error fetching orders", error: error },
      { status: 500 }
    );
  }
}
