'use strict';
const { Model, Sequelize } = require('sequelize');

class RoteiroComentarios extends Model {

  static init(sequelize) {
    super.init({
      roteiro_id: Sequelize.INTEGER,
      user_id: Sequelize.INTEGER,
      texto_comentario: Sequelize.TEXT,
      comentario_pai_id: Sequelize.INTEGER,
    }, {
      sequelize,
      modelName: 'RoteiroComentarios',
      tableName: 'roteiro_comentarios',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
      
      // Auto-relacionamento
      this.belongsTo(models.RoteiroComentarios, { foreignKey: 'comentario_pai_id', as: 'pai' });
      this.hasMany(models.RoteiroComentarios, { foreignKey: 'comentario_pai_id', as: 'respostas' });
  }
}

module.exports = RoteiroComentarios;
