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
      tipo_usuario: {
        type: Sequelize.ENUM('usuario', 'admin'),
        allowNull: false,
        defaultValue: 'usuario'
      },
      telefone: {
        type: Sequelize.STRING(50)
      },
      data_nascimento: {
        type: Sequelize.DATE
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
      id_assinatura: {
        type: Sequelize.INTEGER,
        defaultValue: 1, // Supondo que 1 é o ID da assinatura padrão/gratuita
        references: {
          model: 'assinaturas',
          key: 'id_assinatura'
        },
        onDelete: 'SET NULL'
      },
      criado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      atualizado_em: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        allowNull: false
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  },
};
