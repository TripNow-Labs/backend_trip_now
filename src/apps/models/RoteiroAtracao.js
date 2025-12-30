'use strict';
const { Model, Sequelize } = require('sequelize');

class RoteiroAtracoes extends Model {
  
  static init(sequelize) {
    super.init({
      roteiro_id: Sequelize.INTEGER,
      atracao_id: Sequelize.INTEGER,
      numero_dia: Sequelize.INTEGER,
      horario: Sequelize.STRING,
      ordem_no_dia: Sequelize.INTEGER,
      anotacoes: Sequelize.TEXT,
    }, {
      sequelize,
      modelName: 'RoteiroAtracoes',
      tableName: 'roteiro_atracoes',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }
  
  static associate(models) {
      this.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
      this.belongsTo(models.AtracoesTuristicas, { foreignKey: 'atracao_id', as: 'atracao' });
  }
}

module.exports = RoteiroAtracoes;
