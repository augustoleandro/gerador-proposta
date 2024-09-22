export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { generatePDF, loadCSS, renderTemplate } from "@/lib/pdfUtils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  console.log("Recebendo requisição para gerar PDF");
  try {
    const proposalData = await request.json();
    console.log("Dados recebidos:", JSON.stringify(proposalData, null, 2));

    const css = await loadCSS();
    let html = await renderTemplate("proposal", proposalData);

    // Inserir o CSS diretamente no HTML
    html = html.replace("</head>", `<style>${css}</style></head>`);

    const pdfBuffer = await generatePDF(html);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=proposal.pdf",
      },
    });
  } catch (error) {
    console.error("Erro detalhado ao gerar PDF:", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF", details: error },
      { status: 500 }
    );
  }
}
