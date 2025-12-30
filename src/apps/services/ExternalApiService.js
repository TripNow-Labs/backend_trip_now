const { searchCityWithAttractions } = require('./geoapify');

class ExternalApiService {
  /**
   * Busca atrações turísticas em uma fonte de dados externa, reutilizando a lógica
   * do serviço da Geoapify.
   * @param {string} nomeCidade - O nome da cidade para buscar as atrações.
   * @returns {Promise<Array>} - Uma lista de objetos de pontos turísticos.
   */
  static async buscarAtracoesPorCidade(nomeCidade) {
    try {
      // Reutiliza a função já existente que busca na API da Geoapify e outras.
      // Isso evita duplicação de código e mantém a consistência dos dados.
      const resultadoBusca = await searchCityWithAttractions(nomeCidade);
      
      // Retorna apenas a lista de pontos turísticos, que é o que o controller espera.
      return resultadoBusca ? resultadoBusca.pontos_turisticos : [];
    } catch (error) {
      console.error(`Erro ao buscar atrações externas para a cidade "${nomeCidade}":`, error);
      return []; // Retorna vazio em caso de erro para não quebrar a aplicação
    }
  }
}

module.exports = ExternalApiService;