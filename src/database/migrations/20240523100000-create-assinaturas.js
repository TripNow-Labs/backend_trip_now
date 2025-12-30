'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assinaturas', {
      id_assinatura: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      plano: {
        type: Sequelize.STRING(100)
      },
      data_inicio: {
        type: Sequelize.DATE
      },
      data_fim: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.STRING(50)
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      atualizado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assinaturas');
  }
};
