const { Router } = require('express');
const AuthenticationController = require('../apps/controllers/AuthenticationController');
const schemaValidator = require('../apps/middlewares/schemaValidator');
const authSchema = require('../schema/auth.user.chema.json');

const authRoutes = new Router();

// Rota de Login (POST /auth/login ou apenas /auth)
authRoutes.post('/', schemaValidator(authSchema), AuthenticationController.authenticate);

module.exports = authRoutes;
