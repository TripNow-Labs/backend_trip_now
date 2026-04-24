const rateLimit = require('express-rate-limit');

// Configuração do Rate Limiter Global para prevenir abuso de toda a API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de tempo: 15 minutos
  max: 100, // Limite de 100 requisições por IP dentro dos 15 minutos
  message: {
    status: 429,
    error: 'Muitas requisições criadas a partir deste IP. Por favor, tente novamente após 15 minutos.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Configuração rigorosa e específica para rotas sensíveis como login
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // Janela de tempo: 5 minutos
  max: 5, // Apenas 5 tentativas de login por IP a cada 5 minutos
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
