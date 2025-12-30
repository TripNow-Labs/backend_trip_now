'use strict';
const { Model, Sequelize } = require('sequelize');

class Notificacoes extends Model {
  
  static init(sequelize) {
    super.init({
      user_id: Sequelize.INTEGER,
      tipo: Sequelize.STRING,
      titulo: Sequelize.STRING,
      mensagem: Sequelize.TEXT,
      url_link: Sequelize.TEXT,
      foi_lida: Sequelize.BOOLEAN,
    }, {
      sequelize,
      modelName: 'Notificacoes',
      tableName: 'notificacoes',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
  }
}

module.exports = Notificacoes;
