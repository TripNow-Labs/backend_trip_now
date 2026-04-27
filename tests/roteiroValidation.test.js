const request = require('supertest');

// "Desliga" o middleware de autenticação apenas para este teste, 
// evitando que ele tente buscar o usuário no banco de dados real e retorne 404.
jest.mock('../src/apps/middlewares/authentication', () => {
    return (req, res, next) => {
        return next(); // Simplesmente deixa passar, indo direto para a validação!
    };
});

const app = require('../src/server'); // Caminho atualizado
const jwt = require('jsonwebtoken');

describe('Testes de Validação - Criação de Roteiro (/api/v1/roteiro)', () => {
    let tokenValido;

    beforeAll(() => {
        const secret = process.env.JWT_SECRET || 'fallback_apenas_para_garantir_o_teste';
        tokenValido = jwt.sign({ userId: 1, tipo_usuario: 'usuario' }, secret, { expiresIn: '15m' });
    });

    it('1. Deve rejeitar a criação se o body estiver completamente vazio', async () => {
        const response = await request(app)
            .post('/api/v1/roteiros') // Alterado para o plural (padrão de projeto)
            .set('Authorization', `Bearer ${tokenValido}`)
            .send({});

        expect(response.status).toBe(422);
        // Como o schema exige os objetos cidade, pais e roteiro, o Zod deve reclamar da ausência deles
        expect(response.body.schemaError).toBeDefined();
    });

    it('2. Deve rejeitar se os dados aninhados estiverem incorretos (ex: duração negativa)', async () => {
        const response = await request(app)
            .post('/api/v1/roteiros') // Alterado para o plural
            .set('Authorization', `Bearer ${tokenValido}`)
            .send({
                cidade: {
                    nome: '', // Inválido (min 1)
                    url_imagem: 'isso-nao-e-uma-url' // Inválido
                },
                pais: {
                    nome: 'Brasil' // Válido
                },
                roteiro: {
                    data_inicio: '2026-12-01', // Válido
                    duracao_dias: -5 // Inválido (deve ser positivo)
                }
            });

        expect(response.status).toBe(422);

        // Verifica se o Zod capturou corretamente os erros dentro dos objetos aninhados
        const erros = response.body.schemaError;
        expect(erros).toEqual(
            expect.arrayContaining([
                expect.stringContaining('cidade.nome: O nome da cidade é obrigatório.'),
                expect.stringContaining('cidade.url_imagem: URL da imagem inválida.'),
                expect.stringContaining('roteiro.duracao_dias: A duração em dias deve ser positiva.')
            ])
        );
    });
});