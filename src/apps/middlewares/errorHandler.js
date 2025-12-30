// Middleware para capturar e tratar erros de forma centralizada.
const errorHandler = (err, req, res, next) => {
  // Loga o erro completo no console do servidor para depuração.
  console.error('\n--- ERRO INESPERADO ---');
  console.error(err.stack);
  console.error('-----------------------\n');

  // Envia uma resposta de erro genérica para o cliente, 
  // evitando expor detalhes da implementação ou da falha.
  res.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Por favor, tente novamente mais tarde.'
  });
};

module.exports = errorHandler;
