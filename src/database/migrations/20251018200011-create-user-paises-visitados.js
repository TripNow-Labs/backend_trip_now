'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_paises_visitados', {
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
      pais_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'paises',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      visitado_em: {
        type: Sequelize.DATEONLY,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_user_id', fields: ['user_id'] },
        { name: 'uq_user_pais', fields: ['user_id', 'pais_id'], unique: true },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_paises_visitados');
  },
};