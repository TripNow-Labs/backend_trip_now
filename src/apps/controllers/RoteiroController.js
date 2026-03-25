const fs = require('fs');
const path = require('path');
const Roteiro = require('../models/Roteiro');
const Cidade = require('../models/Cidade');
const Pais = require('../models/Pais');
const AtracoesTuristicas = require('../models/AtracaoTuristica'); // Verifique o nome do arquivo
const RoteiroAtracao = require('../models/RoteiroAtracao');
const Database = require('../../database/index');


class RoteiroController {

  // --- CRIAR ROTEIRO (POST /roteiros) ---
  async create(req, res) {
    const transaction = await Database.connection.transaction();

    try {
      const { roteiro, pais, cidade, dias } = req.body;
      const userId = req.userId;

      // 1. Verifica/Cria País
      let paisInstance = await Pais.findOne({ where: { nome: pais.nome }, transaction });
      if (!paisInstance) {
        paisInstance = await Pais.create({
          nome: pais.nome,
          moeda: pais.moeda,
          continente: pais.continente || 'Desconhecido'
        }, { transaction });
      }

      // 2. Verifica/Cria Cidade
      let cidadeInstance = await Cidade.findOne({ where: { nome: cidade.nome, pais_id: paisInstance.id }, transaction });
      if (!cidadeInstance) {
        cidadeInstance = await Cidade.create({
          nome: cidade.nome,
          descricao: cidade.descricao,
          url_imagem: cidade.url_imagem,
          pais_id: paisInstance.id
        }, { transaction });
      }

      // 3. Cria o Roteiro
      const novoRoteiro = await Roteiro.create({
        user_id: userId,
        cidade_id: cidadeInstance.id,
        titulo: `Roteiro em ${cidade.nome}`,
        data_inicio: roteiro.data_inicio,
        duracao_dias: roteiro.duracao_dias,
        numero_pessoas: roteiro.numero_pessoas,
        orcamento_total: roteiro.orcamento_total,
        horario_preferencial: roteiro.horario_preferencial,
        status: 'planejado'
      }, { transaction });

      // 4. Cria Atrações e Vínculos
      if (dias && dias.length > 0) {
        for (const dia of dias) {
          if (dia.pontos_turisticos && dia.pontos_turisticos.length > 0) {
            for (const ponto of dia.pontos_turisticos) {
              
              let atracaoInstance = await AtracoesTuristicas.findOne({
                where: { nome: ponto.nome, cidade_id: cidadeInstance.id },
                transaction
              });

              if (!atracaoInstance) {
                atracaoInstance = await AtracoesTuristicas.create({
                  nome: ponto.nome,
                  cidade_id: cidadeInstance.id,
                  descricao: ponto.descricao,
                  latitude: ponto.latitude || ponto.lat, 
                  longitude: ponto.longitude || ponto.lon,
                  endereco: ponto.endereco || ponto.address,
                  tipo: ponto.tipo || 'geral',
                  url_imagem: ponto.url_imagem,
                  preco_estimado: ponto.valor || 0
                }, { transaction });
              }

              await RoteiroAtracao.create({
                roteiro_id: novoRoteiro.id,
                atracao_id: atracaoInstance.id,
                numero_dia: dia.numero_dia,
                ordem_no_dia: 1, 
                status: 'pendente'
              }, { transaction });
            }
          }
        }
      }

      await transaction.commit();

      return res.status(201).json({
        message: 'Roteiro criado com sucesso!',
        roteiroId: novoRoteiro.id
      });

    } catch (error) {
      await transaction.rollback();
      console.error("Erro ao criar roteiro:", error);
      return res.status(500).json({ error: 'Erro ao criar roteiro.', details: error.message });
    }
  }

