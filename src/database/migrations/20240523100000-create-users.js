'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      user_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      id_assinatura: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      tipo_usuario: {
        type: Sequelize.ENUM('usuario', 'admin'),
        allowNull: false,
        defaultValue: 'usuario'
      },
      telefone: {
        type: Sequelize.STRING(50)
      },
      data_nascimento: {
        type: Sequelize.DATEONLY
      },
      cidade: {
        type: Sequelize.STRING(100)
      },
      pais: {
        type: Sequelize.STRING(100)
      },
      biografia: {
        type: Sequelize.TEXT
      },
      rede_social: {
        type: Sequelize.STRING(100)
      },
      url_foto_perfil: {
        type: Sequelize.TEXT
      },
      esta_ativo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      ultimo_login_em: {
        type: Sequelize.DATE
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      atualizado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_tipo_usuario";');
  }
};