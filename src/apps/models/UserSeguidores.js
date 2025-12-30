'use strict';
const { Model, Sequelize } = require('sequelize'); // Alterado

class UserSeguidores extends Model {
  
  // Alterado: init recebe apenas 'sequelize'
  static init(sequelize) {
    super.init({
      // 'id' removido (será automático)
      
      seguidor_id: Sequelize.INTEGER, // Simplificado
      seguido_id: Sequelize.INTEGER, // Simplificado
      
      // 'criado_em' removido (controlado por timestamps)
    }, {
      sequelize,
      modelName: 'UserSeguidores',
      tableName: 'user_seguidores',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }

  static associate(models) {
      // Alterado: Usando 'this'
      this.belongsTo(models.Users, { foreignKey: 'seguidor_id', as: 'seguidor' });
      this.belongsTo(models.Users, { foreignKey: 'seguido_id', as: 'seguido' });
  }
}

module.exports = UserSeguidores;
