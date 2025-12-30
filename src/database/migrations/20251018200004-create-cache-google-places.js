module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cache_google_places', {
      place_id: {
        type: Sequelize.STRING(100),
        primaryKey: true,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.STRING(50),
      },
      dados_json: {
        type: Sequelize.JSON,
      },
      atualizado_em: {
        type: Sequelize.DATE, // Em Sequelize, TIMESTAMP é mapeado para DATE
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cache_google_places');
  },
};