const redis = require('redis');

class RedisCacheService {
  constructor() {
    const options = {
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
      }
    };

    if (process.env.REDIS_PASSWORD) {
      options.password = process.env.REDIS_PASSWORD;
    }

    if (process.env.REDIS_USERNAME) {
      options.username = process.env.REDIS_USERNAME;
    }

    if (process.env.REDIS_URL) {
      options.url = process.env.REDIS_URL;
    }

    this.client = redis.createClient(options);

    this.client.on('error', (err) => console.error('Erro no cliente Redis:', err));
    this.client.on('connect', () => console.log('🚀 Redis conectado com sucesso!'));

    this.client.connect();
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao buscar no Redis:', error);
      return null;
    }
  }

  async set(key, value, ttlInSeconds = 86400) {
    try {
      await this.client.setEx(key, ttlInSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Erro ao salvar no Redis:', error);
    }
  }

  async invalidate(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Erro ao deletar chave no Redis:', error);
    }
  }
}

module.exports = new RedisCacheService();