'use strict';
const { Model, Sequelize } = require('sequelize');

class Cidade extends Model {
  
  static init(sequelize) {
    super.init({
      nome: Sequelize.STRING,
      pais_id: Sequelize.INTEGER,
      descricao: Sequelize.TEXT,
      populacao: Sequelize.INTEGER,
      url_imagem: Sequelize.TEXT,
      custo_medio_diario: Sequelize.DECIMAL,
      moeda: Sequelize.STRING,
      avaliacao: Sequelize.DECIMAL,
      tipo: Sequelize.STRING,
    }, {
      sequelize,
      modelName: 'Cidade',
      tableName: 'cidades',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Pais, { foreignKey: 'pais_id', as: 'pais' });
      this.hasMany(models.AtracoesTuristicas, { foreignKey: 'cidade_id', as: 'atracoes' });
      this.hasMany(models.Parceiro, { foreignKey: 'cidade_id', as: 'parceiros' });
      this.hasMany(models.Cupom, { foreignKey: 'cidade_id', as: 'cupons' });
      this.hasMany(models.Roteiro, { foreignKey: 'cidade_id', as: 'roteiros' });
  }
}

module.exports = Cidade;