  // --- LISTAR ROTEIROS (GET /roteiros) ---
  async getAll(req, res) {
    try {
      const userId = req.userId;
      const roteiros = await Roteiro.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Cidade,
            as: 'cidade',
            attributes: ['nome', 'url_imagem'],
            include: [{ model: Pais, as: 'pais', attributes: ['nome'] }]
          }
        ],
        order: [['criado_em', 'DESC']]
      });
      return res.status(200).json(roteiros);
    } catch (error) {
      console.error('Erro ao listar roteiros:', error);
      return res.status(500).json({ message: 'Falha ao buscar roteiros.' });
    }
  }

  // --- BUSCAR POR ID (GET /roteiros/:roteiroId) ---
  async getById(req, res) {
    try {
      const { roteiroId } = req.params; 
      const userId = req.userId;

      const roteiro = await Roteiro.findOne({
        where: { id: roteiroId, user_id: userId },
        include: [
          { model: Cidade, as: 'cidade', include: [{ model: Pais, as: 'pais' }] },
          { 
            model: RoteiroAtracao, 
            as: 'roteiroAtracoes',
            include: [{ model: AtracoesTuristicas, as: 'atracao' }] 
          }
        ],
        order: [
            [{ model: RoteiroAtracao, as: 'roteiroAtracoes' }, 'numero_dia', 'ASC'],
            [{ model: RoteiroAtracao, as: 'roteiroAtracoes' }, 'ordem_no_dia', 'ASC']
        ]
      });

      if (!roteiro) return res.status(404).json({ message: 'Roteiro não encontrado.' });

      // Formatação dos dados para o front
      const diasFormatados = {};
      for(let i=1; i<=roteiro.duracao_dias; i++) { diasFormatados[i] = []; }

      if(roteiro.roteiroAtracoes) {
          roteiro.roteiroAtracoes.forEach(item => {
              // Garante que o dia exista no objeto
              if (!diasFormatados[item.numero_dia]) {
                  diasFormatados[item.numero_dia] = [];
              }
              
              diasFormatados[item.numero_dia].push({
                  id: item.id,
                  atracao: item.atracao,
                  status: item.status,
                  horario: item.horario_inicio
              });
          });
      }

      return res.status(200).json({ roteiro, dias: diasFormatados });

    } catch (error) {
      console.error('Erro ao buscar roteiro:', error);
      return res.status(500).json({ message: 'Erro ao buscar roteiro.', details: error.message });
    }
  }

  // --- ATUALIZAR (PUT /roteiros/:roteiroId) ---
  async update(req, res) {
    const transaction = await Database.connection.transaction();
    
    try {
      const { roteiroId } = req.params;
      const userId = req.userId;
      const { titulo, descricao, orcamento_total, duracao_dias, dias } = req.body;

      const roteiro = await Roteiro.findOne({ where: { id: roteiroId, user_id: userId }, transaction });

      if (!roteiro) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Roteiro não encontrado.' });
      }

      if (titulo) roteiro.titulo = titulo;
      if (descricao) roteiro.descricao = descricao;
      if (orcamento_total !== undefined) roteiro.orcamento_total = orcamento_total;
      if (duracao_dias) roteiro.duracao_dias = duracao_dias;

      await roteiro.save({ transaction });

      // SINCRONIZAÇÃO DE ATIVIDADES
      if (dias && Array.isArray(dias)) {
        await RoteiroAtracao.destroy({
            where: { roteiro_id: roteiro.id },
            transaction
        });

        for (const dia of dias) {
            if (dia.pontos_turisticos && dia.pontos_turisticos.length > 0) {
                for (const [idx, ponto] of dia.pontos_turisticos.entries()) {
                    let atracaoInstance = await AtracoesTuristicas.findOne({
                        where: { nome: ponto.nome, cidade_id: roteiro.cidade_id },
                        transaction
                    });
                    if (!atracaoInstance) {
                        atracaoInstance = await AtracoesTuristicas.create({
                            nome: ponto.nome,
                            cidade_id: roteiro.cidade_id,
                            descricao: ponto.descricao,
                            latitude: ponto.latitude || 0,
                            longitude: ponto.longitude || 0,
                            endereco: ponto.endereco || "Manual",
                            tipo: ponto.categoria || 'geral',
                            url_imagem: ponto.url_imagem,
                            preco_estimado: ponto.valor || 0
                        }, { transaction });
                    }
                    await RoteiroAtracao.create({
                        roteiro_id: roteiro.id,
                        atracao_id: atracaoInstance.id,
                        numero_dia: dia.numero_dia,
                        horario: ponto.time || '09:00', // Pega o horário do front
                        ordem_no_dia: idx + 1, // Salva a ordem visual
                        status: 'pendente'
                    }, { transaction });
                }
            }
        }
      }

      await transaction.commit();
      return res.status(200).json({ message: 'Roteiro sincronizado com sucesso!', roteiro });

    } catch (error) {
      await transaction.rollback();
      console.error('Erro ao atualizar roteiro:', error);
      return res.status(500).json({ message: 'Falha ao atualizar o roteiro.', details: error.message });
    }
  }
  // --- OBTER CIDADES DO JSON (Sugestões) ---
  async getCuratedCities(req, res) {
    try {
      const fs = require('fs');
      const path = require('path');
      // Caminho para o seu arquivo JSON na raiz do projeto
      const filePath = path.resolve(process.cwd(), 'data', 'curated-cities.json');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Arquivo de cidades não encontrado.' });
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      return res.status(200).json(JSON.parse(data));
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao carregar cidades.' });
    }
  }
  // --- BUSCAR CIDADE (GET /roteiros/search) ---
  async searchCity(req, res) {
    try {
      const { q } = req.query;
      const fs = require('fs');
      const path = require('path');
      const filePath = path.resolve(process.cwd(), 'data', 'curated-cities.json');
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const filtered = data.filter(item => 
        item.cidade.nome.toLowerCase().includes(q.toLowerCase())
      );

      return res.json(filtered);
    } catch (error) {
      return res.status(500).json({ error: 'Erro na busca.' });
    }
  }
  // --- DELETAR (DELETE /roteiros/:roteiroId) ---
  async delete(req, res) {
    try {
      const { roteiroId } = req.params;
      const userId = req.userId;

      const roteiro = await Roteiro.findOne({ where: { id: roteiroId, user_id: userId } });

      if (!roteiro) return res.status(404).json({ message: 'Roteiro não encontrado.' });

      await roteiro.destroy();
      return res.status(200).json({ message: 'Roteiro deletado com sucesso.' });

    } catch (error) {
      console.error('Erro ao deletar roteiro:', error);
      return res.status(500).json({ message: 'Falha ao deletar roteiro.' });
    }
  }
}

module.exports = new RoteiroController();