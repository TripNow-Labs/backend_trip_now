const winston = require('winston');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Salva em JSON, ótimo para leitura automatizada depois
  ),
  transports: [
    // Grava todos os erros no arquivo 'logs/error.log'
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

// Se não estivermos em produção, loga no console também
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
