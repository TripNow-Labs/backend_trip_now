'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('relatorios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      gerado_por: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      tipo_relatorio: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
      },
      inicio_periodo: {
        type: Sequelize.DATEONLY,
      },
      fim_periodo: {
        type: Sequelize.DATEONLY,
      },
      filtros: {
        type: Sequelize.JSON,
      },
      url_arquivo: {
        type: Sequelize.TEXT,
      },
      formato_arquivo: {
        type: Sequelize.STRING(10),
      },
      status: {
        type: Sequelize.ENUM('pendente', 'processando', 'concluido', 'falhou'),
        defaultValue: 'concluido',
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_gerado_por', fields: ['gerado_por'] },
        { name: 'idx_tipo_relatorio', fields: ['tipo_relatorio'] },
        { name: 'idx_criado_em', fields: ['criado_em'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('relatorios');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_relatorios_status";');
  },
};