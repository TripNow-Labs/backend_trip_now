'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('configuracoes_sistema', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      chave_configuracao: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      valor_configuracao: {
        type: Sequelize.TEXT,
      },
      tipo_dado: {
        type: Sequelize.ENUM('booleano', 'inteiro', 'string', 'json'),
        allowNull: false,
      },
      categoria: {
        type: Sequelize.STRING(50),
      },
      descricao: {
        type: Sequelize.TEXT,
      },
      e_publico: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    }, {
      indexes: [
        { name: 'idx_categoria', fields: ['categoria'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('configuracoes_sistema');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_configuracoes_sistema_tipo_dado";');
  },
};