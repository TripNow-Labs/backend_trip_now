'use strict';
const { Model, Sequelize } = require('sequelize');

class Conquista extends Model {
  
  static init(sequelize) {
    super.init({
      nome: Sequelize.STRING,
      descricao: Sequelize.TEXT,
      icone: Sequelize.STRING,
      tipo_requisito: Sequelize.STRING,
      valor_requisito: Sequelize.INTEGER,
    }, {
      sequelize,
      modelName: 'Conquista',
      tableName: 'conquistas',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }
  
  static associate(models) {
      this.hasMany(models.ConquistasUsuario, { foreignKey: 'conquista_id', as: 'conquistasUsuario' });
      this.belongsToMany(models.Users, {
        through: models.ConquistasUsuario,
        foreignKey: 'conquista_id',
        otherKey: 'user_id',
        as: 'usuarios',
      });
    }
}

module.exports = Conquista;
