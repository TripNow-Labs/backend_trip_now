'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conquistas_usuario', {
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
      conquista_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'conquistas',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      desbloqueado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'conquistas_usuario_uq_user_id_conquista_id', fields: ['user_id', 'conquista_id'], unique: true },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conquistas_usuario');
  },
};