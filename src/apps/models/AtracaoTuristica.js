'use strict';
const { Model, Sequelize } = require('sequelize');

class AtracoesTuristicas extends Model {
  static init(sequelize) {
    super.init({
      cidade_id: Sequelize.INTEGER,
      nome: Sequelize.STRING,
      categoria: Sequelize.STRING,
      descricao: Sequelize.TEXT,
      duracao_horas: Sequelize.DECIMAL,
      preco: Sequelize.DECIMAL,
      moeda: Sequelize.STRING,
      e_gratuito: Sequelize.BOOLEAN,
      avaliacao: Sequelize.DECIMAL,
      url_imagem: Sequelize.TEXT,
      endereco: Sequelize.TEXT,
      latitude: Sequelize.DECIMAL,
      longitude: Sequelize.DECIMAL,
    }, {
      sequelize,
      modelName: 'AtracoesTuristicas',
      tableName: 'atracoes_turisticas',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    });
     return this;
  }
  static associate(models) {
      this.belongsTo(models.Cidade, { foreignKey: 'cidade_id', as: 'cidade' });
      this.hasMany(models.RoteiroAtracoes, { foreignKey: 'atracao_id', as: 'roteiroAtracoes' });
      this.belongsToMany(models.Roteiro, {
        through: models.RoteiroAtracoes,
        foreignKey: 'atracao_id',
        otherKey: 'roteiro_id',
        as: 'roteiros',
      });
    }
}

module.exports = AtracoesTuristicas;
