# Gestão de Secrets em Produção

O arquivo `.env` é excelente para o desenvolvimento local, mas é uma prática de segurança fraca usá-lo fisicamente em ambientes de produção. Se houver uma vulnerabilidade de "Directory Traversal" na aplicação, um atacante pode baixar o arquivo `.env` e roubar todas as senhas do banco e chaves de API.

## Boas Práticas

### 1. Nunca comitar o arquivo real
O `.gitignore` do TripNow foi configurado para bloquear `.env`, `.env.production` e similares. O arquivo `.env_exemplo` é o único que deve ir para o repositório, servindo como "template" (com valores em branco ou falsos).

### 2. Validação "Fail Fast"
A API agora conta com o `validateEnv.js`. Ele usa Zod para verificar na hora do boot se todas as variáveis sensíveis (`JWT_SECRET`, senhas de DB) estão presentes e têm tamanhos mínimos adequados. Se faltar algo, o servidor "morre" (crash) antes de expor rotas quebradas.

### 3. Onde colocar os Secrets na Produção?

Dependendo da infraestrutura escolhida, você NÃO fará upload do `.env`. Em vez disso, usará o cofre (Vault) da plataforma:

* **Se usar o Railway ou Render (PaaS):**
  Acesse o painel do projeto na nuvem > Aba "Variables" ou "Environment" > Cole o conteúdo do seu `.env` lá. A plataforma injeta as variáveis diretamente na memória do container Docker em tempo de execução.

* **Se usar AWS / Azure / GCP (Cloud Nativa):**
  Utilize serviços específicos como o **AWS Secrets Manager** ou **AWS Systems Manager Parameter Store**.
  A aplicação busca a chave na AWS em vez de ler um arquivo em disco.

* **Se usar Servidor Próprio (VPS via SSH):**
  Crie as variáveis no Docker Compose ou use uma ferramenta profissional de injeção de secrets como o **Doppler** ou **Infisical**.

### 4. Rotação de Secrets
Chaves como `JWT_SECRET` e senhas de banco devem ser trocadas rotineiramente (ex: a cada 6 meses). Se você suspeitar que uma chave vazou, gire a chave imediatamente; a aplicação passará a rejeitar tokens antigos.
