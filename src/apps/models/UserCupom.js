'use strict';
const { Model, Sequelize } = require('sequelize'); // Alterado

class UserCupom extends Model {
  
  // Alterado: init recebe apenas 'sequelize'
  static init(sequelize) {
    super.init({
      // 'id' removido (será automático)
      
      user_id: Sequelize.INTEGER, // Simplificado
      cupom_id: Sequelize.INTEGER, // Simplificado
      roteiro_id: Sequelize.INTEGER, // Simplificado
      
      // 'usado_em' removido (controlado por timestamps)
    }, {
      sequelize,
      modelName: 'UserCupom',
      tableName: 'user_cupons',
      timestamps: true,
      createdAt: 'usado_em', // O Sequelize vai criar 'usado_em'
      updatedAt: false
    });
    return this;
  }

  static associate(models) {
      // Alterado: Usando 'this'
      this.belongsTo(models.Users, { foreignKey: 'user_id', as: 'usuario' });
      this.belongsTo(models.Cupom, { foreignKey: 'cupom_id', as: 'cupom' });
      this.belongsTo(models.Roteiro, { foreignKey: 'roteiro_id', as: 'roteiro' });
    }
}

module.exports = UserCupom;
