const request = require('supertest');
const app = require('../src/server'); // Caminho atualizado

describe('Testes de Validação - Rota de Autenticação (/api/v1/auth)', () => {

    it('1. Deve rejeitar a requisição se nenhum dado for enviado (Body vazio)', async () => {
        const response = await request(app)
            .post('/api/v1/auth')
            .send({});

        // O Zod deve barrar e o schemaValidator deve retornar 422 Unprocessable Entity
        expect(response.status).toBe(422);

        // Verifica se a mensagem de erro da senha obrigatória está presente
        expect(response.body.schemaError).toEqual(
            expect.arrayContaining([
                expect.stringContaining('A senha é obrigatória.')
            ])
        );
    });

    it('2. Deve rejeitar a requisição com formato de e-mail inválido', async () => {
        const response = await request(app)
            .post('/api/v1/auth')
            .send({
                email: 'email-invalido-sem-arroba.com',
                password: 'senhaSegura123'
            });

        expect(response.status).toBe(422);
        expect(response.body.schemaError).toEqual(
            expect.arrayContaining([
                expect.stringContaining('email: Formato de e-mail inválido.')
            ])
        );
    });

    it('3. Deve rejeitar a requisição se a senha for muito curta', async () => {
        const response = await request(app)
            .post('/api/v1/auth')
            .send({
                email: 'teste@exemplo.com',
                password: '123' // Senha menor que 6 caracteres
            });

        expect(response.status).toBe(422);
        // O erro do Zod "password: A senha deve ter pelo menos 6 caracteres." deve estar na resposta
        expect(response.body.schemaError[0]).toContain('password: A senha deve ter pelo menos 6 caracteres.');
    });
});