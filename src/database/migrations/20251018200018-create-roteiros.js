'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roteiros', {
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
      cidade_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'cidades',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      titulo: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
      },
      duracao_dias: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      data_inicio: {
        type: Sequelize.DATEONLY,
      },
      numero_pessoas: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      horario_preferencial: {
        type: Sequelize.STRING(50),
      },
      orcamento_total: {
        type: Sequelize.DECIMAL(10, 2),
      },
      moeda: {
        type: Sequelize.STRING(10),
      },
      status: {
        type: Sequelize.ENUM('planejado', 'em_andamento', 'concluido', 'cancelado'),
        defaultValue: 'planejado',
      },
      e_publico: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      permitir_comentarios: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      permitir_copia: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      mostrar_custos: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      url_imagem_capa: {
        type: Sequelize.TEXT,
      },
      contagem_visualizacoes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_compartilhamentos: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      contagem_copias: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      avaliacao: {
        type: Sequelize.INTEGER,
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
        { name: 'idx_user_id', fields: ['user_id'] },
        { name: 'idx_cidade_id', fields: ['cidade_id'] },
        { name: 'idx_status', fields: ['status'] },
        { name: 'idx_e_publico', fields: ['e_publico'] },
        { name: 'idx_criado_em', fields: ['criado_em'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roteiros');
  },
};