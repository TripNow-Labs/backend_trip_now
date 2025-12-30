'use strict';
const { Model, Sequelize } = require('sequelize');

class RoteiroTags extends Model {
  
  static init(sequelize) {
    super.init({
      roteiro_id: Sequelize.INTEGER,
      tag: Sequelize.STRING,
    }, {
      sequelize,
      modelName: 'RoteiroTags',
      tableName: 'roteiro_tags',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
  }
}

module.exports = RoteiroTags;
