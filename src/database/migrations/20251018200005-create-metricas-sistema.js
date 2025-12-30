'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('metricas_sistema', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        unique: true,
      },
      contagem_usuarios_ativos: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_novos_usuarios: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_total_usuarios: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_roteiros_criados: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_total_roteiros: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_cupons_ativos: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_cupons_usados: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      receita_total: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      total_visualizacoes_pagina: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      duracao_media_sessao: {
        type: Sequelize.INTEGER,
      },
      taxa_rejeicao: {
        type: Sequelize.DECIMAL(5, 2),
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_data', fields: ['data'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('metricas_sistema');
  },
};