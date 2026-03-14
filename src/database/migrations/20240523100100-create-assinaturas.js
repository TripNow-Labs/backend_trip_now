'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assinaturas', {
      id_assinatura: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      plano: {
        type: Sequelize.ENUM('mensal', 'trimestral', 'anual'),
        allowNull: false
      },
      moeda: {
        type: Sequelize.STRING(10),
        defaultValue: 'BRL'
      },
      data_inicio: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      data_fim: {
        type: Sequelize.DATE,
        allowNull: false
      },
      renovacao_automatica: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      metodo_pagamento: {
        type: Sequelize.STRING(50)
      },
      status: {
        type: Sequelize.ENUM('ativa', 'cancelada', 'inadimplente', 'expirada'),
        defaultValue: 'ativa',
        allowNull: false
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      atualizado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assinaturas');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assinaturas_plano";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assinaturas_status";');
  }
};