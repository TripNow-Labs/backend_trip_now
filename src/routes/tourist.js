const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getCuratedTouristCities, getRawCuratedCities } = require('../apps/services/curatedCities');
const { searchCityWithAttractions, findCity } = require('../apps/services/geoapify');
const AuthenticateMiddleware = require('../apps/middlewares/authentication');
const redisCache = require('../apps/services/RedisCacheService');
const db = require('../database');

// Ajuste nos caminhos para apontar para a raiz do projeto (agora subiu um nível a mais)
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const CURATED_CITIES_JSON_PATH = path.join(PROJECT_ROOT, 'data', 'curated-cities.json');

/**
 * Rota que retorna uma lista curada de cidades turísticas.
 * Primeiro, tenta servir a partir de um cache consolidado. Se o cache não existir,
 * busca os dados de todas as cidades curadas, cria o cache e retorna os dados.
 */
router.get('/curated-cities', async (req, res, next) => {
  try {
    const cacheKey = 'search:curated_cities';

    // 1. Tenta buscar no Redis (Nível 1 - Velocidade Extrema)
    const redisData = await redisCache.get(cacheKey);
    if (redisData) {
        console.log('🚀 Servindo cidades curadas do Redis (L1).');
        return res.json(redisData);
    }

    // 2. Tenta buscar no PostgreSQL (Nível 2 - Banco de Dados)
    try {
        const [pgResult] = await db.connection.query(
            `SELECT resultado_json, data_expiracao FROM api_cache WHERE chave_pesquisa = :key`,
            { replacements: { key: cacheKey } }
        );
        if (pgResult && pgResult.length > 0) {
            const row = pgResult[0];
            if (new Date(row.data_expiracao) > new Date()) {
                console.log('🗄️ Servindo cidades curadas do PostgreSQL (L2). Repopulando Redis...');
                const data = typeof row.resultado_json === 'string' ? JSON.parse(row.resultado_json) : row.resultado_json;
                await redisCache.set(cacheKey, data, 86400); // Repopula Redis por 1 dia
                return res.json(data);
            } else {
                await db.connection.query(`DELETE FROM api_cache WHERE chave_pesquisa = :key`, { replacements: { key: cacheKey } });
            }
        }
    } catch (dbError) {
        console.error('Erro ao buscar no PostgreSQL:', dbError.message);
    }

    // 3. Se não encontrou em nenhum dos bancos, processa e gera novamente
    console.log('Cache não encontrado ou expirado. Gerando dados das cidades curadas...');
    const rawCities = getRawCuratedCities();
    const cityDataPromises = rawCities.map(city => getCuratedTouristCities(city.name));
    const allCityData = await Promise.all(cityDataPromises);
    const filteredData = allCityData.filter(data => data !== null);

    // Salva no Redis (Tempo curto de RAM - 1 dia)
    await redisCache.set(cacheKey, filteredData, 86400);

    // Salva no PostgreSQL (Tempo longo - 30 dias)
    try {
        const expiracao = new Date();
        expiracao.setDate(expiracao.getDate() + 30);
        await db.connection.query(
            `INSERT INTO api_cache (chave_pesquisa, resultado_json, data_expiracao, created_at, updated_at) 
             VALUES (:key, :json, :expiracao, NOW(), NOW())
             ON CONFLICT (chave_pesquisa) 
             DO UPDATE SET resultado_json = EXCLUDED.resultado_json, data_expiracao = EXCLUDED.data_expiracao, updated_at = NOW()`,
            { replacements: { key: cacheKey, json: JSON.stringify(filteredData), expiracao } }
        );
    } catch (dbError) {
        console.error('Erro ao salvar no PostgreSQL:', dbError.message);
    }

    console.log('Cache de cidades curadas gerado com sucesso.');
    res.json(filteredData);
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
router.get('/search', AuthenticateMiddleware, async (req, res, next) => {
  const cityName = req.query.q;
  if (!cityName) {
    return res.status(400).json({ message: 'O parâmetro de busca "q" é obrigatório.' });
  }

  // Normalizamos o nome para evitar criar chaves duplicadas para "Paris" e "paris"
  const cacheKey = `search:tourist:${cityName.toLowerCase().trim()}`;

  try {
    // 1. Tenta buscar no Redis (Nível 1 - Velocidade Extrema)
    const redisData = await redisCache.get(cacheKey);
    if (redisData) {
      console.log(`🚀 Servindo busca de cidade "${cityName}" do Redis (L1).`);
      return res.json(redisData);
    }

    // 2. Tenta buscar no PostgreSQL (Nível 2 - Banco de Dados)
    try {
      const [pgResult] = await db.connection.query(
        `SELECT resultado_json, data_expiracao FROM api_cache WHERE chave_pesquisa = :key`,
        { replacements: { key: cacheKey } }
      );
      if (pgResult && pgResult.length > 0) {
        const row = pgResult[0];
        if (new Date(row.data_expiracao) > new Date()) {
          console.log(`🗄️ Servindo busca de cidade "${cityName}" do PostgreSQL (L2). Repopulando Redis...`);
          const data = typeof row.resultado_json === 'string' ? JSON.parse(row.resultado_json) : row.resultado_json;
          await redisCache.set(cacheKey, data, 86400); // Repopula Redis por 1 dia
          return res.json(data);
        } else {
          await db.connection.query(`DELETE FROM api_cache WHERE chave_pesquisa = :key`, { replacements: { key: cacheKey } });
        }
      }
    } catch (dbError) {
      console.error('Erro ao buscar no PostgreSQL:', dbError.message);
    }

    // 3. Se não encontrou no cache, busca na API externa
    console.log(`Cache não encontrado. Buscando dados na API externa para a cidade "${cityName}"...`);
    const results = await searchCityWithAttractions(cityName);
    
    if (!results) {
      return res.status(404).json({ message: `A cidade "${cityName}" não foi encontrada.` });
    }

    // 4. Salva no Cache para as próximas requisições
    await redisCache.set(cacheKey, results, 86400); // 1 dia na RAM
    const expiracao = new Date();
    expiracao.setDate(expiracao.getDate() + 30); // 30 dias no Banco
    try {
      await db.connection.query(
        `INSERT INTO api_cache (chave_pesquisa, resultado_json, data_expiracao, created_at, updated_at) 
         VALUES (:key, :json, :expiracao, NOW(), NOW())
         ON CONFLICT (chave_pesquisa) 
         DO UPDATE SET resultado_json = EXCLUDED.resultado_json, data_expiracao = EXCLUDED.data_expiracao, updated_at = NOW()`,
        { replacements: { key: cacheKey, json: JSON.stringify(results), expiracao } }
      );
    } catch (dbError) {
      console.error('Erro ao salvar no PostgreSQL:', dbError.message);
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

/**
 * Rota para atualizar as cidades curadas (escreve no JSON).
 */
router.post('/update-curated-cities', AuthenticateMiddleware, async (req, res, next) => {
    const { curatedCities } = req.body;

    if (!curatedCities || !Array.isArray(curatedCities)) {
        return res.status(400).json({ message: 'O corpo da requisição deve conter um array "curatedCities".' });
    }

    try {
        fs.writeFileSync(CURATED_CITIES_JSON_PATH, JSON.stringify(curatedCities, null, 2), 'utf8');

        // Invalida os novos caches do Redis e Banco de Dados
        const cacheKey = 'search:curated_cities';
        await redisCache.invalidate(cacheKey);
        try {
            await db.connection.query(`DELETE FROM api_cache WHERE chave_pesquisa = :key`, { replacements: { key: cacheKey } });
        } catch(e) {}

        console.log('Caches invalidados após atualização das cidades curadas.');

        res.json({ message: 'Cidades curadas e cache atualizados com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar as cidades curadas:', error);
        next(new Error('Ocorreu um erro interno ao salvar as alterações.'));
    }
});

/**
 * Rota para limpar o cache.
 */
router.post('/clear-cache', AuthenticateMiddleware, async (req, res, next) => {
    try {
        // Limpa os novos níveis de cache
        const cacheKey = 'search:curated_cities';
        await redisCache.invalidate(cacheKey);
        try {
            await db.connection.query(`DELETE FROM api_cache WHERE chave_pesquisa = :key`, { replacements: { key: cacheKey } });
        } catch(e) {}

        res.json({ message: 'Todos os caches (Arquivo, Redis e Banco) foram limpos com sucesso!' });
    } catch (error) {
        console.error('Erro ao limpar o cache:', error);
        next(new Error('Ocorreu um erro interno ao limpar o cache.'));
    }
});

module.exports = router;