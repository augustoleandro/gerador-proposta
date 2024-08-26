import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

async function handleRequest(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/api/omie", "");
  const url = `https://app.omie.com.br/api/v1${path}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  // Não seguir redirecionamentos
  const response = await fetch(url, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: "manual",
  });

  // Se for um redirecionamento, retorne diretamente a URL de redirecionamento
  if (
    response.status === 301 ||
    response.status === 302 ||
    response.status === 307 ||
    response.status === 308
  ) {
    const location = response.headers.get("Location");
    if (location) {
      return new NextResponse(null, {
        status: response.status,
        headers: {
          Location: location,
        },
      });
    }
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
