'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transacoes_receita', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      parceiro_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'parceiros',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      cupom_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'cupons',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      roteiro_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'roteiros',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      tipo_transacao: {
        type: Sequelize.STRING(50),
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      moeda: {
        type: Sequelize.STRING(10),
      },
      valor_comissao: {
        type: Sequelize.DECIMAL(10, 2),
      },
      taxa_comissao: {
        type: Sequelize.DECIMAL(5, 2),
      },
      status: {
        type: Sequelize.ENUM('pendente', 'concluida', 'falhou', 'reembolsada'),
        defaultValue: 'pendente',
      },
      data_pagamento: {
        type: Sequelize.DATEONLY,
      },
      descricao: {
        type: Sequelize.TEXT,
      },
      metadados: {
        type: Sequelize.JSON,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_parceiro_id', fields: ['parceiro_id'] },
        { name: 'idx_status', fields: ['status'] },
        { name: 'idx_criado_em', fields: ['criado_em'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transacoes_receita');
  },
};