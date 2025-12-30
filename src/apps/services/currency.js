const axios = require('axios');

/**
 * Busca a moeda de um país pelo seu código ISO 3166-1 alpha-2.
 * @param {string} countryCode - O código do país (ex: 'BR', 'IT').
 * @returns {Promise<string|null>} O código da moeda (ex: 'BRL') ou null se não for encontrada.
 */
async function getCurrencyByCountryCode(countryCode) {
  if (!countryCode) {
    return null;
  }
  
  // FIX: Converte o código do país para maiúsculas para garantir a compatibilidade com a API.
  const upperCaseCountryCode = countryCode.toUpperCase();

  try {
    // Usa o código em maiúsculas na URL.
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${upperCaseCountryCode}`);
    const data = res.data;

    if (data[0]?.currencies) {
      // Pega a primeira moeda da lista (geralmente a principal)
      const currencyCode = Object.keys(data[0].currencies)[0];
      return currencyCode;
    } else {
      console.warn(`Moeda não encontrada para o código de país: ${upperCaseCountryCode}`);
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn(`País com código '${upperCaseCountryCode}' não encontrado na API de moedas.`);
    } else {
      console.error(`Erro ao buscar moeda para o código de país \"${upperCaseCountryCode}\":`, error.message);
    }
    return null; // Retorna nulo para que a lógica seguinte possa definir um padrão.
  }
}

module.exports = { getCurrencyByCountryCode };
