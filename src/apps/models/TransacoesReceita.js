'use strict';
const { Model, Sequelize } = require('sequelize'); // Alterado

class TransacoesReceita extends Model {
  
  // Alterado: init recebe apenas 'sequelize'
  static init(sequelize) {
    super.init({
      // 'id' removido (será automático)
      
      parceiro_id: Sequelize.INTEGER, // Simplificado
      cupom_id: Sequelize.INTEGER, // Simplificado
      user_id: Sequelize.INTEGER, // Simplificado
      roteiro_id: Sequelize.INTEGER, // Simplificado
      tipo_transacao: Sequelize.STRING, // Simplificado
      valor: Sequelize.DECIMAL, // Simplificado
      moeda: Sequelize.STRING, // Simplificado
      valor_comissao: Sequelize.DECIMAL, // Simplificado
      taxa_comissao: Sequelize.DECIMAL, // Simplificado
      status: Sequelize.ENUM('pendente', 'concluida', 'falhou', 'reembolsada'), // Simplificado
      data_pagamento: Sequelize.DATEONLY, // Simplificado
      descricao: Sequelize.TEXT, // Simplificado
      metadados: Sequelize.JSON, // Simplificado
    }, {
      sequelize,
      modelName: 'TransacoesReceita',
      tableName: 'transacoes_receita',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }

  static associate(models) {
      // Alterado: Usando 'this'
      this.belongsTo(models.Parceiro, { foreignKey: 'parceiro_id', as: 'parceiro' });
      this.belongsTo(models.Cupom, { foreignKey: 'cupom_id', as: 'cupom' });
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
      this.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
  }
}

module.exports = TransacoesReceita;
