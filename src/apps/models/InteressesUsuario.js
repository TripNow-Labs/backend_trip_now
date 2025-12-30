'use strict';
const { Model, Sequelize } = require('sequelize');

class InteressesUsuario extends Model {
  
  static init(sequelize) {
    super.init({
      user_id: Sequelize.INTEGER,
      tipo_interesse: Sequelize.STRING,
    }, {
      sequelize,
      modelName: 'InteressesUsuario',
      tableName: 'interesses_usuario',
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

module.exports = InteressesUsuario;
