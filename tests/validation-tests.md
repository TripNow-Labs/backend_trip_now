# Documentação da Suíte de Testes de Validação e Segurança

Este documento descreve os testes de integração da API TripNow. Nossos testes utilizam **Jest** e **Supertest** para simular requisições HTTP e validar como a aplicação reage a entradas inválidas ou não autorizadas.

## Padrão de Validação Adotado

Todos os testes de validação de payload seguem um padrão arquitetural estrito:
- Se os dados enviados no corpo da requisição (`req.body`) violam as regras de negócio ou de tipagem, o middleware de validação (Zod) intercepta a requisição.
- A API não tenta processar a requisição e retorna o **Status HTTP 422 (Unprocessable Entity)**.
- O corpo da resposta de erro contém um array `schemaError`, que detalha exatamente quais campos falharam, facilitando a correção pelo frontend.

---

## 1. Testes de Cadastro de Usuário (`userValidation.test.js`)
**Rota:** `POST /api/v1/user/createuserverify`
**Objetivo:** Garantir que contas de usuário só sejam criadas com dados consistentes e seguros.

* **Cenário 1: Body Vazio**
  * **Ação:** Envio de `{}`.
  * **Expectativa:** Status 422. Rejeição imediata por falta de campos obrigatórios (nome, username, email, senha).
* **Cenário 2: Dados Inválidos**
  * **Ação:** Envio de um e-mail sem formatação correta (`email-errado`) e uma senha muito curta (`123`).
  * **Expectativa:** Status 422. O sistema deve acusar os erros específicos: "Formato de e-mail inválido" e "A senha deve ter pelo menos 6 caracteres".

---

## 2. Testes de Autenticação (`authValidation.test.js`)
**Rota:** `POST /api/v1/auth`
**Objetivo:** Validar o endpoint de Login, prevenindo requisições malformadas antes mesmo de consultar o banco de dados.

* **Cenário 1: Body Vazio**
  * **Ação:** Envio de `{}`.
  * **Expectativa:** Status 422. A API deve exigir, no mínimo, e-mail e senha.
* **Cenário 2: E-mail Inválido no Login**
  * **Ação:** Tentativa de login com e-mail inválido (`email-invalido-sem-arroba.com`).
  * **Expectativa:** Status 422. O sistema nem tenta buscar esse e-mail no banco.
* **Cenário 3: Senha Curta**
  * **Ação:** Envio de senha com menos de 6 caracteres.
  * **Expectativa:** Status 422.

---

## 3. Testes de Segurança de Rotas Protegidas (`profileValidation.test.js`)
**Rota:** `GET /api/v1/user/profile` (ou qualquer rota que exija o middleware de autenticação)
**Objetivo:** Garantir que o sistema de emissão e verificação de JWT (JSON Web Tokens) está blindando as rotas adequadamente.

* **Cenário 1: Sem Token**
  * **Ação:** Requisição sem o cabeçalho `Authorization`.
  * **Expectativa:** Status **401 Unauthorized**.
* **Cenário 2: Token Falsificado/Inválido**
  * **Ação:** Requisição com um token inventado.
  * **Expectativa:** Status **401 Unauthorized**. Mensagem: "Token inválido ou expirado."
* **Cenário 3: Autenticação de Sucesso**
  * **Ação:** Requisição utilizando um JWT válido assinado pelo segredo do servidor.
  * **Expectativa:** O middleware permite a passagem (Status diferente de 401).

---

## 4. Testes de Criação de Roteiro (`roteiroValidation.test.js`)
**Rota:** `POST /api/v1/roteiros`
**Objetivo:** Validar o schema mais complexo da aplicação, que envolve dados aninhados (cidade, país, roteiro).

* **Nota Especial:** Este teste implementa um _Mock_ do middleware de autenticação (`jest.mock(...)`) para focar estritamente na validação dos dados do roteiro sem precisar de um usuário real no banco.

* **Cenário 1: Body Vazio**
  * **Ação:** Envio de `{}`.
  * **Expectativa:** Status 422 devido à ausência das chaves `cidade`, `pais` e `roteiro`.
* **Cenário 2: Erros Aninhados**
  * **Ação:** Envio de dados incorretos dentro de sub-objetos (ex: Nome da cidade em branco, URL de imagem inválida, Duração em dias negativa).
  * **Expectativa:** Status 422. O Zod deve iterar sobre todo o objeto e devolver uma lista consolidada contendo erros como: "cidade.nome: O nome da cidade é obrigatório." e "roteiro.duracao_dias: A duração em dias deve ser positiva."

---

## Resumo para Homologação e Qualidade (QA)
Estes testes atuam como a "primeira linha de defesa" da API. Em vez de escrever regras de validação verbosas nos controllers, delegamos ao validador (Zod). Os testes provam que:
1. É impossível popular o banco de dados com lixo.
2. As respostas de erro são consistentes e padronizadas para os clientes da API (Frontend/Mobile).
3. Requisições não autorizadas não chegam a onerar o banco de dados.