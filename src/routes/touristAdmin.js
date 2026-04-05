const express = require('express');
const router = express.Router();
const { getRawCuratedCities } = require('../apps/services/curatedCities');
const AuthenticateMiddleware = require('../apps/middlewares/authentication');
const redisCache = require('../apps/services/RedisCacheService');
const db = require('../database');

// Aplica autenticação em todas as rotas de admin de "tourist"
router.use(AuthenticateMiddleware);

/**
 * Rota para o painel de admin, retorna a lista bruta de cidades do JSON.
 * GET /api/admin/tourist/raw-curated-cities
 */
router.get('/raw-curated-cities', async (req, res, next) => {
    try {
        const [pgResult] = await db.connection.query(
            `SELECT resultado_json FROM api_cache WHERE chave_pesquisa = 'config:raw_curated_cities'`
        );
        
        let cities;
        if (pgResult && pgResult.length > 0) {
            cities = typeof pgResult[0].resultado_json === 'string' ? JSON.parse(pgResult[0].resultado_json) : pgResult[0].resultado_json;
        } else {
            cities = getRawCuratedCities(); // Fallback para o arquivo JSON caso o banco esteja vazio
        }
        res.json({ data: cities });
    } catch (error) {
        next(error);
    }
});

/**
 * Rota para atualizar as cidades curadas (escreve no JSON).
 * POST /api/admin/tourist/update-curated-cities
 */
router.post('/update-curated-cities', async (req, res, next) => {
    const { curatedCities } = req.body;

    if (!curatedCities || !Array.isArray(curatedCities)) {
        return res.status(400).json({ message: 'O corpo da requisição deve conter um array "curatedCities".' });
    }

    try {
        // Em vez de salvar no arquivo físico, salvamos como uma configuração no PostgreSQL
        const expiracao = new Date();
        expiracao.setFullYear(expiracao.getFullYear() + 10); // Configuração válida por 10 anos
        
        await db.connection.query(
            `INSERT INTO api_cache (chave_pesquisa, resultado_json, data_expiracao, created_at, updated_at) 
             VALUES (:key, :json, :expiracao, NOW(), NOW())
             ON CONFLICT (chave_pesquisa) 
             DO UPDATE SET resultado_json = EXCLUDED.resultado_json, data_expiracao = EXCLUDED.data_expiracao, updated_at = NOW()`,
            { replacements: { key: 'config:raw_curated_cities', json: JSON.stringify(curatedCities), expiracao } }
        );

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

module.exports = router;