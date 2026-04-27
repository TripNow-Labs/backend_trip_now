const request = require('supertest');
const app = require('../src/server'); // Caminho atualizado

describe('Testes de Validação - Criação de Usuário (/api/v1/user/createuserverify)', () => {

    it('1. Deve rejeitar o cadastro se os dados obrigatórios estiverem ausentes', async () => {
        const response = await request(app)
            .post('/api/v1/user/createuserverify')
            .send({});

        expect(response.status).toBe(422);
        // Verifica se os erros de validação foram disparados (o Zod vai acusar campos faltando)
        expect(response.body.schemaError).toBeDefined();
        expect(response.body.schemaError.length).toBeGreaterThan(0);
    });

    it('2. Deve rejeitar o cadastro com e-mail inválido e senha muito curta', async () => {
        const response = await request(app)
            .post('/api/v1/user/createuserverify')
            .send({
                name: 'Daniel',
                user_name: 'daniel_dev',
                email: 'email-errado', // E-mail inválido
                password: '123' // Senha curta
            });

        expect(response.status).toBe(422);
        expect(response.body.schemaError).toEqual(
            expect.arrayContaining([
                expect.stringContaining('Formato de e-mail inválido.'),
                expect.stringContaining('A senha deve ter pelo menos 6 caracteres.')
            ])
        );
    });
});