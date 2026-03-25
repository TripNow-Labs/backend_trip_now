const { Router } = require('express');
const UserController = require('../apps/controllers/UserController');
const AuthenticateMiddleware = require('../apps/middlewares/authentication');

const userRoutes = new Router();

// Rotas Públicas (Cadastro/Verificação)
userRoutes.post('/createuserverify', UserController.createUserVerify);
userRoutes.post('/createuserverifycode', UserController.createUserVerifyCode);

// Rotas Protegidas (Perfil)
userRoutes.get('/profile', AuthenticateMiddleware, UserController.getProfile);
userRoutes.put('/:id', AuthenticateMiddleware, UserController.updateUser);
userRoutes.delete('/:id', AuthenticateMiddleware, UserController.deleteUser);

module.exports = userRoutes;
