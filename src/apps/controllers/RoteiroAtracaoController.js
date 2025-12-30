const db = require('../../database');
const RoteiroAtracao = require('../models/RoteiroAtracao'); 
const Roteiro = require('../models/Roteiro');
const AtracoesTuristicas = require('../models/AtracaoTuristica');

class RoteiroAtracaoController {

  /**
   * Adiciona uma nova atração a um roteiro existente.
   */
  async create(req, res) {
    const t = await db.connection.transaction();
    try {
      const { roteiroId } = req.params;
      const { userId } = req;
      const {
        atracao_id,
        nova_atracao,
        numero_dia,
        horario,
        ordem_no_dia,
        anotacoes
      } = req.body;

      // 1. Verifica roteiro e permissão
      const roteiro = await Roteiro.findOne({
        where: { id: roteiroId, user_id: userId },
        transaction: t
      });

      if (!roteiro) {
        await t.rollback();
        return res.status(404).json({ message: 'Roteiro não encontrado ou sem permissão.' });
      }

      let atracaoInstance;

      // Define ou Cria a Atração
      if (atracao_id) {
        // Se veio ID, buscamos a instância para ter os dados completos (nome, imagem, etc)
        atracaoInstance = await AtracoesTuristicas.findByPk(atracao_id, { transaction: t });
      } else if (nova_atracao && nova_atracao.nome) {
        const [atracao] = await AtracoesTuristicas.findOrCreate({
          where: { nome: nova_atracao.nome, cidade_id: roteiro.cidade_id },
          defaults: {
            ...nova_atracao,
            cidade_id: roteiro.cidade_id,
            latitude: nova_atracao.latitude || 0,
            longitude: nova_atracao.longitude || 0,
            preco_estimado: nova_atracao.valor || nova_atracao.price || 0
          },
          transaction: t
        });
        atracaoInstance = atracao;
      } else {
        await t.rollback();
        return res.status(400).json({ message: 'Forneça "atracao_id" ou "nova_atracao".' });
      }

      // Cria o vínculo
      const novaAtividade = await RoteiroAtracao.create({
        roteiro_id: roteiroId,
        atracao_id: atracaoInstance.id,
        numero_dia,
        horario,
        ordem_no_dia: ordem_no_dia || 1,
        anotacoes,
        status: 'pendente'
      }, { transaction: t });

      await t.commit();

      const respostaSegura = {
          id: novaAtividade.id,
          roteiro_id: roteiroId,
          numero_dia: numero_dia,
          horario: horario,
          atracao: atracaoInstance
      };

      return res.status(201).json(respostaSegura);

    } catch (error) {
      await t.rollback();
      console.error('Erro ao adicionar atração:', error);
      return res.status(500).json({ message: 'Falha ao adicionar atração.', details: error.message });
    }
  }

  /* Atualiza uma atividade (dia, horário, ordem).*/
  async update(req, res) {
    try {
      const { roteiroAtracaoId } = req.params;
      const { userId } = req;
      const { numero_dia, horario, ordem_no_dia, anotacoes } = req.body;

      const atividade = await RoteiroAtracao.findOne({
        where: { id: roteiroAtracaoId },
        include: [{
          model: Roteiro,
          as: 'roteiro', // Verifique se o alias no Model RoteiroAtracao é 'roteiro'
          attributes: ['user_id']
        }]
      });

      if (!atividade) return res.status(404).json({ message: 'Atividade não encontrada.' });
      
      if (atividade.roteiro.user_id !== userId) {
        return res.status(403).json({ message: 'Sem permissão.' });
      }

      const atividadeAtualizada = await atividade.update({
        numero_dia, horario, ordem_no_dia, anotacoes
      });

      return res.status(200).json(atividadeAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      return res.status(500).json({ message: 'Falha ao atualizar.', details: error.message });
    }
  }

  /* Deleta uma atividade.*/
  async delete(req, res) {
    try {
      const { roteiroAtracaoId } = req.params;
      const { userId } = req;

      const atividade = await RoteiroAtracao.findOne({
        where: { id: roteiroAtracaoId },
        include: [{
          model: Roteiro,
          as: 'roteiro',
          attributes: ['user_id']
        }]
      });

      if (!atividade) return res.status(404).json({ message: 'Atividade não encontrada.' });

      if (atividade.roteiro.user_id !== userId) {
        return res.status(403).json({ message: 'Sem permissão.' });
      }

      await atividade.destroy();

      return res.status(200).json({ message: 'Atividade removida.' });
    } catch (error) {
      console.error('Erro ao deletar:', error);
      return res.status(500).json({ message: 'Falha ao deletar.', details: error.message });
    }
  }
}

module.exports = new RoteiroAtracaoController();