const { Router } = require('express');
const schemaValidator = require('./apps/middlewares/schemaValidator');
const AuthenticateMiddleware = require('./apps/middlewares/authentication');

const AuthenticationController = require('./apps/controllers/AuthenticationController');
const authSchema = require('./schema/auth.user.chema.json');

const UserController = require('./apps/controllers/UserController');
const userSchema = require('./schema/create.user.chema.json');

const RoteiroController = require('./apps/controllers/RoteiroController');
const ExternalApiController = require('./apps/controllers/ExternalApiController');
const UserVerificationController = require('./apps/controllers/UserVerificationController');
const AtracaoSugestaoController = require('./apps/controllers/AtracaoSugestaoController');
const roteiroAtracaoController = require('./apps/controllers/RoteiroAtracaoController');

const touristRoutes = require('./apps/routes/tourist');

const routes = new Router();

// ==================================================================
// 1. ROTAS PÚBLICAS (LIVRE ACESSO) - DEVEM FICAR NO TOPO
// ==================================================================

// Health Check
routes.get('/health', (req, res) => {
    return res.send({ message: 'Conectado com sucesso!' })
});

// Login
routes.post('/auth', schemaValidator(authSchema), AuthenticationController.authenticate);

// Cadastro
routes.post('/createuserverify', UserController.createUserVerify);
routes.post('/createuserverifycode', UserController.createUserVerifyCode);

// Rotas públicas de turismo (busca e curadoria não precisam de login para visualização básica, se desejar)
// Se quiser proteger, mova para baixo. Por enquanto, vou deixar aqui para facilitar o desenvolvimento.
routes.use('/api/tourist', touristRoutes);


// ==================================================================
// 2. MIDDLEWARE DE AUTENTICAÇÃO (O "SEGURANÇA")
// ==================================================================
routes.use(AuthenticateMiddleware);


// ==================================================================
// 3. ROTAS PROTEGIDAS (SÓ USUÁRIOS LOGADOS)
// ==================================================================

// Usuário
routes.get('/user/profile', UserController.getProfile); // Buscar perfil
routes.put('/user/:id', UserController.updateUser);     // Atualizar perfil
routes.delete('/user/:id', UserController.deleteUser);  // Deletar conta

// Roteiros
routes.post('/roteiros', RoteiroController.create);
routes.get('/roteiros', RoteiroController.getAll);
routes.get('/roteiros/:roteiroId', RoteiroController.getById);
routes.put('/roteiros/:roteiroId', RoteiroController.update);
routes.delete('/roteiros/:roteiroId', RoteiroController.delete);
routes.post('/roteiros/import', ExternalApiController.importRoteiro);

// Atrações do Roteiro
routes.post('/roteiros/:roteiroId/atracoes', roteiroAtracaoController.create);
routes.put('/roteiro-atividades/:roteiroAtracaoId', roteiroAtracaoController.update);
routes.delete('/roteiro-atividades/:roteiroAtracaoId', roteiroAtracaoController.delete);

// Sugestões
routes.get('/roteiros/:roteiroId/sugestoes-atracoes', AtracaoSugestaoController.getSugestoes);
routes.get('/sugestoes/:cidade', AtracaoSugestaoController.getSugestoes);

module.exports = routes;