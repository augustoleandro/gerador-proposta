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

Handlebars.registerHelper("multiply", function (a, b) {
  return a * b;
});

Handlebars.registerHelper("chunk", function (array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
});

Handlebars.registerHelper(
  "calculateItemNumber",
  function (chunkIndex, itemIndex) {
    // chunkIndex é o índice do chunk atual (começando de 0)
    // itemIndex é o índice do item dentro do chunk atual (começando de 0)
    // Cada chunk tem 20 itens
    const itemsPerChunk = 20;
    return chunkIndex * itemsPerChunk + itemIndex + 1;
  }
);

Handlebars.registerHelper("and", function () {
  return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
});

Handlebars.registerHelper("unless", function (conditional, options) {
  if (!conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("lte", function (a, b) {
  return a <= b;
});

Handlebars.registerHelper("gt", function (a, b) {
  return a > b;
});

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

Handlebars.registerHelper("or", function () {
  return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
});

Handlebars.registerHelper("last", function (array) {
  return array[array.length - 1].length;
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
  console.log("Starting PDF generation");

  // Determine o caminho base para o arquivo de saída HTML
  const htmlOutputPath =
    process.env.NODE_ENV === "production"
      ? "/tmp/output.html"
      : path.join(process.cwd(), "tmp", "output.html");

  try {
    // Escreve o arquivo HTML
    await fs.writeFile(htmlOutputPath, html);

    // Converte para PDF
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

    // Baixa o PDF
    const pdfResponse = await fetch(result.file.url);
    const pdfBuffer = await pdfResponse.arrayBuffer();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  } finally {
    // Apaga o arquivo HTML temporário, independentemente de sucesso ou falha
    try {
      await fs.unlink(htmlOutputPath);
      console.log("Arquivo HTML temporário apagado com sucesso");
    } catch (unlinkError) {
      console.error("Erro ao apagar arquivo HTML temporário:", unlinkError);
    }
  }
}
