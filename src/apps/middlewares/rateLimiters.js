const rateLimit = require('express-rate-limit');

// Configuração do Rate Limiter Global para prevenir abuso de toda a API
// NOTA: limites elevados temporariamente para testes de performance com k6
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de tempo: 15 minutos
  max: 100, // Elevado para testes de carga (produção: 100)
  message: {
    status: 429,
    error: 'Muitas requisições criadas a partir deste IP. Por favor, tente novamente após 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuração rigorosa e específica para rotas sensíveis como login
// NOTA: limites elevados temporariamente para testes de performance com k6
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // Janela de tempo: 5 minutos
  max: 5, // Elevado para testes de carga (produção: 5)
  message: {
    status: 429,
    error: 'Muitas tentativas de login malsucedidas. Tente novamente em 5 minutos para segurança da conta.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  loginLimiter
};
