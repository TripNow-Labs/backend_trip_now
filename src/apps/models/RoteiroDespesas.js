'use strict';
const { Model, Sequelize } = require('sequelize');

class RoteiroDespesas extends Model {
  
  static init(sequelize) {
    super.init({
      roteiro_id: Sequelize.INTEGER,
      categoria: Sequelize.STRING,
      descricao: Sequelize.STRING,
      valor: Sequelize.DECIMAL,
      moeda: Sequelize.STRING,
      data: Sequelize.DATEONLY,
    }, {
      sequelize,
      modelName: 'RoteiroDespesas',
      tableName: 'roteiro_despesas',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
  }
}

module.exports = RoteiroDespesas;
