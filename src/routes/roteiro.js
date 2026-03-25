
const { Router } = require('express');
const RoteiroController = require('../apps/controllers/RoteiroController');
const ExternalApiController = require('../apps/controllers/ExternalApiController');
const AtracaoSugestaoController = require('../apps/controllers/AtracaoSugestaoController');
const roteiroAtracaoController = require('../apps/controllers/RoteiroAtracaoController');
const AuthenticateMiddleware = require('../apps/middlewares/authentication');

const roteiroRoutes = new Router();

// Aplicando o middleware em todas as rotas deste arquivo (todas são protegidas)
roteiroRoutes.use(AuthenticateMiddleware);

// --- 1. ROTAS ESTÁTICAS (NOMES FIXOS) - DEVEM VIR PRIMEIRO ---
roteiroRoutes.get('/curated-cities', RoteiroController.getCuratedCities);
roteiroRoutes.get('/search', RoteiroController.searchCity);
roteiroRoutes.post('/import', ExternalApiController.importRoteiro);

// CRUD de Roteiros
roteiroRoutes.post('/', RoteiroController.create);
roteiroRoutes.get('/', RoteiroController.getAll);
roteiroRoutes.put('/:roteiroId', RoteiroController.update);
roteiroRoutes.delete('/:roteiroId', RoteiroController.delete);
roteiroRoutes.get('/:roteiroId', RoteiroController.getById);
roteiroRoutes.post('/import', ExternalApiController.importRoteiro);

// Atrações vinculadas
roteiroRoutes.post('/:roteiroId/atracoes', roteiroAtracaoController.create);
roteiroRoutes.get('/:roteiroId/sugestoes-atracoes', AtracaoSugestaoController.getSugestoes);

module.exports = roteiroRoutes;