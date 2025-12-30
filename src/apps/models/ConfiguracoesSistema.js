'use strict';
const { Model, Sequelize } = require('sequelize');

class ConfiguracoesSistema extends Model {
  
  static init(sequelize) {
    super.init({
      chave_configuracao: Sequelize.STRING,
      valor_configuracao: Sequelize.TEXT,
      tipo_dado: Sequelize.ENUM('booleano', 'inteiro', 'string', 'json'),
      categoria: Sequelize.STRING,
      descricao: Sequelize.TEXT,
      e_publico: Sequelize.BOOLEAN,
      atualizado_por: Sequelize.INTEGER,
    }, {
      sequelize,
      modelName: 'ConfiguracoesSistema',
      tableName: 'configuracoes_sistema',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Users, { foreignKey: 'atualizado_por', as: 'atualizador' });
  }
}

module.exports = ConfiguracoesSistema;
