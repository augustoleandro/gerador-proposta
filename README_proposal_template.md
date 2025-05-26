# Documentação - Template de Proposta Comercial

## Visão Geral

Este documento descreve o template Handlebars (`proposal.handlebars`) usado para gerar propostas comerciais da empresa Automatize. O template gera um documento PDF profissional com múltiplas páginas contendo informações da empresa, especificações técnicas e valores.

## Estrutura do Template

### 1. Páginas do Documento

#### **Página 1 - Capa**

- Logo vertical da Automatize
- Título "Proposta Comercial"
- Data da proposta e revisão do documento
- Nome do cliente
- Descrição motivacional da empresa

#### **Página 2 - Sobre Nós**

- Logo horizontal no cabeçalho
- Seção "SOBRE NÓS" com foto da fachada
- Texto descritivo da empresa (17 anos de mercado, sedes em Goiânia e Brasília)
- Rodapé com website e Instagram

#### **Página 3 - Nossa Equipe**

- Seção "NOSSA EQUIPE" com foto da equipe
- Descrição da qualificação e compromisso da equipe
- Mesmo padrão de rodapé

#### **Página 4 - Principais Diferenciais**

- Grid com 6 cards destacando:
  - Supervisão e acompanhamento
  - Equipe capacitada
  - Suporte e pós-venda
  - 17 anos de experiência
  - Soluções robustas
  - Engenharia

#### **Página 5 - Apresentação**

- Seção "1. APRESENTAÇÃO"
- Nome do projeto/cliente
- Finalidade do projeto
- Texto introdutório da proposta

#### **Página 6 - Escopo da Proposta**

- Seção "2. CONSTITUI ESCOPO DESTA PROPOSTA"
- 6 subseções detalhando o que está incluído:
  - Instalação, configuração e programação
  - Acompanhamento e supervisão
  - Treinamento e capacitação
  - Suporte técnico e garantia
  - Integração com sistemas existentes
  - Avaliação de entrega final

#### **Página 7 - Exclusões do Escopo**

- Seção "3. NÃO CONSTITUI ESCOPO DESTA PROPOSTA"
- 6 subseções detalhando exclusões:
  - Equipamentos de terceiros
  - Interligação com equipamentos de terceiros
  - Infraestrutura elétrica
  - Integrações não previstas
  - Obras civis
  - Acessórios específicos

#### **Páginas Dinâmicas - Especificações e Valores**

- Seção "4. ESPECIFICAÇÕES E VALORES DAS SOLUÇÕES"
- Tabelas com itens, descrições, quantidades e valores
- Paginação automática (máximo 20 itens por página)
- Valor total de cada solução

#### **Página de Resumo**

- Seção "5. RESUMO - VALORES DAS SOLUÇÕES"
- Tabela consolidada com todas as soluções
- Valor total da proposta
- Valor por extenso

#### **Página Final - Condições**

- Seção "6. PAGAMENTO" com condições e prazo de execução
- Seção "7. VALIDADE DA PROPOSTA" (15 dias)
- Seção "8. GARANTIA" (12 meses) com assinaturas dos engenheiros

## Variáveis do Template

### Variáveis Principais

```handlebars
{{customer_name}}
// Nome do cliente
{{proposal_date}}
// Data da proposta
{{doc_revision}}
// Revisão do documento (R01, R02, etc.)
{{project_type}}
// Tipo/finalidade do projeto
{{proposal_total_value}}
// Valor total da proposta
{{payment_condition}}
// Condições de pagamento
{{execution_time}}
// Prazo de execução
{{showItemValues}}
// Mostrar valores individuais dos itens
```

### Estrutura de Orders (Soluções)

```handlebars
{{#each orders}}
  {{description}}
  // Descrição da solução
  {{value}}
  // Valor da solução
  {{service_description}}
  // Descrição do serviço (opcional)
  {{#each items}}
    {{name}}
    // Nome do item
    {{quantity}}
    // Quantidade
    {{value}}
    // Valor unitário (se showItemValues = true)
  {{/each}}
{{/each}}
```

## Helpers Customizados Necessários

### Formatação

- `formatDate` - Formatar datas
- `formatCurrency` - Formatar valores monetários
- `formatString` - Formatação de strings
- `extenso` - Converter número para extenso

### Lógica

- `chunk` - Dividir arrays em grupos (para paginação)
- `ifEquals` - Comparação condicional
- `add` - Soma de números
- `calculateItemNumber` - Calcular número sequencial dos itens
- `lte`, `gt`, `eq` - Operadores de comparação
- `last` - Último elemento de array

## Estilos CSS

O template referencia `/styles.css` que deve conter:

### Classes Principais

- `.page` - Container de página
- `.page-header` - Cabeçalho da página
- `.page-content` - Conteúdo principal
- `.page-footer` - Rodapé da página
- `.page-columns` - Layout de duas colunas
- `.page-title` - Títulos de seção
- `.page-content-title` - Títulos de conteúdo
- `.card` - Cards dos diferenciais
- `.card-title` - Títulos dos cards
- `.card-content` - Conteúdo dos cards
- `.line` - Linha separadora
- `.h1`, `.h2` - Hierarquia de títulos

### Responsabilidades do CSS

- Layout de impressão/PDF
- Tipografia e espaçamentos
- Cores e visual da marca
- Quebras de página
- Formatação de tabelas

## Recursos Externos

### Imagens (Supabase Storage)

- Logo vertical e horizontal
- Foto da fachada
- Foto da equipe
- Ícone do Instagram
- QR Code
- **Nota**: Tokens de acesso têm data de expiração

## Considerações Técnicas

### Paginação Inteligente

- Máximo de 20 itens por página nas tabelas
- Valor da solução aparece na última página de cada ordem
- Página adicional criada automaticamente se necessário

### Condicionais Complexas

- Exibição de valores individuais controlada por `showItemValues`
- Lógica para posicionamento do valor total baseada no número de itens
- Tratamento especial para páginas com muitos itens

### Manutenção

- URLs de imagem com tokens que expiram
- Dependência de helpers customizados
- CSS inline extensivo (considerar externalização)

## Uso Recomendado

1. Configurar todos os helpers necessários no servidor
2. Garantir que o CSS esteja disponível em `/styles.css`
3. Atualizar tokens de imagem periodicamente
4. Testar paginação com diferentes quantidades de itens
5. Validar formatação de valores e datas
