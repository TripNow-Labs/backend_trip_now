require('dotenv').config();
require('./database/index')
const routes = require('./routes');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Importa os componentes que foram movidos da pasta 'api'
const errorHandler = require('./apps/middlewares/errorHandler');
const { watchCache } = require('./apps/services/cacheManager');

const app = express();

// Middlewares essenciais
// Configuração explícita do CORS para permitir credenciais (cookies)
// e cabeçalhos específicos da origem do seu frontend.
app.use(cors({
    origin: 'http://localhost:3000', // Permite requisições apenas desta origem
    credentials: true, // Permite que o navegador envie cookies
    allowedHeaders: ['Content-Type', 'Authorization'], // Permite explicitamente esses cabeçalhos
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permite esses métodos HTTP
}));

// Middleware para interpretar os cookies enviados nas requisições
app.use(cookieParser());
// Aumentamos para 50mb para garantir que qualquer foto passe sem erro
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Carrega todas as rotas da aplicação a partir do arquivo principal de rotas
app.use(routes);

// Middleware de tratamento de erros. Deve ser o último `app.use` antes do `app.listen`.
app.use(errorHandler);

// Inicia o monitoramento de arquivos na pasta de cache
watchCache();

app.listen(process.env.PORT, () => {
    const port = process.env.PORT || 3333;
    console.log(`🚀 Servidor unificado rodando na porta ${port}`);
});
