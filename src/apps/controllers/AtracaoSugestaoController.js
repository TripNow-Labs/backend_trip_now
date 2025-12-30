const db = require('../../database');
const { Roteiro, Cidade, AtracoesTuristicas, RoteiroAtracoes } = db.connection.models;
const SugestaoAtracaoService = require('../services/SugestaoAtracaoService');

class AtracaoSugestaoController {
  /**
   * Busca sugestões de atrações para um roteiro específico.
   * 1. Busca dados do roteiro (cidade, atrações já existentes).
   * 2. Chama um serviço externo para buscar atrações para a cidade do roteiro.
   * 3. Filtra as atrações para remover as que já foram adicionadas.
   * 4. Permite filtrar o resultado por categoria.
   */
  async getSugestoes(req, res) {
    try {
      const { roteiroId, cidade } = req.params;
      const { categoria } = req.query;
      let nomeCidade;
      let cidadeId;
      let atracoesNoRoteiroIds = new Set();

      // Se a rota for por roteiro, busca os dados dele
      if (roteiroId) {
        const { userId } = req; // userId só é necessário para esta rota
        const roteiro = await Roteiro.findOne({
          where: { id: roteiroId, user_id: userId },
          include: [
            { model: Cidade, as: 'cidade', attributes: ['id', 'nome'] },
            { model: RoteiroAtracoes, as: 'roteiroAtracoes', attributes: ['atracao_id'] },
          ],
        });

        if (!roteiro) {
          return res.status(404).json({ message: 'Roteiro não encontrado ou não pertence ao usuário.' });
        }
        nomeCidade = roteiro.cidade.nome;
        cidadeId = roteiro.cidade.id;
        atracoesNoRoteiroIds = new Set(roteiro.roteiroAtracoes.map(ra => ra.atracao_id));

      } else if (cidade) {
        // Se a rota for por cidade, usa o nome da cidade diretamente
        nomeCidade = cidade;
        // Opcional: buscar o ID da cidade se precisar filtrar por atrações existentes no DB
        const cidadeInfo = await Cidade.findOne({ where: { nome: nomeCidade } });
        if (cidadeInfo) {
          cidadeId = cidadeInfo.id;
        }
      } else {
        return res.status(400).json({ message: 'Parâmetro de busca inválido. Forneça uma cidade ou um ID de roteiro.' });
      }

      let categoriaApi = null;
      if (categoria && categoria.toLowerCase() !== 'todos') {
        // O serviço já espera a categoria em minúsculo, então apenas repassamos.
        categoriaApi = categoria.toLowerCase();
      }

      const pontosTuristicosExternos = await SugestaoAtracaoService.buscarAtracoes(nomeCidade, categoriaApi);

      if (!pontosTuristicosExternos || pontosTuristicosExternos.length === 0) {
        return res.status(200).json([]);
      }

      // Se a busca foi por roteiro, filtramos as atrações que já estão nele.
      if (roteiroId && cidadeId) {
        const nomesAtracoesApi = pontosTuristicosExternos.map(p => p.nome);
        const atracoesExistentes = await AtracoesTuristicas.findAll({
          where: { nome: nomesAtracoesApi, cidade_id: cidadeId },
          attributes: ['id', 'nome'],
        });
        const mapaAtracoesExistentes = new Map(atracoesExistentes.map(a => [a.nome, a.id]));

        const sugestoesFiltradas = pontosTuristicosExternos.filter(ponto => {
          const atracaoIdLocal = mapaAtracoesExistentes.get(ponto.nome);
          return !atracaoIdLocal || !atracoesNoRoteiroIds.has(atracaoIdLocal);
        });
        return res.status(200).json(sugestoesFiltradas);
      }

      // Para a rota /sugestoes/:cidade, retorna todas as sugestões encontradas.
      return res.status(200).json(pontosTuristicosExternos);

    } catch (error) {
      console.error('Erro ao buscar sugestões de atrações:', error);
      return res.status(500).json({ message: 'Falha ao buscar sugestões.', details: error.message });
    }
  }
}

module.exports = new AtracaoSugestaoController();