const request = require('supertest');
const app = require('../src/server'); // Caminho atualizado
const jwt = require('jsonwebtoken');

describe('Testes de Segurança - Rotas Protegidas (Ex: /api/v1/user/profile)', () => {
    let tokenValido;

    beforeAll(() => {
        // Fabricamos um JWT perfeitamente válido assinado com o mesmo segredo do servidor
        // Simulamos o ID 999 que usaremos para passar pelo middleware authentication.js
        const secret = process.env.JWT_SECRET || 'fallback_apenas_para_garantir_o_teste';
        tokenValido = jwt.sign({ userId: 999, tipo_usuario: 'usuario' }, secret, { expiresIn: '15m' });
    });

    it('1. Deve bloquear a requisição com 401 se nenhum token for enviado', async () => {
        const response = await request(app)
            .get('/api/v1/user/profile'); // Tenta acessar sem enviar headers

        expect(response.status).toBe(401);
        expect(response.body.error).toBeDefined();
    });

    it('2. Deve bloquear a requisição com 401 se um token inválido/modificado for enviado', async () => {
        const response = await request(app)
            .get('/api/v1/user/profile')
            .set('Authorization', 'Bearer um_token_completamente_inventado_e_invalido');

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Token inválido ou expirado.');
    });

    it('3. Deve passar pelo middleware de autenticação se o token for válido', async () => {
        const response = await request(app)
            .get('/api/v1/user/profile')
            .set('Authorization', `Bearer ${tokenValido}`); // Injeta nosso JWT gerado no header

        // Neste ponto, se não der 401, o middleware deixou passar. 
        // Pode retornar 404 (usuário não encontrado no DB real) ou 500, o que comprova que o token funcionou!
        expect(response.status).not.toBe(401);
    });
});