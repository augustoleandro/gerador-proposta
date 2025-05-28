export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { generatePDF, loadCSS, renderTemplate } from "@/lib/pdfUtils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const templateData = await request.json();

    const css = await loadCSS();
    let html = await renderTemplate("proposal", templateData);

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
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      { error: "Erro ao gerar PDF", details: error },
      { status: 500 }
    );
  }
}
