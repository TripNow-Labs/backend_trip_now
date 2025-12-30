'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notificacoes', {
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
      tipo: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mensagem: {
        type: Sequelize.TEXT,
      },
      url_link: {
        type: Sequelize.TEXT,
      },
      foi_lida: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_user_id', fields: ['user_id'] },
        { name: 'idx_foi_lida', fields: ['foi_lida'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notificacoes');
  },
};