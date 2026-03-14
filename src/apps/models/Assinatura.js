'use strict';
const { Model, Sequelize } = require('sequelize');

class Assinatura extends Model {
  static init(sequelize) {
    super.init({
      id_assinatura: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      plano: Sequelize.STRING,
      data_inicio: Sequelize.DATE,
      data_fim: Sequelize.DATE,
      status: Sequelize.STRING,
    }, {
      sequelize,
      modelName: 'Assinatura', 
      tableName: 'assinaturas',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em'
    });
    return this;
  }

  static associate(models) {
    this.hasOne(models.Users, { foreignKey: 'id_assinatura' });
  }
}

module.exports = Assinatura;
