'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analytics_cupons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cupom_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cupons',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      data: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      contagem_visualizacoes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_cliques: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_usos: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      receita_gerada: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      taxa_conversao: {
        type: Sequelize.DECIMAL(5, 2),
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_coupon_id', fields: ['cupom_id'] },
        { name: 'idx_date', fields: ['data'] },
        { name: 'uq_cupom_data', fields: ['cupom_id', 'data'], unique: true },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analytics_cupons');
  },
};