const { Router } = require('express');

// Importando os módulos do mesmo diretório
const authRoutes = require('./auth');
const userRoutes = require('./user');
const roteiroRoutes = require('./roteiro');
const touristRoutes = require('./tourist');

const routes = new Router();

// Health Check
routes.get('/health', (req, res) => res.send({ message: 'Conectado com sucesso!' }));

// DISTRIBUIÇÃO DOS MÓDULOS
routes.use('/auth', authRoutes);
routes.use('/user', userRoutes);
routes.use('/roteiros', roteiroRoutes); 
routes.use('/api/tourist', touristRoutes);

module.exports = routes;