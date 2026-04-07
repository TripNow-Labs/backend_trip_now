'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('api_cache', {
      chave_pesquisa: {
        type: Sequelize.STRING(255),
        primaryKey: true,
        allowNull: false,
      },
      resultado_json: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      data_expiracao: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('api_cache');
  }
};