'use strict';
const { Model, Sequelize } = require('sequelize');

class LogsAtividades extends Model {
  
  static init(sequelize) {
    super.init({
      user_id: Sequelize.INTEGER,
      tipo_acao: Sequelize.STRING,
      tipo_entidade: Sequelize.STRING,
      entidade_id: Sequelize.INTEGER,
      descricao: Sequelize.TEXT,
      metadados: Sequelize.JSON,
      endereco_ip: Sequelize.STRING,
      user_agent: Sequelize.TEXT,
    }, {
      sequelize,
      modelName: 'LogsAtividades',
      tableName: 'logs_atividades',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
  }
}

module.exports = LogsAtividades;
