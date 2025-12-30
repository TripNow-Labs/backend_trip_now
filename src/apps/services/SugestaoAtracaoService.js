const { findSuggestions } = require('./sugestaoApiService');

class SugestaoAtracaoService {
  /**
   * Busca atrações turísticas em uma fonte de dados externa, com suporte a filtros de categoria.
   * Esta função é uma adaptação da lógica de busca geral para atender às necessidades
   * específicas da tela de sugestões.
   *
   * @param {string} nomeCidade - O nome da cidade para buscar as atrações.
   * @param {string} categoriaApi - A categoria no formato esperado pela API externa (ex: 'catering', 'museum').
   * @returns {Promise<Array>} - Uma lista de objetos de pontos turísticos.
   */
  static async buscarAtracoes(nomeCidade, categoriaApi = null) {
    try {
      // A nova função 'findSuggestions' já lida com os dois casos (com e sem categoria).
      // Apenas repassamos os parâmetros para ela.
      return await findSuggestions(nomeCidade, categoriaApi);
      
    } catch (error) {
      console.error(`Erro ao buscar sugestões de atrações para "${nomeCidade}":`, error);
      return []; // Retorna vazio em caso de erro.
    }
  }
}

module.exports = SugestaoAtracaoService;