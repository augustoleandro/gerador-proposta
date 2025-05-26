/**
 * @fileoverview Módulo para geração de PDFs a partir de templates Handlebars
 *
 * Este módulo fornece funções para renderizar templates Handlebars e gerar PDFs
 * usando o serviço ConvertAPI. Também inclui vários helpers para formatação
 * e manipulação de dados nos templates.
 *
 * @requires convertapi - API para conversão de HTML para PDF
 * @requires extenso - Biblioteca para escrever números por extenso em português
 * @requires fs - Operações de sistema de arquivos
 * @requires handlebars - Engine de templates
 * @requires path - Manipulação de caminhos de arquivos
 */

import convertapiFactory from "convertapi";
import extenso from "extenso";
import { promises as fs } from "fs";
import { mkdir } from "fs/promises";
import Handlebars from "handlebars";
import path from "path";

// Validar se a variável de ambiente existe
if (!process.env.CONVERT_API_SECRET) {
  console.error("CONVERT_API_SECRET não configurado no ambiente");
}

// Inicialize o convertapi com a chave secreta
const convertApiClient = new convertapiFactory(
  process.env.CONVERT_API_SECRET || ""
);

/**
 * Definição de tipos para helpers do Handlebars
 */
type HandlebarsHelperThis = unknown;

/**
 * Interface para opções de helpers do Handlebars
 */
interface HandlebarsOptions {
  fn: (context: any) => string;
  inverse: (context: any) => string;
}

/**
 * HELPERS DO HANDLEBARS
 *
 * Os helpers abaixo são registrados no Handlebars para uso nos templates.
 * Eles fornecem funcionalidades como formatação de moeda, datas, operações
 * matemáticas e manipulação de arrays.
 */

/**
 * Formata um número como moeda brasileira (R$)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como moeda (ex: R$ 1.234,56)
 */
Handlebars.registerHelper("formatCurrency", function (value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
});

/**
 * Formata uma data no padrão dia.MêsPorExtenso.ano
 * @param date - Data a ser formatada
 * @returns String formatada (ex: 01.Janeiro.2023)
 */
Handlebars.registerHelper("formatDate", function (date: string | Date) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("pt-BR", { month: "long" });
  const year = d.getFullYear();
  return `${day}.${month.charAt(0).toUpperCase() + month.slice(1)}.${year}`;
});

/**
 * Converte um valor numérico para o seu equivalente por extenso em português
 * @param value - Valor numérico a ser convertido
 * @returns String com o valor por extenso (ex: "Um mil duzentos e trinta e quatro reais e cinquenta e seis centavos")
 */
Handlebars.registerHelper("extenso", (value: number) => {
  if (typeof value !== "number" || isNaN(value)) {
    console.error("Valor inválido para extenso:", value);
    return "Valor inválido";
  }
  try {
    // Converter o valor para o formato brasileiro
    const formatter = new Intl.NumberFormat("pt-BR", {
      style: "decimal",
      minimumFractionDigits: 2,
    });
    const valorFormatado = formatter.format(value);

    // A biblioteca extenso pode ter problemas com formatação, remover pontos e vírgulas
    const valorLimpo = valorFormatado.replace(/\./g, "").replace(",", ".");

    const valorPorExtenso = extenso(valorLimpo, {
      mode: "currency",
      currency: { type: "BRL" },
    });
    return valorPorExtenso.charAt(0).toUpperCase() + valorPorExtenso.slice(1);
  } catch (error) {
    console.error("Erro ao converter para extenso:", error, value);
    return `Valor não formatado: ${value}`;
  }
});

/**
 * Soma dois números
 * @param a - Primeiro número
 * @param b - Segundo número
 * @returns Soma de a e b
 */
Handlebars.registerHelper("add", function (a: number, b: number) {
  return a + b;
});

/**
 * Multiplica dois números
 * @param a - Primeiro número
 * @param b - Segundo número
 * @returns Produto de a e b
 */
Handlebars.registerHelper("multiply", function (a: number, b: number) {
  return a * b;
});

/**
 * Divide um array em pedaços (chunks) de tamanho especificado
 * Útil para paginar itens em múltiplas páginas no PDF
 * @param array - Array a ser dividido
 * @param size - Tamanho de cada pedaço
 * @returns Array de arrays, cada um contendo no máximo 'size' elementos
 */
Handlebars.registerHelper("chunk", function (array: any[], size: number) {
  if (!Array.isArray(array)) {
    return [];
  }

  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
});

/**
 * Calcula o número sequencial de um item baseado em sua posição em chunks
 * @param chunkIndex - Índice do chunk atual
 * @param itemIndex - Índice do item dentro do chunk atual
 * @returns Número sequencial do item na lista completa
 */
Handlebars.registerHelper(
  "calculateItemNumber",
  function (chunkIndex: number, itemIndex: number) {
    const itemsPerChunk = 20;
    return chunkIndex * itemsPerChunk + itemIndex + 1;
  }
);

/**
 * Verifica se todos os argumentos são verdadeiros (operador lógico AND)
 * @returns Boolean indicando se todos os argumentos são verdadeiros
 */
Handlebars.registerHelper("and", function () {
  return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
});

/**
 * Implementa a lógica condicional "unless" (a menos que)
 * @param conditional - Condição a ser avaliada
 * @param options - Opções do helper
 * @returns Conteúdo do bloco 'fn' se a condição for falsa, ou 'inverse' se for verdadeira
 */
Handlebars.registerHelper(
  "unless",
  function (
    this: HandlebarsHelperThis,
    conditional: boolean,
    options: HandlebarsOptions
  ) {
    if (!conditional) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  }
);

