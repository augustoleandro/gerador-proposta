import express from "express";
import extenso from "extenso";
import { promises as fs } from "fs";
import Handlebars from "handlebars";
import path from "path";
import puppeteer from "puppeteer";

const app = express();
const port = 3000;

// Registrar os helpers
Handlebars.registerHelper("add", (value, addition) => value + addition);

Handlebars.registerHelper("extenso", (value) => {
  const valorPorExtenso = extenso(value, {
    mode: "currency",
    currency: { type: "BRL" },
  });
  return valorPorExtenso.charAt(0).toUpperCase() + valorPorExtenso.slice(1);
});

Handlebars.registerHelper("formatCurrency", (value) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
);

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Servir arquivos estáticos da pasta 'public'
app.use(express.static("assets"));

// Middleware para processar JSON
app.use(express.json());

// Rota para gerar o PDF
app.post("/generate-pdf", async (req, res) => {
  try {
    const proposalData = req.body;
    const html = await renderTemplate("proposal", proposalData);
    const pdf = await generatePDF(html);
    res.contentType("application/pdf");
    res.send(pdf);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    res.status(500).send("Erro ao gerar PDF");
  }
});

async function renderTemplate(templateName, data) {
  const templatePath = path.join(
    __dirname,
    "views",
    `${templateName}.handlebars`
  );
  const templateContent = await fs.readFile(templatePath, "utf-8");
  const template = Handlebars.compile(templateContent);
  return template(data, {
    helpers: {
      add: (value, addition) => value + addition,
      extenso: (value) => {
        const valorPorExtenso = extenso(value, {
          mode: "currency",
          currency: { type: "BRL" },
        });
        return (
          valorPorExtenso.charAt(0).toUpperCase() + valorPorExtenso.slice(1)
        );
      },
      formatCurrency: (value) =>
        value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
    },
  });
}

async function generatePDF(html) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Definir o diretório de trabalho para o Puppeteer
  await page.goto(`file:${path.join(__dirname, "temp.html")}`, {
    waitUntil: "networkidle0",
  });

  // Inserir o conteúdo HTML renderizado
  await page.evaluate((html) => {
    document.body.innerHTML = html;
  }, html);

  // Esperar que as imagens carreguem
  await page.evaluate(async () => {
    const selectors = Array.from(document.querySelectorAll("img"));
    await Promise.all(
      selectors.map((img) => {
        if (img.complete) return;
        return new Promise((resolve, reject) => {
          img.addEventListener("load", resolve);
          img.addEventListener("error", reject);
        });
      })
    );
  });

  const pdf = await page.pdf({ format: "A4" });
  await browser.close();
  return pdf;
}

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
