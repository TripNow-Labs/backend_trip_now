'use strict';
const { Model, Sequelize } = require('sequelize');

class RoteirosSalvos extends Model {
  
  static init(sequelize) {
    super.init({
      user_id: Sequelize.INTEGER,
      roteiro_id: Sequelize.INTEGER,
    }, {
      sequelize,
      modelName: 'RoteirosSalvos',
      tableName: 'roteiros_salvos',
      timestamps: true,
      createdAt: 'salvo_em',
      updatedAt: false
    });
    return this;
  }
  
  static associate(models) {
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
      this.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
  }
}

module.exports = RoteirosSalvos;
