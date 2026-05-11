# Hardening de Banco de Dados e Redis (Menor Privilégio)

Rodar a aplicação com credenciais de administrador (como o usuário padrão `postgres`) é um risco grave de segurança. Se houver uma vulnerabilidade de SQL Injection, o invasor terá controle total sobre todo o servidor de banco de dados.

Este guia orienta a criação de um ambiente com o Princípio do Menor Privilégio.

## 1. PostgreSQL: Criar um Usuário Restrito

Execute o seguinte script no seu banco de dados (ex: via DBeaver, pgAdmin ou `psql`), conectado como administrador, para criar um usuário que só tem permissão para manipular dados do TripNow.

```sql
-- 1. Criar o usuário da aplicação com uma senha forte
CREATE USER tripnow_app WITH PASSWORD 'sua_senha_super_segura_aqui';

-- 2. Conceder permissão de conexão ao banco de dados específico
GRANT CONNECT ON DATABASE trip_now TO tripnow_app;

-- 3. Conecte-se ao banco de dados trip_now (ex: \c trip_now no psql) e rode os comandos abaixo:

-- 4. Conceder uso do esquema público
GRANT USAGE ON SCHEMA public TO tripnow_app;

-- 5. Conceder permissões para manipular dados em todas as tabelas (mas não deletar tabelas)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO tripnow_app;

-- 6. Garantir que futuras tabelas também tenham essas permissões automaticamente
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tripnow_app;

-- 7. Conceder permissões para usar sequências (necessário para IDs auto-incremento)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tripnow_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO tripnow_app;
```

**Atualização no `.env`**
Após criar, atualize o `.env` da aplicação (e o da produção):
```env
DB_USERNAME=tripnow_app
PASSWORD=sua_senha_super_segura_aqui
```

---

## 2. Redis: Configurar Senha e Restrição de Acesso

O Redis, por padrão, não tem senha e escuta na porta 6379.

### Passo 1: Configurar Senha no `redis.conf`
Localize o arquivo de configuração do seu Redis (`redis.conf`) e adicione ou descomente a linha `requirepass`:
```conf
requirepass sua_senha_redis_aqui
```

### Passo 2: Atualizar o `.env`
O serviço `RedisCacheService` do TripNow já suporta autenticação. Basta adicionar:
```env
REDIS_PASSWORD=sua_senha_redis_aqui
```

---

## 3. Checklist de Portas (Network Security)

As portas dos bancos de dados **NUNCA** devem estar abertas para a internet pública.

- [ ] A porta `5432` (PostgreSQL) está bloqueada no Firewall externo?
- [ ] A porta `6379` (Redis) está bloqueada no Firewall externo?
- [ ] Apenas o IP da máquina do backend (ou a rede privada interna do Docker/VPC) tem permissão de comunicação com esses serviços?
