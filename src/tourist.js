
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getCuratedTouristCities, getRawCuratedCities } = require('./apps/services/curatedCities');
const { searchCityWithAttractions, findCity } = require('./apps/services/geoapify');

// Ajuste nos caminhos para apontar para a raiz do projeto
const PROJECT_ROOT = path.join(__dirname, '..');
const CACHE_PATH = path.join(PROJECT_ROOT, 'cache', 'tourist_data_geoapify.json');
const CURATED_CITIES_JSON_PATH = path.join(PROJECT_ROOT, 'data', 'curated-cities.json');

/**
 * Rota que retorna uma lista curada de cidades turísticas.
 * Primeiro, tenta servir a partir de um cache consolidado. Se o cache não existir,
 * busca os dados de todas as cidades curadas, cria o cache e retorna os dados.
 */
router.get('/curated-cities', async (req, res, next) => {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      console.log('Servindo cidades curadas do cache principal (tourist_data_geoapify.json).');
      const cachedData = fs.readFileSync(CACHE_PATH, 'utf8');
      res.json(JSON.parse(cachedData));
    } else {
      console.log('Cache principal (tourist_data_geoapify.json) não encontrado. Gerando agora...');
      const rawCities = getRawCuratedCities();
      const cityDataPromises = rawCities.map(city => getCuratedTouristCities(city.name));
      const allCityData = await Promise.all(cityDataPromises);
      const filteredData = allCityData.filter(data => data !== null);

      fs.writeFileSync(CACHE_PATH, JSON.stringify(filteredData, null, 2), 'utf8');
      console.log('Cache principal (tourist_data_geoapify.json) gerado com sucesso.');

      res.json(filteredData);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Rota para o painel de admin, retorna a lista bruta de cidades do JSON.
 */
router.get('/raw-curated-cities', (req, res, next) => {
    try {
        const cities = getRawCuratedCities();
        // O frontend espera um objeto com a chave "data"
        res.json({ data: cities });
    } catch (error) {
        next(error);
    }
});

/**
 * Rota que busca uma cidade e seus pontos turísticos.
 */
router.get('/search', async (req, res, next) => {
  const cityName = req.query.q;
  if (!cityName) {
    return res.status(400).json({ message: 'O parâmetro de busca "q" é obrigatório.' });
  }

  try {
    const results = await searchCityWithAttractions(cityName);
    if (!results) {
      return res.status(404).json({ message: `A cidade "${cityName}" não foi encontrada.` });
    }
    res.json(results);
  } catch (error) {
    next(error);
  }
});

/**
 * Rota para atualizar as cidades curadas (escreve no JSON).
 */
router.post('/update-curated-cities', (req, res, next) => {
    const { curatedCities } = req.body;

    if (!curatedCities || !Array.isArray(curatedCities)) {
        return res.status(400).json({ message: 'O corpo da requisição deve conter um array "curatedCities".' });
    }

    try {
        fs.writeFileSync(CURATED_CITIES_JSON_PATH, JSON.stringify(curatedCities, null, 2), 'utf8');

        // Deleta o cache principal para que ele seja recriado na próxima requisição
        if (fs.existsSync(CACHE_PATH)) {
            fs.unlinkSync(CACHE_PATH);
            console.log('Cache principal (tourist_data_geoapify.json) deletado após atualização das cidades curadas.');
        }

        res.json({ message: 'Cidades curadas e cache atualizados com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar as cidades curadas:', error);
        next(new Error('Ocorreu um erro interno ao salvar as alterações.'));
    }
});

/**
 * Rota para limpar o cache.
 */
router.post('/clear-cache', (req, res, next) => {
    try {
        if (fs.existsSync(CACHE_PATH)) {
            fs.unlinkSync(CACHE_PATH);
            res.json({ message: 'Cache do servidor limpo com sucesso!' });
        } else {
            res.json({ message: 'O cache já estava limpo.' });
        }
    } catch (error) {
        console.error('Erro ao limpar o cache:', error);
        next(new Error('Ocorreu um erro interno ao limpar o cache.'));
    }
});

module.exports = router;
