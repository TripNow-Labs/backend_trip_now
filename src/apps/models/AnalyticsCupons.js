'use strict';
const { Model, Sequelize } = require('sequelize');

class AnalyticsCupons extends Model {
  
  static init(sequelize) {
    super.init({
      cupom_id: Sequelize.INTEGER,
      data: Sequelize.DATEONLY,
      contagem_visualizacoes: Sequelize.INTEGER,
      contagem_cliques: Sequelize.INTEGER,
      contagem_usos: Sequelize.INTEGER,
      receita_gerada: Sequelize.DECIMAL,
      taxa_conversao: Sequelize.DECIMAL,
    }, {
      sequelize,
      modelName: 'AnalyticsCupons',
      tableName: 'analytics_cupons',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Cupom, { foreignKey: 'cupom_id', as: 'cupom' });
  }
}

module.exports = AnalyticsCupons;
