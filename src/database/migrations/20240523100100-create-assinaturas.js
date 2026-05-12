'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assinaturas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      plano: {
        type: Sequelize.ENUM('mensal', 'trimestral', 'anual'),
        allowNull: false
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      moeda: {
        type: Sequelize.STRING(10),
        defaultValue: 'BRL'
      },
      status: {
        type: Sequelize.ENUM('ativa', 'cancelada', 'inadimplente', 'expirada'),
        defaultValue: 'ativa',
        allowNull: false
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
    }, {
      indexes: [
        { name: 'assinaturas_idx_user_id', fields: ['user_id'] },  // nome prefixado
        { name: 'assinaturas_idx_status', fields: ['status'] }
      ]
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assinaturas');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assinaturas_plano";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_assinaturas_status";');
  }
};