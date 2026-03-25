const { Router } = require('express');


// Importando os novos módulos
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const roteiroRoutes = require('./routes/roteiro');
const touristRoutes = require('./tourist');


const routes = new Router();

// Health Check
routes.get('/health', (req, res) => res.send({ message: 'Conectado com sucesso!' }));



// DISTRIBUIÇÃO DOS MÓDULOS
routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);      // Todas as rotas de usuário agora começam com /users
routes.use('/roteiros', roteiroRoutes); // Todas as rotas de roteiro agora começam com /roteiros
routes.use('/api/tourist', touristRoutes);

module.exports = routes;