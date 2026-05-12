'use strict';
const { Model, Sequelize } = require('sequelize');

class Assinatura extends Model {
  static init(sequelize) {
    super.init({
      user_id: Sequelize.INTEGER,
      plano: Sequelize.ENUM('mensal', 'trimestral', 'anual'),
      valor: Sequelize.DECIMAL(10, 2),
      moeda: Sequelize.STRING,
      status: Sequelize.ENUM('ativa', 'cancelada', 'inadimplente', 'expirada'),
      data_inicio: Sequelize.DATE,
      data_fim: Sequelize.DATE,
      renovacao_automatica: Sequelize.BOOLEAN,
      metodo_pagamento: Sequelize.STRING,
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
    this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
  }
}

module.exports = Assinatura;
