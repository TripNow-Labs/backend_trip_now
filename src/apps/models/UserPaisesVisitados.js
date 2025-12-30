'use strict';
const { Model, Sequelize } = require('sequelize'); // Alterado

class UserPaisesVisitados extends Model {
  
  // Alterado: init recebe apenas 'sequelize'
  static init(sequelize) {
    super.init({
      // 'id' removido (será automático)
      
      user_id: Sequelize.INTEGER, // Simplificado
      pais_id: Sequelize.INTEGER, // Simplificado
      visitado_em: Sequelize.DATEONLY, // Simplificado
      
    }, {
      sequelize,
      modelName: 'UserPaisesVisitados',
      tableName: 'user_paises_visitados',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: false,
    });
    return this;
  }
  
  static associate(models) {
      // Alterado: Usando 'this'
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
      this.belongsTo(models.Pais, { foreignKey: 'pais_id', as: 'pais' });
  }
}

module.exports = UserPaisesVisitados;
