'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cidades', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(100),
        allowNull: false,
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
      descricao: {
        type: Sequelize.TEXT,
      },
      populacao: {
        type: Sequelize.INTEGER,
      },
      url_imagem: {
        type: Sequelize.TEXT,
      },
      custo_medio_diario: {
        type: Sequelize.DECIMAL(10, 2),
      },
      moeda: {
        type: Sequelize.STRING(10),
      },
      avaliacao: {
        type: Sequelize.DECIMAL(3, 2),
      },
      tipo: {
        type: Sequelize.STRING(50),
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
        { name: 'idx_pais_id', fields: ['pais_id'] },
        { name: 'idx_tipo', fields: ['tipo'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cidades');
  },
};