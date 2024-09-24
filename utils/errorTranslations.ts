const errorTranslations: { [key: string]: string } = {
  "Error saving proposal": "Erro ao salvar a proposta",
  "Error uploading PDF": "Erro ao fazer upload do PDF",
  "Error saving order": "Erro ao salvar o pedido",
  "No order was created": "Nenhum pedido foi criado",
  "Error saving order item": "Erro ao salvar o item do pedido",
  "Falha ao gerar PDF": "Falha ao gerar PDF",
  "The resource already exists": "Esta proposta já existe",
  "Error uploading PDF: The resource already exists": "Esta proposta já existe",
  // Adicione mais traduções conforme necessário
};

export function translateError(errorMessage: string): string {
  // Procura por correspondências parciais nas chaves de errorTranslations
  for (const [englishPart, portugueseTranslation] of Object.entries(
    errorTranslations
  )) {
    if (errorMessage.includes(englishPart)) {
      return errorMessage.replace(englishPart, portugueseTranslation);
    }
  }
  // Se nenhuma tradução for encontrada, retorna a mensagem original
  return errorMessage;
}
