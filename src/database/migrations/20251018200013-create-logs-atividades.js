'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('logs_atividades', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      tipo_acao: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      tipo_entidade: {
        type: Sequelize.STRING(50),
      },
      entidade_id: {
        type: Sequelize.INTEGER,
      },
      descricao: {
        type: Sequelize.TEXT,
      },
      metadados: {
        type: Sequelize.JSON,
      },
      endereco_ip: {
        type: Sequelize.STRING(45),
      },
      user_agent: {
        type: Sequelize.TEXT,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_user_id', fields: ['user_id'] },
        { name: 'idx_tipo_acao', fields: ['tipo_acao'] },
        { name: 'idx_criado_em', fields: ['criado_em'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('logs_atividades');
  },
};