/**
 * Verifica se o primeiro valor é menor ou igual ao segundo (<=)
 * @param a - Primeiro valor
 * @param b - Segundo valor
 * @returns Boolean indicando se a <= b
 */
Handlebars.registerHelper("lte", function (a: number, b: number) {
  return a <= b;
});

/**
 * Verifica se o primeiro valor é maior que o segundo (>)
 * @param a - Primeiro valor
 * @param b - Segundo valor
 * @returns Boolean indicando se a > b
 */
Handlebars.registerHelper("gt", function (a: number, b: number) {
  return a > b;
});

/**
 * Verifica se dois valores são estritamente iguais (===)
 * @param a - Primeiro valor
 * @param b - Segundo valor
 * @returns Boolean indicando se a === b
 */
Handlebars.registerHelper("eq", function (a: any, b: any) {
  return a === b;
});

/**
 * Verifica se pelo menos um dos argumentos é verdadeiro (operador lógico OR)
 * @returns Boolean indicando se pelo menos um argumento é verdadeiro
 */
Handlebars.registerHelper("or", function () {
  return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
});

/**
 * Retorna o comprimento do último array em um array de arrays
 * Útil para paginar itens em tabelas
 * @param array - Array de arrays
 * @returns Comprimento do último array, ou 0 se não existir
 */
Handlebars.registerHelper("last", function (array: any[][]) {
  if (!Array.isArray(array) || array.length === 0) {
    return 0;
  }
  const lastArray = array[array.length - 1];
  return Array.isArray(lastArray) ? lastArray.length : 0;
});

/**
 * Verifica se dois valores são iguais (com coerção de tipo, ==)
 * @param arg1 - Primeiro valor
 * @param arg2 - Segundo valor
 * @param options - Opções do helper
 * @returns Conteúdo do bloco 'fn' se os valores forem iguais, ou 'inverse' se forem diferentes
 */
Handlebars.registerHelper(
  "ifEquals",
  function (
    this: HandlebarsHelperThis,
    arg1: any,
    arg2: any,
    options: HandlebarsOptions
  ) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  }
);

/**
 * Formata uma string separada por ponto-e-vírgula em uma lista HTML
 * @param string - String com itens separados por ponto-e-vírgula
 * @returns SafeString do Handlebars contendo uma lista HTML
 */
Handlebars.registerHelper("formatString", function (string: string) {
  if (!string) {
    return new Handlebars.SafeString("");
  }

  const lines = string
    .split(";")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const formattedLines = lines.map((line) => {
    // Usar escapeExpression para prevenir XSS
    return "<li>" + Handlebars.escapeExpression(line) + "</li>";
  });

  return new Handlebars.SafeString("<ul>" + formattedLines.join("") + "</ul>");
});

/**
 * Verifica se o caminho do arquivo é seguro para evitar directory traversal
 * @param filePath - Caminho do arquivo a ser verificado
 * @param basePath - Caminho base que deve conter o arquivo
 * @returns Boolean indicando se o caminho é seguro
 */
function isSafePath(filePath: string, basePath: string): boolean {
  const normalizedPath = path.normalize(filePath);
  return normalizedPath.startsWith(basePath);
}

/**
 * Renderiza um template Handlebars com os dados fornecidos
 * @param templateName - Nome do template (sem a extensão .handlebars)
 * @param data - Dados a serem passados para o template
 * @returns Promise com a string HTML resultante
 * @throws Error se o template não for encontrado
 */
export async function renderTemplate(
  templateName: string,
  data: any
): Promise<string> {
  const templatePath = path.join(
    process.cwd(),
    "views",
    `${templateName}.handlebars`
  );

  // Verificar se o arquivo existe antes de tentar carregá-lo
  try {
    await fs.access(templatePath);
  } catch (error) {
    throw new Error(`Template não encontrado: ${templateName}`);
  }

  const templateContent = await fs.readFile(templatePath, "utf-8");
  const template = Handlebars.compile(templateContent);
  return template(data);
}

/**
 * Carrega o arquivo CSS para uso nos templates
 * @returns Promise com o conteúdo do CSS ou string vazia em caso de erro
 */
export async function loadCSS(): Promise<string> {
  const cssPath = path.join(process.cwd(), "public", "styles.css");

  try {
    return await fs.readFile(cssPath, "utf-8");
  } catch (error) {
    console.error("Erro ao carregar arquivo CSS:", error);
    return ""; // Retorna string vazia em caso de erro para não quebrar o processo
  }
}

/**
 * Gera um PDF a partir de um HTML usando a API convertapi
 * @param html - String HTML a ser convertida em PDF
 * @returns Promise com o buffer do PDF gerado
 * @throws Error se ocorrer algum problema na geração
 */
export async function generatePDF(html: string): Promise<Buffer> {
  console.log("Iniciando geração de PDF");

  // Determinar o diretório para arquivos temporários
  const tmpDir =
    process.env.NODE_ENV === "production"
      ? "/tmp"
      : path.join(process.cwd(), "tmp");

  // Criar o diretório tmp se não existir (apenas em ambiente de desenvolvimento)
  if (process.env.NODE_ENV !== "production") {
    try {
      await mkdir(tmpDir, { recursive: true });
    } catch (error) {
      // Ignora erro se o diretório já existir
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
    }
  }

  const htmlOutputPath = path.join(tmpDir, `output_${Date.now()}.html`);

  try {
    // Escreve o arquivo HTML
    await fs.writeFile(htmlOutputPath, html);

    // Verifica se a API está configurada
    if (!process.env.CONVERT_API_SECRET) {
      throw new Error("CONVERT_API_SECRET não configurado");
    }

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
    if (!pdfResponse.ok) {
      throw new Error(`Falha ao baixar PDF: ${pdfResponse.statusText}`);
    }

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
