'use strict';
const { Model, Sequelize } = require('sequelize');

class ConquistasUsuario extends Model {
  
  static init(sequelize) {
    super.init({
      user_id: Sequelize.INTEGER,
      conquista_id: Sequelize.INTEGER,
    }, {
      sequelize,
      modelName: 'ConquistasUsuario',
      tableName: 'conquistas_usuario',
      timestamps: true,
      createdAt: 'desbloqueado_em',
      updatedAt: false
    });
    return this;
  }
  
  static associate(models) {
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
      this.belongsTo(models.Conquista, { foreignKey: 'conquista_id', as: 'conquista' });
  }
}

module.exports = ConquistasUsuario;
