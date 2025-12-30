'use strict';
const { Model, Sequelize } = require('sequelize');

class Relatorios extends Model {
  
  static init(sequelize) {
    super.init({
      gerado_por: Sequelize.INTEGER,
      tipo_relatorio: Sequelize.STRING,
      titulo: Sequelize.STRING,
      descricao: Sequelize.TEXT,
      inicio_periodo: Sequelize.DATEONLY,
      fim_periodo: Sequelize.DATEONLY,
      filtros: Sequelize.JSON,
      url_arquivo: Sequelize.TEXT,
      formato_arquivo: Sequelize.STRING,
      status: Sequelize.ENUM('pendente', 'processando', 'concluido', 'falhou'),
    }, {
      sequelize,
      modelName: 'Relatorios',
      tableName: 'relatorios',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }

  static associate(models) {
      this.belongsTo(models.Users, { foreignKey: 'gerado_por', as: 'gerador' });
  }
}

module.exports = Relatorios;
