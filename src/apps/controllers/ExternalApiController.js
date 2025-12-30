const db = require('../../database');
const { Pais, Cidade, Roteiro, AtracoesTuristicas, RoteiroAtracoes } = db.connection.models;

class ExternalApiController {
    async importRoteiro(req, res) {
        const t = await db.connection.transaction();

        try {
            const { roteiro, pais, cidade, dias } = req.body; // Desestruturação para o novo formato
            const userId = req.userId; 

            if (!roteiro || !pais || !pais.nome || !pais.continente || !cidade || !dias || !userId) { // Validação dos novos campos
                return res.status(400).send({ error: 'Dados incompletos para importação.' });
            }

            // --- PASSO 1: País ---
            const [paisCriadoOuEncontrado] = await Pais.findOrCreate({
                where: { nome: pais.nome },
                defaults: {
                    moeda: pais.moeda,
                    continente: pais.continente,
                },
                transaction: t
            });
            const paisId = paisCriadoOuEncontrado.id;

            // --- PASSO 2: Cidade ---
            const [cidadeCriadaOuEncontrada] = await Cidade.findOrCreate({
                where: { nome: cidade.nome, pais_id: paisId },
                defaults: {
                    descricao: cidade.descricao,
                    url_imagem: cidade.url_imagem,
                    pais_id: paisId 
                },
                transaction: t
            });
            const cidadeId = cidadeCriadaOuEncontrada.id;

            // --- PASSO 3: Roteiro ---
            const novoRoteiro = await Roteiro.create({ // Cria o roteiro usando os dados do objeto 'roteiro'
                data_inicio: roteiro.data_inicio,
                duracao_dias: roteiro.duracao_dias,
                numero_pessoas: roteiro.numero_pessoas,
                orcamento_total: roteiro.orcamento_total,
                horario_preferencial: roteiro.horario_preferencial,
                titulo: roteiro.titulo || `Roteiro para ${cidade.nome}`,
                descricao: roteiro.descricao || null,
                url_imagem_capa: cidade.url_imagem, // Usa sempre a imagem da cidade
                e_publico: false, // Padrão como false
                permitir_copia: false, // Padrão como false
                user_id: userId, 
                cidade_id: cidadeId,
            }, { transaction: t });
            const roteiroId = novoRoteiro.id;

            // --- PASSO 4: Pontos Turísticos e Associação ---
            if (dias && dias.length > 0) {
                const roteiroAtracoesParaCriar = [];

                for (const dia of dias) { // Itera sobre cada dia
                    if (!dia.pontos_turisticos || dia.pontos_turisticos.length === 0) continue;

                    for (const ponto of dia.pontos_turisticos) { // Itera sobre os pontos de cada dia
                        const [atracao] = await AtracoesTuristicas.findOrCreate({
                            where: { nome: ponto.nome, cidade_id: cidadeId },
                            defaults: {
                                cidade_id: cidadeId,
                                nome: ponto.nome,
                                categoria: ponto.categoria,
                                descricao: ponto.descricao,
                                e_gratuito: ponto.e_gratuito,
                                avaliacao: ponto.avaliacao,
                                url_imagem: ponto.url_imagem,
                                endereco: ponto.endereco,
                                latitude: ponto.latitude,
                                longitude: ponto.longitude,
                            },
                            transaction: t
                        });
                        
                        // Prepara a associação com o número do dia correto
                        roteiroAtracoesParaCriar.push({
                            roteiro_id: roteiroId,
                            atracao_id: atracao.id,
                            numero_dia: dia.numero_dia,
                        });
                    }
                }

                // --- PASSO 5: Associar Atrações ao Roteiro ---
                if (roteiroAtracoesParaCriar.length > 0) {
                    await RoteiroAtracoes.bulkCreate(roteiroAtracoesParaCriar, { transaction: t });
                }
            }

            await t.commit();

            return res.status(201).send({ 
                message: 'Roteiro cadastrado com sucesso!',
                roteiroId: roteiroId 
            });

        } catch (error) {
            await t.rollback();
            console.error("Erro ao importar roteiro:", error);
            return res.status(500).send({ error: 'Falha ao importar o roteiro. Tente novamente.' });
        }
    }
}

module.exports = new ExternalApiController();
