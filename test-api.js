/**
 * Script para testar a API de geração de PDF com os dados de exemplo
 * Testa diferentes cenários de quantidade de itens para verificar a lógica da descrição
 */

const fs = require("fs");

// Função para fazer requisição HTTP
async function makeRequest(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response;
  } catch (error) {
    console.error("Erro na requisição:", error);
    throw error;
  }
}

// Função para salvar PDF
async function savePDF(response, filename) {
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(filename, buffer);
  console.log(`PDF salvo como: ${filename}`);
}

// Função principal de teste
async function testAPI() {
  console.log(
    "🧪 TESTE DA API - Geração de PDFs com diferentes quantidades de itens\n"
  );

  // Carregar dados de teste
  let testData;
  try {
    const jsonData = fs.readFileSync("test-data-examples.json", "utf8");
    testData = JSON.parse(jsonData);
  } catch (error) {
    console.error("❌ Erro ao carregar dados de teste:", error);
    return;
  }

  const baseURL = "http://localhost:3001/api/generate-pdf";

  // Testar cada caso
  for (const [key, testCase] of Object.entries(testData)) {
    console.log(`📋 Testando: ${testCase.name}`);

    try {
      const response = await makeRequest(baseURL, testCase.data);

      if (response.ok) {
        const filename = `test-output-${key}.pdf`;
        await savePDF(response, filename);
        console.log(`✅ ${testCase.name} - PDF gerado com sucesso!`);

        // Análise baseada na quantidade de itens
        const totalItems = testCase.data.orders.reduce(
          (sum, order) => sum + order.items.length,
          0
        );
        console.log(`   📊 Total de itens: ${totalItems}`);

        if (totalItems <= 14) {
          console.log(
            "   📝 Descrição deve aparecer na mesma página da tabela"
          );
        } else if (totalItems <= 16) {
          console.log("   📝 Descrição deve aparecer em página adicional");
        } else {
          console.log(
            "   📝 Descrição deve aparecer em página adicional (sempre)"
          );
        }
      } else {
        console.log(
          `❌ ${testCase.name} - Erro: ${response.status} ${response.statusText}`
        );
        const errorText = await response.text();
        console.log(`   Detalhes: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} - Erro na requisição:`, error.message);
    }

    console.log(""); // Linha em branco
  }

  console.log("🎯 COMO VERIFICAR OS RESULTADOS:");
  console.log("1. Abra cada PDF gerado (test-output-*.pdf)");
  console.log("2. Verifique se a descrição aparece no local correto:");
  console.log("   • ≤14 itens: Descrição na mesma página da tabela");
  console.log("   • 15-16 itens: Descrição em página adicional");
  console.log("   • >16 itens: Descrição em página adicional");
  console.log("");
  console.log("📊 RESUMO DOS TESTES:");
  console.log("• testCase1: 10 itens → Descrição na mesma página");
  console.log("• testCase2: 15 itens → Descrição em página adicional");
  console.log("• testCase3: 20 itens → Descrição em página adicional");
  console.log("• testCase4: Multi-soluções (10+16+22) → Comportamento misto");
}

// Verificar se o servidor está rodando
async function checkServer() {
  try {
    const response = await fetch("http://localhost:3001/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true }),
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Executar o teste
async function main() {
  console.log("🔍 Verificando se o servidor está rodando...");

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log("❌ Servidor não está rodando em http://localhost:3001");
    console.log("💡 Execute o comando: npm run dev");
    return;
  }

  console.log("✅ Servidor está rodando!\n");
  await testAPI();
}

main().catch(console.error);
