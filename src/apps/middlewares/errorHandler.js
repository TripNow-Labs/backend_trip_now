const logger = require('../../utils/logger');

// Middleware para capturar e tratar erros de forma centralizada.
const errorHandler = (err, req, res, next) => {
  // Registra o erro no arquivo físico sem enviar ao cliente via Winston
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}\nStack: ${err.stack}`);

  // Envia uma resposta de erro genérica para o cliente, 
  // evitando expor detalhes da implementação ou da falha.
  res.status(err.status || 500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Por favor, tente novamente mais tarde.'
  });
};

module.exports = errorHandler;
