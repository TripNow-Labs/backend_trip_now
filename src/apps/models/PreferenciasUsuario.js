'use strict';
const { Model, Sequelize } = require('sequelize');

class PreferenciasUsuario extends Model {
  
  static init(sequelize) {
    super.init({
      user_id: Sequelize.INTEGER,
      faixa_orcamento: Sequelize.ENUM('economico', 'medio', 'premium'),
      preferencia_duracao: Sequelize.ENUM('fim_de_semana', 'curta', 'longa'),
      notificacao_promocoes: Sequelize.BOOLEAN,
      notificacao_lembretes: Sequelize.BOOLEAN,
      notificacao_clima: Sequelize.BOOLEAN,
      notificacao_comunidade: Sequelize.BOOLEAN,
    }, {
      sequelize,
      modelName: 'PreferenciasUsuario',
      tableName: 'preferencias_usuario',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
  }
}

module.exports = PreferenciasUsuario;
