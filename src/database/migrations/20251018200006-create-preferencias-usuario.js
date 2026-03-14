'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('preferencias_usuario', {
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
      faixa_orcamento: {
        type: Sequelize.ENUM('economico', 'medio', 'premium'),
        defaultValue: 'medio',
      },
      preferencia_duracao: {
        type: Sequelize.ENUM('fim_de_semana', 'curta', 'longa'),
        defaultValue: 'curta',
      },
      notificacao_promocoes: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      notificacao_lembretes: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      notificacao_clima: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      notificacao_comunidade: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
        { name: 'idx_user_id', fields: ['user_id'] },
      ]
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('preferencias_usuario');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_preferencias_usuario_faixa_orcamento";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_preferencias_usuario_preferencia_duracao";');
  },
};