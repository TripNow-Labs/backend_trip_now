'use strict';
const { Model, Sequelize } = require('sequelize');

class Parceiro extends Model {
  
  static init(sequelize) {
    super.init({
      razao_social: Sequelize.STRING,
      nome_contato: Sequelize.STRING,
      email: Sequelize.STRING,
      telefone: Sequelize.STRING,
      website: Sequelize.STRING,
      categoria: Sequelize.STRING,
      endereco: Sequelize.TEXT,
      cidade_id: Sequelize.INTEGER,
      url_logo: Sequelize.TEXT,
      descricao: Sequelize.TEXT,
      data_inicio_contrato: Sequelize.DATEONLY,
      data_fim_contrato: Sequelize.DATEONLY,
      taxa_comissao: Sequelize.DECIMAL,
      status: Sequelize.ENUM('ativo', 'inativo', 'pendente', 'suspenso'),
      total_cupons_criados: Sequelize.INTEGER,
      total_cupons_usados: Sequelize.INTEGER,
      total_receita_gerada: Sequelize.DECIMAL,
      avaliacao: Sequelize.DECIMAL,
      criado_por: Sequelize.INTEGER,
    }, {
      sequelize,
      modelName: 'Parceiro',
      tableName: 'parceiros',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Cidade, { foreignKey: 'cidade_id', as: 'cidade' });
      this.belongsTo(models.Users, { foreignKey: 'criado_por', as: 'criador' });
      this.hasMany(models.Cupom, { foreignKey: 'parceiro_id', as: 'cupons' });
      this.hasMany(models.TransacoesReceita, { foreignKey: 'parceiro_id', as: 'transacoes' });
  }
}

module.exports = Parceiro;
