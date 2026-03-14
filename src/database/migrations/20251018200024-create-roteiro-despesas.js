'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roteiro_despesas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      roteiro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roteiros',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      categoria: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING(255),
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      moeda: {
        type: Sequelize.STRING(10),
      },
      data: {
        type: Sequelize.DATEONLY,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_roteiro_id', fields: ['roteiro_id'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roteiro_despesas');
  },
};