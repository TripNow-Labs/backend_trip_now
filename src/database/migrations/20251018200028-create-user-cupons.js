'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_cupons', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
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
      roteiro_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'roteiros',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      usado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'user_cupons_idx_cupom_id', fields: ['cupom_id'] },
        { name: 'user_cupons_uq_user_id_cupom_id', fields: ['user_id', 'cupom_id'], unique: true },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_cupons');
  },
};