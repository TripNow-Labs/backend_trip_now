'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('parceiros', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      razao_social: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      nome_contato: {
        type: Sequelize.STRING(255),
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      telefone: {
        type: Sequelize.STRING(50),
      },
      website: {
        type: Sequelize.STRING(255),
      },
      categoria: {
        type: Sequelize.STRING(50),
      },
      endereco: {
        type: Sequelize.TEXT,
      },
      cidade_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'cidades',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      url_logo: {
        type: Sequelize.TEXT,
      },
      descricao: {
        type: Sequelize.TEXT,
      },
      data_inicio_contrato: {
        type: Sequelize.DATEONLY,
      },
      data_fim_contrato: {
        type: Sequelize.DATEONLY,
      },
      taxa_comissao: {
        type: Sequelize.DECIMAL(5, 2),
      },
      status: {
        type: Sequelize.ENUM('ativo', 'inativo', 'pendente', 'suspenso'),
        defaultValue: 'ativo',
      },
      total_cupons_criados: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_cupons_usados: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total_receita_gerada: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      avaliacao: {
        type: Sequelize.DECIMAL(3, 2),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_status', fields: ['status'] },
        { name: 'idx_categoria', fields: ['categoria'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('parceiros');
  },
};