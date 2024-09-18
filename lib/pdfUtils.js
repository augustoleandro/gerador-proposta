import convertapi from "convertapi";
import extenso from "extenso";
import { promises as fs } from "fs";
import Handlebars from "handlebars";
import path from "path";

// Inicialize o convertapi com a chave secreta
const convertApiClient = convertapi(process.env.CONVERT_API_SECRET);

// Helpers do Handlebars
Handlebars.registerHelper("formatCurrency", function (value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
});

Handlebars.registerHelper("formatDate", function (date) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("pt-BR", { month: "long" });
  const year = d.getFullYear();
  return `${day}.${month.charAt(0).toUpperCase() + month.slice(1)}.${year}`;
});

Handlebars.registerHelper("extenso", (value) => {
  if (typeof value !== "number" || isNaN(value)) {
    console.error("Valor inválido para extenso:", value);
    return "Valor inválido";
  }
  try {
    // Converter o valor do formato americano para centavos
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "decimal",
      minimumFractionDigits: 2,
    });
    const valorFormatado = formatter.format(value);
    const valorPorExtenso = extenso(valorFormatado, {
      mode: "currency",
      currency: { type: "BRL" },
    });
    return valorPorExtenso.charAt(0).toUpperCase() + valorPorExtenso.slice(1);
  } catch (error) {
    console.error("Erro ao converter para extenso:", error);
    return "Erro na conversão";
  }
});

Handlebars.registerHelper("add", function (a, b) {
  return a + b;
});

export async function renderTemplate(templateName, data) {
  const templatePath = path.join(
    process.cwd(),
    "views",
    `${templateName}.handlebars`
  );
  const templateContent = await fs.readFile(templatePath, "utf-8");
  const template = Handlebars.compile(templateContent);
  return template(data);
}

export async function loadCSS() {
  const cssPath = path.join(process.cwd(), "public", "styles.css");
  return await fs.readFile(cssPath, "utf-8");
}

export async function generatePDF(html) {
  const htmlOutputPath = path.join(process.cwd(), "output.html");
  await fs.writeFile(htmlOutputPath, html);

  const result = await convertApiClient.convert(
    "pdf",
    {
      File: htmlOutputPath,
      ViewportWidth: "794",
      ViewportHeight: "1122",
      PageSize: "a4",
      MarginTop: "0",
      MarginRight: "0",
      MarginBottom: "0",
      MarginLeft: "0",
      PageWidth: "210",
      PageHeight: "297",
    },
    "html"
  );

  const pdfResponse = await fetch(result.file.url);
  const pdfBuffer = await pdfResponse.arrayBuffer();

  return Buffer.from(pdfBuffer);
}
