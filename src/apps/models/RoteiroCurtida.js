'use strict';
const { Model, Sequelize } = require('sequelize');

class RoteiroCurtida extends Model {
  
  static init(sequelize) {
    super.init({
      roteiro_id: Sequelize.INTEGER,
      user_id: Sequelize.INTEGER,
    }, {
      sequelize,
      modelName: 'RoteiroCurtida',
      tableName: 'roteiro_curtidas',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
  }
}

module.exports = RoteiroCurtida;
