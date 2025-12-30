'use strict';
const { Model, Sequelize } = require('sequelize');

class MetricasSistema extends Model {
  
  static init(sequelize) {
    super.init({
      data: Sequelize.DATEONLY,
      contagem_usuarios_ativos: Sequelize.INTEGER,
      contagem_novos_usuarios: Sequelize.INTEGER,
      contagem_total_usuarios: Sequelize.INTEGER,
      contagem_roteiros_criados: Sequelize.INTEGER,
      contagem_total_roteiros: Sequelize.INTEGER,
      contagem_cupons_ativos: Sequelize.INTEGER,
      contagem_cupons_usados: Sequelize.INTEGER,
      receita_total: Sequelize.DECIMAL,
      total_visualizacoes_pagina: Sequelize.INTEGER,
      duracao_media_sessao: Sequelize.INTEGER,
      taxa_rejeicao: Sequelize.DECIMAL,
    }, {
      sequelize,
      modelName: 'MetricasSistema',
      tableName: 'metricas_sistema',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }
}

module.exports = MetricasSistema;
