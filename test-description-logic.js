/**
 * Teste para verificar a lógica de exibição da descrição no template
 *
 * Este teste verifica se:
 * - Tabelas com ≤14 itens: descrição na mesma página
 * - Tabelas com 15-16 itens: descrição em página adicional
 * - Tabelas com >16 itens: descrição em página adicional
 */

const { renderTemplate } = require("./lib/pdfUtils");

// Função para criar dados de teste
function createTestData(itemCount, includeDescription = true) {
  const items = [];
  for (let i = 1; i <= itemCount; i++) {
    items.push({
      name: `Item de teste ${i}`,
      quantity: 1,
      value: 100.0,
    });
  }

  return {
    customer_name: "Cliente Teste",
    proposal_date: new Date().toISOString(),
    doc_revision: "01",
    project_type: "Teste de Automação",
    proposal_total_value: 10000.0,
    payment_condition: "30% entrada, 70% na instalação",
    execution_time: "30 dias úteis",
    showItemValues: "true",
    orders: [
      {
        description: "Solução de Teste",
        value: 5000.0,
        service_description: includeDescription
          ? "Esta é uma descrição de teste para verificar se está sendo exibida corretamente; Inclui instalação completa; Configuração de todos os dispositivos; Treinamento dos usuários; Suporte técnico pós-instalação"
          : null,
        items: items,
      },
    ],
  };
}

// Função para contar quantas vezes um texto aparece no HTML
function countOccurrences(html, searchText) {
  return (html.match(new RegExp(searchText, "g")) || []).length;
}

// Função para verificar se existe uma página adicional
function hasAdditionalPage(html) {
  // Procura por "Detalhamento do Serviço" ou "Serviço Incluso" que indicam página adicional
  return (
    html.includes("Detalhamento do Serviço") ||
    (html.includes("Serviço Incluso") && html.includes("página adicional"))
  );
}

async function runTests() {
  console.log("🧪 Iniciando testes da lógica de descrição...\n");

  try {
    // Teste 1: Tabela com 10 itens (≤14) - descrição na mesma página
    console.log("📋 Teste 1: Tabela com 10 itens (≤14 itens)");
    const data10 = createTestData(10, true);
    const html10 = await renderTemplate("proposal", data10);

    const descriptionInSamePage10 = html10.includes(
      "Serviço (instalação, configuração e treinamento) da solução acima:"
    );
    const additionalPage10 = hasAdditionalPage(html10);

    console.log(
      `  ✓ Descrição na mesma página: ${
        descriptionInSamePage10 ? "✅ SIM" : "❌ NÃO"
      }`
    );
    console.log(
      `  ✓ Página adicional criada: ${
        additionalPage10 ? "❌ SIM (não deveria)" : "✅ NÃO"
      }\n`
    );

    // Teste 2: Tabela com 15 itens - descrição em página adicional
    console.log("📋 Teste 2: Tabela com 15 itens (15-16 itens)");
    const data15 = createTestData(15, true);
    const html15 = await renderTemplate("proposal", data15);

    const descriptionInSamePage15 = html15.includes(
      "Serviço (instalação, configuração e treinamento) da solução acima:"
    );
    const additionalPage15 = hasAdditionalPage(html15);

    console.log(
      `  ✓ Descrição na mesma página: ${
        descriptionInSamePage15 ? "❌ SIM (não deveria)" : "✅ NÃO"
      }`
    );
    console.log(
      `  ✓ Página adicional criada: ${additionalPage15 ? "✅ SIM" : "❌ NÃO"}\n`
    );

    // Teste 3: Tabela com 18 itens (>16) - descrição em página adicional
    console.log("📋 Teste 3: Tabela com 18 itens (>16 itens)");
    const data18 = createTestData(18, true);
    const html18 = await renderTemplate("proposal", data18);

    const descriptionInSamePage18 = html18.includes(
      "Serviço (instalação, configuração e treinamento) da solução acima:"
    );
    const additionalPage18 = hasAdditionalPage(html18);

    console.log(
      `  ✓ Descrição na mesma página: ${
        descriptionInSamePage18 ? "❌ SIM (não deveria)" : "✅ NÃO"
      }`
    );
    console.log(
      `  ✓ Página adicional criada: ${additionalPage18 ? "✅ SIM" : "❌ NÃO"}\n`
    );

    // Teste 4: Tabela com 20 itens sem descrição - deve mostrar texto padrão
    console.log("📋 Teste 4: Tabela com 20 itens sem descrição personalizada");
    const data20NoDesc = createTestData(20, false);
    const html20NoDesc = await renderTemplate("proposal", data20NoDesc);

    const defaultServiceText = html20NoDesc.includes(
      "Instalação, configuração e treinamento</strong> da solução acima conforme especificações técnicas"
    );
    const additionalPage20NoDesc = hasAdditionalPage(html20NoDesc);

    console.log(
      `  ✓ Texto padrão exibido: ${defaultServiceText ? "✅ SIM" : "❌ NÃO"}`
    );
    console.log(
      `  ✓ Página adicional criada: ${
        additionalPage20NoDesc ? "✅ SIM" : "❌ NÃO"
      }\n`
    );

    // Teste 5: Verificação de múltiplas soluções
    console.log("📋 Teste 5: Múltiplas soluções com diferentes quantidades");
    const dataMultiple = {
      customer_name: "Cliente Teste Multi",
      proposal_date: new Date().toISOString(),
      doc_revision: "01",
      project_type: "Teste Multi-Soluções",
      proposal_total_value: 20000.0,
      payment_condition: "50% entrada, 50% na instalação",
      execution_time: "45 dias úteis",
      showItemValues: "true",
      orders: [
        {
          description: "Solução Pequena (12 itens)",
          value: 5000.0,
          service_description:
            "Descrição da solução pequena; Instalação básica; Configuração simples",
          items: createTestData(12).orders[0].items,
        },
        {
          description: "Solução Média (16 itens)",
          value: 8000.0,
          service_description:
            "Descrição da solução média; Instalação intermediária; Configuração avançada; Treinamento completo",
          items: createTestData(16).orders[0].items,
        },
        {
          description: "Solução Grande (25 itens)",
          value: 12000.0,
          service_description:
            "Descrição da solução grande; Instalação completa; Configuração enterprise; Treinamento avançado; Suporte estendido",
          items: createTestData(25).orders[0].items,
        },
      ],
    };

    const htmlMultiple = await renderTemplate("proposal", dataMultiple);

    // Contar quantas descrições aparecem em páginas da tabela vs páginas adicionais
    const samePage = countOccurrences(
      htmlMultiple,
      "Serviço \\(instalação, configuração e treinamento\\) da solução acima:"
    );
    const additionalPages =
      countOccurrences(htmlMultiple, "Detalhamento do Serviço") +
      countOccurrences(htmlMultiple, "Serviço Incluso");

    console.log(
      `  ✓ Descrições na mesma página: ${samePage} (esperado: 1 para solução com 12 itens)`
    );
    console.log(
      `  ✓ Descrições em páginas adicionais: ${additionalPages} (esperado: 2 para soluções com 16 e 25 itens)\n`
    );

    console.log("🎉 Testes concluídos!");
  } catch (error) {
    console.error("❌ Erro durante os testes:", error);
    console.error("Stack trace:", error.stack);
  }
}

// Executar os testes
runTests().catch(console.error);
