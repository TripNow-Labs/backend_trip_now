'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('atracoes_turisticas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cidade_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cidades',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      categoria: {
        type: Sequelize.STRING(50),
      },
      descricao: {
        type: Sequelize.TEXT,
      },
      duracao_horas: {
        type: Sequelize.DECIMAL(3, 1),
      },
      preco: {
        type: Sequelize.DECIMAL(10, 2),
      },
      moeda: {
        type: Sequelize.STRING(10),
      },
      e_gratuito: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      avaliacao: {
        type: Sequelize.DECIMAL(3, 2),
      },
      url_imagem: {
        type: Sequelize.TEXT,
      },
      endereco: {
        type: Sequelize.TEXT,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
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
        { name: 'idx_cidade_id', fields: ['cidade_id'] },
        { name: 'idx_categoria', fields: ['categoria'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('atracoes_turisticas');
  },
};