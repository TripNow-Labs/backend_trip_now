'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roteiro_atracoes', {
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
      atracao_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'atracoes_turisticas',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      numero_dia: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      horario: {
        type: Sequelize.STRING(50),
      },
      ordem_no_dia: {
        type: Sequelize.INTEGER,
      },
      anotacoes: {
        type: Sequelize.TEXT,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_roteiro_id', fields: ['roteiro_id'] },
        { name: 'uq_roteiro_atracao', fields: ['roteiro_id', 'atracao_id'], unique: true },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roteiro_atracoes');
  },
};